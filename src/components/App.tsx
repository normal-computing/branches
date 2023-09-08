import { MIXPANEL_TOKEN } from "../main";
import { isValidAPIKey } from "../utils/apikey";
import { Column, Row } from "../utils/chakra";
import {
  API_KEY_LOCAL_STORAGE_KEY,
  DEFAULT_SETTINGS,
  FIT_VIEW_SETTINGS,
  MODEL_SETTINGS_LOCAL_STORAGE_KEY,
  NEW_TREE_CONTENT_QUERY_PARAM,
  OVERLAP_RANDOMNESS_MAX,
  REACT_FLOW_NODE_TYPES,
  REACT_FLOW_LOCAL_STORAGE_KEY,
  TOAST_CONFIG,
  UNDEFINED_RESPONSE_STRING,
  STREAM_CANCELED_ERROR_MESSAGE,
  SAVED_CHAT_SIZE_LOCAL_STORAGE_KEY,
} from "../utils/constants";
import { useDebouncedEffect } from "../utils/debounce";
import { newFluxEdge, modifyFluxEdge, addFluxEdge } from "../utils/fluxEdge";
import {
  getFluxNode,
  getFluxNodeGPTChildren,
  newFluxNode,
  appendTextToFluxNodeAsGPT,
  getFluxNodeLineage,
  addFluxNode,
  modifyFluxNodeText,
  getFluxNodeChildren,
  markOnlyNodeAsSelected,
  addUserNodeLinkedToASystemNode,
  getConnectionAllowed,
  setFluxNodeStreamId,
} from "../utils/fluxNode";
import { useLocalStorage } from "../utils/lstore";
import { getAvailableChatModels } from "../utils/models";
import { generateNodeId, generateStreamId } from "../utils/nodeId";
import { messagesFromLineage } from "../utils/prompt";
import { getQueryParam, resetURL } from "../utils/qparams";
import { useDebouncedWindowResize } from "../utils/resize";
import {
  FluxNodeData,
  FluxNodeType,
  Settings,
  CreateChatCompletionStreamResponseChoicesInner,
} from "../utils/types";
import { NodeInfo } from "./NodeInfo";
import { APIKeyModal } from "./modals/APIKeyModal";
import { SettingsModal } from "./modals/SettingsModal";
import { NavigationBar } from "./utils/NavigationBar";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { Box, useDisclosure, Spinner, useToast } from "@chakra-ui/react";
import mixpanel from "mixpanel-browser";
import { OpenAI } from "openai-streams";
import { Resizable } from "re-resizable";
import { useEffect, useState, useCallback, useRef } from "react";
import { useBeforeunload } from "react-beforeunload";

import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Node,
  Edge,
  useEdgesState,
  useNodesState,
  SelectionMode,
  ReactFlowInstance,
  ReactFlowJsonObject,
  useReactFlow,
  updateEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { yieldStream } from "yield-stream";
import { treeDemo, treeAnswerDemo } from "./tree";

function App() {
  const toast = useToast();

  /*//////////////////////////////////////////////////////////////
                        CORE REACT FLOW LOGIC
  //////////////////////////////////////////////////////////////*/

  const { setViewport, fitView } = useReactFlow();

  const [reactFlow, setReactFlow] = useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const edgeUpdateSuccessful = useRef(true);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = (oldEdge: Edge<any>, newConnection: Connection) => {
    if (
      !getConnectionAllowed(nodes, edges, {
        source: newConnection.source!,
        target: newConnection.target!,
      })
    )
      return;

    edgeUpdateSuccessful.current = true;

    setEdges((edges) => updateEdge(oldEdge, newConnection, edges));
  };

  const onEdgeUpdateEnd = (_: unknown, edge: Edge<any>) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((edges) => edges.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  };

  const onConnect = (connection: Edge<any> | Connection) => {
    if (
      !getConnectionAllowed(nodes, edges, {
        source: connection.source!,
        target: connection.target!,
      })
    )
      return;

    setEdges((eds) => addEdge({ ...connection }, eds));
  };

  const autoZoom = () => setTimeout(() => fitView(FIT_VIEW_SETTINGS), 50);

  const autoZoomIfNecessary = () => {
    if (settings.autoZoom) autoZoom();
  };

  const save = () => {
    if (reactFlow) {
      localStorage.setItem(
        REACT_FLOW_LOCAL_STORAGE_KEY,
        JSON.stringify(reactFlow.toObject())
      );
    }
  };

  // Auto save.
  const isSavingReactFlow = useDebouncedEffect(
    save,
    1000, // 1 second.
    [reactFlow, nodes, edges]
  );

  const [filterAnwser, setFilterAnswer] = useState<boolean>(false);

  // Auto restore on load.
  useEffect(() => {
    if (reactFlow) {
      // const rawFlow = undefined;

      // const flow: ReactFlowJsonObject = rawFlow ? JSON.parse(rawFlow) : null;
      const flow: ReactFlowJsonObject = filterAnwser ? treeAnswerDemo : treeDemo;

      // Get the content of the newTreeWith query param.
      const content = getQueryParam(NEW_TREE_CONTENT_QUERY_PARAM);

      if (flow !== null) {
        setEdges(flow.edges || []);
        setViewport(flow.viewport);

        const nodes = flow.nodes; // For brevity.

        if (nodes.length > 0) {
          // Either the first selected node we find, or the first node in the array.
          const toSelect = nodes.find((node) => node.selected)?.id ?? nodes[0].id;

          // Add the nodes to the React Flow array and select the node.
          selectNode(toSelect, () => nodes);

          // If there was a newTreeWith query param, create a new tree with that content.
          // We pass false for forceAutoZoom because we'll do it 500ms later to avoid lag.
          if (content) newUserNodeLinkedToANewSystemNode(content, false);
        } else newUserNodeLinkedToANewSystemNode(content, false); // Create a new node if there are none.
      } else newUserNodeLinkedToANewSystemNode(content, false); // Create a new node if there are none.

      setTimeout(() => {
        // Do this with a more generous timeout to make sure
        // the nodes are rendered and the settings have loaded in.
        if (settings.autoZoom) fitView(FIT_VIEW_SETTINGS);
      }, 500);

      resetURL(); // Get rid of the query params.
    }
  }, [reactFlow]);

  /*//////////////////////////////////////////////////////////////
                          AI PROMPT CALLBACKS
  //////////////////////////////////////////////////////////////*/

  // Takes a prompt, submits it to the GPT API with n responses,
  // then creates a child node for each response under the selected node.
  const submitPrompt = async () => {
    const responses = settings.n;
    const temp = settings.temp;
    const model = settings.model;

    const parentNodeLineage = selectedNodeLineage;
    const parentNode = selectedNodeLineage[0];

    const newNodes = [...nodes];

    const currentNode = getFluxNode(newNodes, parentNode.id)!;
    const currentNodeChildren = getFluxNodeGPTChildren(newNodes, edges, parentNode.id);

    const streamId = generateStreamId();

    let firstCompletionId: string | undefined;

    // Update newNodes, adding new child nodes as needed
    for (let i = 0; i < responses; i++) {
      const id = generateNodeId();

      if (i === 0) firstCompletionId = id;

      // Otherwise, we'll create a new node.
      newNodes.push(
        newFluxNode({
          id,
          // Position it 50px below the current node, offset
          // horizontally according to the number of responses
          // such that the middle response is right below the current node.
          // Note that node x y coords are the top left corner of the node,
          // so we need to offset by at the width of the node (150px).
          x:
            (currentNodeChildren.length > 0
              ? // If there are already children we want to put the
                // next child to the right of the furthest right one.
                currentNodeChildren.reduce((prev, current) =>
                  prev.position.x > current.position.x ? prev : current
                ).position.x +
                (responses / 2) * 180 +
                90
              : currentNode.position.x) +
            (i - (responses - 1) / 2) * 180,
          // Add OVERLAP_RANDOMNESS_MAX of randomness to the y position so that nodes don't overlap.
          y: currentNode.position.y + 100 + Math.random() * OVERLAP_RANDOMNESS_MAX,
          fluxNodeType: FluxNodeType.GPT,
          text: "",
          streamId,
        })
      );
    }

    if (firstCompletionId === undefined) throw new Error("No first completion id!");

    (async () => {
      const stream = await OpenAI(
        "chat",
        {
          model,
          n: responses,
          temperature: temp,
          messages: messagesFromLineage(parentNodeLineage, settings),
        },
        { apiKey: apiKey!, mode: "raw" }
      );

      const DECODER = new TextDecoder();

      const abortController = new AbortController();

      for await (const chunk of yieldStream(stream, abortController)) {
        if (abortController.signal.aborted) break;

        try {
          const decoded = JSON.parse(DECODER.decode(chunk));

          if (decoded.choices === undefined)
            throw new Error(
              "No choices in response. Decoded response: " + JSON.stringify(decoded)
            );

          const choice: CreateChatCompletionStreamResponseChoicesInner =
            decoded.choices[0];

          if (choice.index === undefined)
            throw new Error(
              "No index in choice. Decoded choice: " + JSON.stringify(choice)
            );

          const correspondingNodeId =
            newNodes[newNodes.length - responses + choice.index].id;

          // The ChatGPT API will start by returning a
          // choice with only a role delta and no content.
          if (choice.delta?.content) {
            setNodes((newerNodes) => {
              try {
                return appendTextToFluxNodeAsGPT(newerNodes, {
                  id: correspondingNodeId,
                  text: choice.delta?.content ?? UNDEFINED_RESPONSE_STRING,
                  streamId, // This will cause a throw if the streamId has changed.
                });
              } catch (e: any) {
                // If the stream id does not match,
                // it is stale and we should abort.
                abortController.abort(e.message);

                return newerNodes;
              }
            });
          }

          // We cannot return within the loop, and we do
          // not want to execute the code below, so we break.
          if (abortController.signal.aborted) break;

          // If the choice has a finish reason, then it's the final
          // choice and we can mark it as no longer animated right now.
          if (choice.finish_reason !== null) {
            // Reset the stream id.
            setNodes((nodes) =>
              setFluxNodeStreamId(nodes, { id: correspondingNodeId, streamId: undefined })
            );

            setEdges((edges) =>
              modifyFluxEdge(edges, {
                source: parentNode.id,
                target: correspondingNodeId,
                animated: false,
              })
            );
          }
        } catch (err) {
          console.error(err);
        }
      }

      // If the stream wasn't aborted or was aborted due to a cancelation.
      if (
        !abortController.signal.aborted ||
        abortController.signal.reason === STREAM_CANCELED_ERROR_MESSAGE
      ) {
        // Mark all the edges as no longer animated.
        for (let i = 0; i < responses; i++) {
          const correspondingNodeId = newNodes[newNodes.length - responses + i].id;

          // Reset the stream id.
          setNodes((nodes) =>
            setFluxNodeStreamId(nodes, { id: correspondingNodeId, streamId: undefined })
          );

          setEdges((edges) =>
            modifyFluxEdge(edges, {
              source: parentNode.id,
              target: correspondingNodeId,
              animated: false,
            })
          );
        }
      }
    })().catch((err) =>
      toast({
        title: err.toString(),
        status: "error",
        ...TOAST_CONFIG,
      })
    );

    setNodes(markOnlyNodeAsSelected(newNodes, firstCompletionId!));

    setSelectedNodeId(firstCompletionId);

    setEdges((edges) => {
      let newEdges = [...edges];

      for (let i = 0; i < responses; i++) {
        // Update the links between
        // re-used nodes if necessary.
        // The new nodes are added to the end of the array, so we need to
        // subtract responses from and add i to length of the array to access.
        const childId = newNodes[newNodes.length - responses + i].id;

        // Otherwise, add a new edge.
        newEdges.push(
          newFluxEdge({
            source: parentNode.id,
            target: childId,
            animated: true,
          })
        );
      }

      return newEdges;
    });

    autoZoomIfNecessary();

    if (MIXPANEL_TOKEN) mixpanel.track("Submitted Prompt"); // KPI
  };

  /*//////////////////////////////////////////////////////////////
                          SELECTED NODE LOGIC
  //////////////////////////////////////////////////////////////*/

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNodeLineage =
    selectedNodeId !== null ? getFluxNodeLineage(nodes, edges, selectedNodeId) : [];

  /*//////////////////////////////////////////////////////////////
                        NODE MUTATION CALLBACKS
  //////////////////////////////////////////////////////////////*/

  const newUserNodeLinkedToANewSystemNode = (
    text: string | null = "",
    forceAutoZoom: boolean = true
  ) => {
    const systemId = generateNodeId();
    const userId = generateNodeId();

    selectNode(userId, (nodes) =>
      addUserNodeLinkedToASystemNode(
        nodes,
        settings.defaultPreamble,
        text,
        systemId,
        userId
      )
    );

    setEdges((edges) =>
      addFluxEdge(edges, {
        source: systemId,
        target: userId,
        animated: false,
      })
    );

    if (forceAutoZoom) autoZoom();

    if (MIXPANEL_TOKEN) mixpanel.track("New conversation tree created");
  };

  const newConnectedToSelectedNode = (type: FluxNodeType) => {
    const selectedNode = getFluxNode(nodes, selectedNodeId!);

    if (selectedNode) {
      const selectedNodeChildren = getFluxNodeChildren(nodes, edges, selectedNodeId!);

      const id = generateNodeId();

      selectNode(id, (nodes) =>
        addFluxNode(nodes, {
          id,
          x:
            selectedNodeChildren.length > 0
              ? // If there are already children we want to put the
                // next child to the right of the furthest right one.
                selectedNodeChildren.reduce((prev, current) =>
                  prev.position.x > current.position.x ? prev : current
                ).position.x + 180
              : selectedNode.position.x,
          // Add OVERLAP_RANDOMNESS_MAX of randomness to
          // the y position so that nodes don't overlap.
          y: selectedNode.position.y + 100 + Math.random() * OVERLAP_RANDOMNESS_MAX,
          fluxNodeType: type,
          text: "",
        })
      );

      setEdges((edges) =>
        addFluxEdge(edges, {
          source: selectedNodeId!,
          target: id,
          animated: false,
        })
      );

      autoZoomIfNecessary();

      if (type === FluxNodeType.User) {
        if (MIXPANEL_TOKEN) mixpanel.track("New user node created");
      } else {
        if (MIXPANEL_TOKEN) mixpanel.track("New system node created");
      }
    }
  };

  /*//////////////////////////////////////////////////////////////
                      NODE SELECTION CALLBACKS
  //////////////////////////////////////////////////////////////*/

  const selectNode = (
    id: string,
    computeNewNodes?: (currNodes: Node<FluxNodeData>[]) => Node<FluxNodeData>[]
  ) => {
    setSelectedNodeId(id);
    setNodes((currNodes) =>
      // If we were passed a computeNewNodes function, use it, otherwise just use the current nodes.
      markOnlyNodeAsSelected(computeNewNodes ? computeNewNodes(currNodes) : currNodes, id)
    );
  };

  /*//////////////////////////////////////////////////////////////
                         SETTINGS MODAL LOGIC
  //////////////////////////////////////////////////////////////*/

  const {
    isOpen: isSettingsModalOpen,
    onOpen: onOpenSettingsModal,
    onClose: onCloseSettingsModal,
  } = useDisclosure();

  const [settings, setSettings] = useState<Settings>(() => {
    const rawSettings = localStorage.getItem(MODEL_SETTINGS_LOCAL_STORAGE_KEY);

    if (rawSettings !== null) {
      return JSON.parse(rawSettings) as Settings;
    } else {
      return DEFAULT_SETTINGS;
    }
  });

  const isGPT4 = settings.model.includes("gpt-4");

  // Auto save.
  const isSavingSettings = useDebouncedEffect(
    () => {
      localStorage.setItem(MODEL_SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(settings));
    },
    1000, // 1 second.
    [settings]
  );

  /*//////////////////////////////////////////////////////////////
                            API KEY LOGIC
  //////////////////////////////////////////////////////////////*/

  const [apiKey, setApiKey] = useLocalStorage<string>(API_KEY_LOCAL_STORAGE_KEY);

  const [availableModels, setAvailableModels] = useState<string[] | null>(null);

  // modelsLoadCounter lets us discard the results of the requests if a concurrent newer one was made.
  const modelsLoadCounter = useRef(0);
  useEffect(() => {
    if (isValidAPIKey(apiKey)) {
      const modelsLoadIndex = modelsLoadCounter.current + 1;
      modelsLoadCounter.current = modelsLoadIndex;

      setAvailableModels(null);

      (async () => {
        let modelList: string[] = [];
        try {
          modelList = await getAvailableChatModels(apiKey!);
        } catch (e) {
          toast({
            title: "Failed to load model list!",
            status: "error",
            ...TOAST_CONFIG,
          });
        }
        if (modelsLoadIndex !== modelsLoadCounter.current) return;

        if (modelList.length === 0) modelList.push(settings.model);

        setAvailableModels(modelList);

        if (!modelList.includes(settings.model)) {
          const oldModel = settings.model;
          const newModel = modelList.includes(DEFAULT_SETTINGS.model)
            ? DEFAULT_SETTINGS.model
            : modelList[0];

          setSettings((settings) => ({ ...settings, model: newModel }));

          toast({
            title: `Model "${oldModel}" no longer available!`,
            description: `Switched to "${newModel}"`,
            status: "warning",
            ...TOAST_CONFIG,
          });
        }
      })();
    }
  }, [apiKey]);

  const isAnythingSaving = isSavingReactFlow || isSavingSettings;
  const isAnythingLoading = isAnythingSaving || availableModels === null;

  useBeforeunload((event: BeforeUnloadEvent) => {
    // Prevent leaving the page before saving.
    if (isAnythingSaving) event.preventDefault();
  });

  /*//////////////////////////////////////////////////////////////
                        WINDOW RESIZE LOGIC
  //////////////////////////////////////////////////////////////*/

  useDebouncedWindowResize(autoZoomIfNecessary, 100);

  /*//////////////////////////////////////////////////////////////
                        CHAT RESIZE LOGIC
  //////////////////////////////////////////////////////////////*/

  const [savedChatSize, setSavedChatSize] = useLocalStorage<string>(
    SAVED_CHAT_SIZE_LOCAL_STORAGE_KEY
  );

  /*//////////////////////////////////////////////////////////////
                              APP
  //////////////////////////////////////////////////////////////*/

  return (
    <>
      {!isValidAPIKey(apiKey) && <APIKeyModal apiKey={apiKey} setApiKey={setApiKey} />}

      <SettingsModal
        settings={settings}
        setSettings={setSettings}
        isOpen={isSettingsModalOpen}
        onClose={onCloseSettingsModal}
        apiKey={apiKey}
        setApiKey={setApiKey}
        availableModels={availableModels}
      />
      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        height="100vh"
        width="100%"
      >
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="stretch" expand>
          <Resizable
            maxWidth="75%"
            minWidth="15%"
            defaultSize={{
              // Defaults to the previously used chat size if it exists.
              width: savedChatSize || "50%",
              height: "auto",
            }}
            enable={{
              top: false,
              right: true,
              bottom: false,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
            }}
            onResizeStop={(_, __, ref) => {
              setSavedChatSize(ref.style.width);
              autoZoomIfNecessary();

              if (MIXPANEL_TOKEN) mixpanel.track("Resized chat window");
            }}
          >
            <Column
              mainAxisAlignment="center"
              crossAxisAlignment="center"
              borderRightColor="#EEEEEE"
              borderRightWidth="1px"
              expand
            >
              <Row
                mainAxisAlignment="space-between"
                crossAxisAlignment="center"
                width="100%"
                height="50px"
                px="20px"
                borderBottomColor="#EEEEEE"
                borderBottomWidth="1px"
              >
                <NavigationBar
                  onOpenSettingsModal={() => {
                    onOpenSettingsModal();

                    if (MIXPANEL_TOKEN) mixpanel.track("Opened Settings Modal"); // KPI
                  }}
                />

                <Box ml="20px">
                  {isAnythingLoading ? (
                    <Spinner size="sm" mt="6px" color={"#404040"} />
                  ) : (
                    <CheckCircleIcon color={"#404040"} />
                  )}
                </Box>
              </Row>

              <ReactFlow
                proOptions={{ hideAttribution: true }}
                nodes={nodes}
                maxZoom={1.5}
                minZoom={0}
                edges={edges}
                onInit={setReactFlow}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onEdgeUpdateStart={onEdgeUpdateStart}
                onEdgeUpdate={onEdgeUpdate}
                onEdgeUpdateEnd={onEdgeUpdateEnd}
                onConnect={onConnect}
                nodeTypes={REACT_FLOW_NODE_TYPES}
                // Causes clicks to also trigger auto zoom.
                // onNodeDragStop={autoZoomIfNecessary}
                onSelectionDragStop={autoZoomIfNecessary}
                selectionKeyCode={null}
                multiSelectionKeyCode="Shift"
                panActivationKeyCode="Shift"
                deleteKeyCode={null}
                panOnDrag={false}
                selectionOnDrag={true}
                zoomOnScroll={false}
                zoomActivationKeyCode={null}
                panOnScroll={true}
                selectionMode={SelectionMode.Partial}
                onNodeClick={(_, node) => {
                  setSelectedNodeId(node.id);
                }}
              >
                <Background />
              </ReactFlow>
            </Column>
          </Resizable>

          <Box height="100%" width="100%" overflowY="scroll" p={4}>
            <NodeInfo
              settings={settings}
              setSettings={setSettings}
              selectNode={selectNode}
              isGPT4={isGPT4}
              newConnectedToSelectedNode={newConnectedToSelectedNode}
              lineage={selectedNodeLineage}
              submitPrompt={submitPrompt}
              onPromptType={(text: string) => {
                setNodes((nodes) =>
                  modifyFluxNodeText(nodes, {
                    asHuman: true,
                    id: selectedNodeId!,
                    text,
                  })
                );
              }}
              onCreateNewConversation={() => newUserNodeLinkedToANewSystemNode()}
              apiKey={apiKey}
            />
          </Box>
        </Row>
      </Column>
    </>
  );
}

export default App;
