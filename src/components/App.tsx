import { MIXPANEL_TOKEN } from "../main";
import { isValidAPIKey } from "../utils/apikey";
import { Column, Row } from "../utils/chakra";
import {
  API_KEY_LOCAL_STORAGE_KEY,
  DEFAULT_SETTINGS,
  FIT_VIEW_SETTINGS,
  MODEL_SETTINGS_LOCAL_STORAGE_KEY,
  REACT_FLOW_NODE_TYPES,
  REACT_FLOW_LOCAL_STORAGE_KEY,
  TOAST_CONFIG,
  SAVED_CHAT_SIZE_LOCAL_STORAGE_KEY,
} from "../utils/constants";
import { useDebouncedEffect } from "../utils/debounce";
import { newFluxEdge } from "../utils/fluxEdge";
import {
  getFluxNode,
  newFluxNode,
  appendTextToFluxNodeAsGPT,
  getFluxNodeLineage,
  modifyFluxNodeText,
  markOnlyNodeAsSelected,
  getConnectionAllowed,
  checkIfTerminal,
} from "../utils/fluxNode";
import { useLocalStorage } from "../utils/lstore";
import { getAvailableChatModels } from "../utils/models";
import { generateNodeId, generateStreamId } from "../utils/nodeId";
import {
  cotMessageFromNode,
  evalMessageFromNode,
  messageFromNode,
  parseAndCompute,
} from "../utils/prompt";
import { resetURL } from "../utils/qparams";
import { useDebouncedWindowResize } from "../utils/resize";
import { ToTNodeData, FluxNodeType, Settings } from "../utils/types";
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
import { treeDemo } from "./tree";
import { getFluxNodeColor } from "../utils/color";

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

  // Auto restore on load.
  useEffect(() => {
    if (reactFlow) {
      // const rawFlow = undefined;

      // const flow: ReactFlowJsonObject = rawFlow ? JSON.parse(rawFlow) : null;
      const flow: ReactFlowJsonObject = treeDemo;

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
        }
      }

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
    const temp = settings.temp;
    const model = settings.model;
    const parentNode = selectedNodeLineage[0];
    const submittedNode = getFluxNode(nodes, parentNode.id)!;
    const streamId = generateStreamId();
    let foundTerminal = false;
    console.log("current node", submittedNode);

    const DECODER = new TextDecoder();

    const abortController = new AbortController();

    type SetNodes = React.Dispatch<React.SetStateAction<Node[]>>;
    type SetEdges = React.Dispatch<React.SetStateAction<Edge[]>>;

    const createNewNodeAndEdge = (
      baseX: number,
      numNewLines: number,
      offset: number,
      currentNode: Node,
      newFluxNode: (node: Partial<Node>) => Node,
      newFluxEdge: (node: Partial<Edge>) => Edge,
      setNodes: SetNodes,
      setEdges: SetEdges
    ) => {
      const totalWidth = offset * 3;
      const startX = baseX - totalWidth / 2;
      const newX = startX + numNewLines * offset;
      const currentChildNodeId = generateNodeId();

      const newNode = newFluxNode({
        id: currentChildNodeId,
        x: newX,
        y: currentNode.position.y + 100,
        fluxNodeType: FluxNodeType.GPT,
        input: currentNode.data.input,
        text: "",
        streamId,
        steps: [...currentNode.data.steps, ""],
        style: { background: getFluxNodeColor(true, false, 0) },
      });

      console.log("new node", newNode);

      setNodes((prevNodes: Node[]) => [...prevNodes, newNode]);
      setEdges((prevEdges) => [
        ...prevEdges,
        newFluxEdge({
          source: currentNode.id,
          target: currentChildNodeId,
          animated: true,
        }),
      ]);

      return newNode;
    };

    const updateNodeColor = (nodeId: string, setNodes: SetNodes) => {
      setNodes((prevNodes: Node<ToTNodeData>[]) => {
        const newNodes = prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              style: {
                background: getFluxNodeColor(
                  false,
                  node.data.isTerminal,
                  node.data.score
                ),
              },
            };
          }
          return node;
        });
        return newNodes;
      });
    };

    const updatePreviousEdge = (currentChildNodeId: string, setEdges: SetEdges) => {
      setEdges((prevEdges: Edge[]) => {
        return prevEdges.map((edge) => {
          if (edge.target === currentChildNodeId) {
            return { ...edge, animated: false };
          }
          return edge;
        });
      });
    };

    // Function to update node with ID `nodeId` in the node array
    const updateNodeOutput = (nodeId: string, newOutput: string) => {
      setNodes((prevNodes: Node[]) => {
        return prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                text: node.data.text,
                label: node.data.text + "\n\n" + newOutput,
                output: newOutput, // This assumes 'output' is a field in the data object
              },
            };
          }
          return node;
        });
      });
    };

    async function getOutput(node: Node<ToTNodeData>): Promise<void> {
      const prompt = cotMessageFromNode(node);
      let output = "";
      const outputStream = await OpenAI(
        "chat",
        {
          model,
          temperature: temp,
          messages: prompt,
        },
        { apiKey: apiKey!, mode: "raw" }
      );
      for await (const chunk of yieldStream(outputStream, abortController)) {
        const decoded = JSON.parse(DECODER.decode(chunk));
        const choice = decoded.choices[0];
        if (choice.delta?.content) {
          const chars = choice.delta.content;
          output += chars;
        }
        updateNodeOutput(node.id!, output);
        // Handle aborting or breaking out of the loop if needed.
      }
      // implement stream, update output of node
    }

    const updateNodeEvals = (nodeId: string, newEvals: string[]) => {
      setNodes((prevNodes: Node[]) => {
        return prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                evals: newEvals,
              },
            };
          }
          return node;
        });
      });
    };

    const updateNodeScore = (nodeId: string, score: number) => {
      setNodes((prevNodes: Node[]) => {
        return prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: node.data.text + "\n\nScore: " + score.toFixed(1),
                score,
              },
            };
          }
          return node;
        });
      });
    };

    async function getEvals(
      node: Node<ToTNodeData>,
      N_EVAL: number
    ): Promise<{ evals: string[]; score: number }> {
      const prompt = evalMessageFromNode(node);
      let allEvals: string[] = [];

      await Promise.all(
        Array.from({ length: N_EVAL }).map(async (_, i) => {
          let evalOutput = "";
          const newStream = await OpenAI(
            "chat",
            {
              model,
              temperature: temp,
              messages: prompt,
            },
            { apiKey: apiKey!, mode: "raw" }
          );

          for await (const chunk of yieldStream(newStream, abortController)) {
            const decoded = JSON.parse(DECODER.decode(chunk));
            const choice = decoded.choices[0];
            if (choice.delta?.content) {
              const chars = choice.delta.content;
              evalOutput += chars;
            }

            if (!allEvals[i]) {
              allEvals[i] = "";
            }
            allEvals[i] = evalOutput;
            updateNodeEvals(node.id!, [...allEvals]);
          }
        })
      );
      const score = parseAndCompute(allEvals);
      updateNodeScore(node.id!, score);
      updateNodeColor(node.id!, setNodes);
      return { evals: allEvals, score };
    }

    async function handleFinishedNode(
      finishedNode: Node<ToTNodeData>
    ): Promise<Node<ToTNodeData>> {
      let modifiedNode = { ...finishedNode };
      const isTerminal = checkIfTerminal(finishedNode!);
      // node is terminal, solved problem
      if (isTerminal) {
        console.log("found terminal node");
        foundTerminal = true;
        setNodes((prevNodes: Node<ToTNodeData>[]) => {
          const newNodes = prevNodes.map((node) => {
            if (node.id === finishedNode?.id) {
              modifiedNode = {
                ...node,
                style: {
                  background: getFluxNodeColor(true, isTerminal, finishedNode.data.score),
                },
                data: {
                  ...node.data,
                  isTerminal: true,
                },
              };
              return modifiedNode;
            }
            return node;
          });
          return newNodes;
        });
        await getOutput(finishedNode!).catch((err) => console.error(err));
      } else {
        //updateNodeValidity(currentChildNodeId!);
        console.log("getting eval output");
        const { evals, score } = await getEvals(finishedNode!, 3).catch((err) => {
          console.error(err);
          return { evals: [], score: 0 }; // default values in case of an error
        });

        modifiedNode.data = {
          ...modifiedNode.data,
          evals,
          score,
        };
      }

      updateNodeColor(finishedNode?.id!, setNodes);
      updatePreviousEdge(finishedNode?.id!, setEdges);

      return modifiedNode;
    }

    async function generateChildren(node: Node): Promise<Node<ToTNodeData>[]> {
      console.log("new streamId", streamId);
      let numNewLines = 0;
      let isFirstNode = true;
      const newChildren: Node[] = [];

      const stream = await OpenAI(
        "chat",
        {
          model,
          temperature: temp,
          messages: messageFromNode(node),
        },
        { apiKey: apiKey!, mode: "raw" }
      );
      let handlePromises = []; // Collect promises here

      for await (const chunk of yieldStream(stream, abortController)) {
        if (abortController.signal.aborted) break;

        try {
          const decoded = JSON.parse(DECODER.decode(chunk));
          const choice = decoded.choices[0];

          if (choice.delta?.content) {
            const chars = choice.delta.content;
            console.log("got these chars", chars);

            // new node
            if (isFirstNode || chars.endsWith("\n")) {
              if (!isFirstNode) {
                currentText += chars;
                console.log("point A, this is currentText", currentText);
                setNodes((prevNodes: Node<ToTNodeData>[]) => {
                  return appendTextToFluxNodeAsGPT(prevNodes, {
                    id: currentChildNode?.id!,
                    text: currentText,
                    streamId,
                  });
                });

                const promise: Promise<Node<ToTNodeData>> = handleFinishedNode(
                  currentChildNode!
                );
                handlePromises.push(promise);
                if (
                  currentChildNode!.data.isTerminal &&
                  currentChildNode!.data.isTerminal
                ) {
                  foundTerminal = true;
                  return newChildren;
                }
              }

              currentChildNode = createNewNodeAndEdge(
                node.position.x,
                numNewLines,
                180,
                node,
                newFluxNode,
                newFluxEdge,
                setNodes,
                setEdges
              );
              isFirstNode = false;
              numNewLines++;
              currentText = chars;
            } else {
              currentText += chars;
            }

            setNodes((prevNodes: Node<ToTNodeData>[]) => {
              return appendTextToFluxNodeAsGPT(prevNodes, {
                id: currentChildNode?.id!,
                text: currentText,
                streamId,
              });
            });

            if (chars.endsWith("\n")) {
              currentText = "";
            }

            // We cannot return within the loop, and we do
            // not want to execute the code below, so we break.
            if (abortController.signal.aborted) break;
          }
        } catch (err) {
          console.error(err);
        }
      }

      const finalHandlePromise = handleFinishedNode(currentChildNode!);
      handlePromises.push(finalHandlePromise);
      const finishedNodes = await Promise.all(handlePromises);
      newChildren.push(...finishedNodes);
      if (currentChildNode!.data.isTerminal && currentChildNode!.data.isTerminal) {
        foundTerminal = true;
        return newChildren;
      }
      return newChildren;
    }

    let currentText = "";
    let currentChildNode: Node<ToTNodeData> | null = null;

    // TODO: N_BEST usually 5, but 3 makes more sense to me for speed, 4th best or 5th best probably bad
    const N_BEST = 10; // max nodes in queue TODO
    //const N_STEPS = 2; // how many times to go through queue again

    let queue: Node<ToTNodeData>[] = [submittedNode];

    let currentNode = queue.shift(); // Pop the first node from the queue

    while (currentNode && !foundTerminal) {
      const generatedChildren: Node<ToTNodeData>[] = await generateChildren(currentNode);
      console.log("generated children", generatedChildren);

      queue.push(...generatedChildren);
      queue.sort((a, b) => b.data.score - a.data.score);
      queue = queue.slice(0, N_BEST);
      currentNode = queue.shift(); // Pop the next node
      console.log("checking foundTerminal", foundTerminal);
      autoZoomIfNecessary();
    }

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

  /*//////////////////////////////////////////////////////////////
                      NODE SELECTION CALLBACKS
  //////////////////////////////////////////////////////////////*/

  const selectNode = (
    id: string,
    computeNewNodes?: (currNodes: Node<ToTNodeData>[]) => Node<ToTNodeData>[]
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

  // useEffect(() => {
  //   console.log("Nodes have been updated:", nodes);
  // }, [nodes]);

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
              selectNode={selectNode}
              lineage={selectedNodeLineage}
              submitPrompt={submitPrompt}
              onPromptType={(text: string) => {
                setNodes((nodes) =>
                  modifyFluxNodeText(nodes, {
                    asHuman: true,
                    id: selectedNodeId!,
                    text,
                    isRunning: false,
                  })
                );
              }}
              apiKey={apiKey}
              nodes={nodes}
              edges={edges}
            />
          </Box>
        </Row>
      </Column>
    </>
  );
}

export default App;
