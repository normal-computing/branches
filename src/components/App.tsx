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
  layoutTree,
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
  explanationMessage,
  humanEvalMessageFromNode,
  regenMessage,
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
import HUMAN_EVAL_PROBLEMS from "../utils/human_eval_problems.json";

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

  const [filteredNodes, setFilteredNodes] = useState([]);
  const [showAnswerPathOnly, setShowAnswerPathOnly] = useState(false);

  const [inputTokenCount, setInputTokenCount] = useState(0);
  const [outputTokenCount, setOutputTokenCount] = useState(0);

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

    console.log("current node", submittedNode);

    type SetNodes = React.Dispatch<React.SetStateAction<Node[]>>;
    type SetEdges = React.Dispatch<React.SetStateAction<Edge[]>>;

    const createNewNodeAndEdge = (
      currentNode: Node,
      newFluxNode: (node: Partial<Node>) => Node,
      newFluxEdge: (node: Partial<Edge>) => Edge,
      setNodes: SetNodes,
      setEdges: SetEdges,
      streamId: string
    ) => {
      const currentChildNodeId = generateNodeId();

      const newNode = newFluxNode({
        id: currentChildNodeId,
        x: currentNode.position.x + 10, // initially set x to parent's x (adjustNodePositions will handle final x)
        y: currentNode.position.y + 100,
        fluxNodeType: FluxNodeType.GPT,
        input: currentNode.data.input,
        text: "",
        streamId,
        steps: [...currentNode.data.steps, ""],
        style: { background: getFluxNodeColor(false, true, false, 0) },
      });

      setNodes((prevNodes: Node[]) => [...prevNodes, newNode]);
      setEdges((prevEdges) => [
        ...prevEdges,
        newFluxEdge({
          source: currentNode.id,
          target: currentChildNodeId,
          animated: true,
        }),
      ]);

      setEdges((prevEdges) => {
        setNodes((prevNodes) => {
          // Identify the root node. Assuming it's the first in the list for this example.
          const rootNode = prevNodes[0];

          // Adjust positions
          layoutTree(rootNode, prevNodes, prevEdges);

          // Since layoutTree modifies the tree in-place, the prevNodes array should now be updated.
          return [...prevNodes]; // Return a shallow copy to trigger re-render
        });
        return [...prevEdges]; // Return a shallow copy if you've made adjustments to edges, otherwise just return prevEdges
      });

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
                  false,
                  node.data.isTerminal,
                  node.data.error == null,
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

    function countTokens(text: string): number {
      // Use a regular expression to split the string on whitespace characters
      const tokens = text.split(/\s+/);

      // Filter out any empty strings that may have been generated by the split
      const nonEmptyTokens = tokens.filter((token) => token.length > 0);

      return nonEmptyTokens.length;
    }

    const addError = (nodeId: string, error: any, setNodes: SetNodes) => {
      setNodes((prevNodes: Node<ToTNodeData>[]) => {
        const newNodes = prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                error: error, // Add the error to the node data
              },
            };
          }
          return node;
        });
        return newNodes;
      });
    };

    // async function createExplanationNode(node: Node<ToTNodeData>) {
    //   generateChild(node);
    //   let ex_prompt = error2explanation(q1, answer, jsonResponse.result.result);
    //   let explanation = (await llm(ex_prompt, 1)) as string;
    //   console.log(explanation);
    //   let ans_prompt = explanation2code(
    //     q1,
    //     answer,
    //     jsonResponse.result.result,
    //     explanation
    //   );
    //   let re_ans = (await llm(ans_prompt, 1)) as string;
    //   console.log(re_ans);
    // }

    async function executeInterpreter(node: Node<ToTNodeData>) {
      let data = {
        problem: HUMAN_EVAL_PROBLEMS[node.data.input],
        completion: node.data.steps[0],
      };

      console.log("node completion", node.data.steps[0]);
      console.log("data", JSON.stringify(data));

      // Sending a POST request to the server
      let url = "http://127.0.0.1:5000/execute"; // Replace with your server's URL
      let response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "true",
        },
        body: JSON.stringify(data),
      });

      // Parse JSON response
      let jsonResponse = await response.json();
      console.log("json response", jsonResponse);

      const passed = jsonResponse["result"]["passed"];
      console.log("passed", passed);

      if (passed) {
        handleFinishedNode(node, true);
      } else {
        const error = jsonResponse["result"]["result"];
        addError(node.id, error, setNodes);
        updateNodeColor(node.id, setNodes);
        const explanationNode = await generateChild(node, "explanation", error);
        const regenNode = await generateChild(explanationNode, "regen", error);
      }
    }

    async function handleFinishedNode(
      finishedNode: Node<ToTNodeData>,
      isTerminal: boolean
    ): Promise<Node<ToTNodeData>> {
      let modifiedNode = { ...finishedNode };
      if (isTerminal) {
        console.log("found terminal node");
        setNodes((prevNodes: Node<ToTNodeData>[]) => {
          const newNodes = prevNodes.map((node) => {
            if (node.id === finishedNode?.id) {
              modifiedNode = {
                ...node,
                style: {
                  background: getFluxNodeColor(
                    false,
                    false,
                    isTerminal,
                    true,
                    finishedNode.data.score
                  ),
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
      }

      updateNodeColor(finishedNode?.id!, setNodes);
      updatePreviousEdge(finishedNode?.id!, setEdges);

      return modifiedNode;
    }

    async function generateChild(
      node: Node,
      nodeType: string,
      error: string
    ): Promise<Node<ToTNodeData>> {
      const DECODER = new TextDecoder();

      const abortController = new AbortController();

      const streamId = generateStreamId();
      console.log("new stream id", streamId);
      let isNewNode = true;

      const question = HUMAN_EVAL_PROBLEMS[node.data.input]["prompt"];
      let answer = node.data.steps[0];
      console.log("this is the node we're generating from", node);
      let explanation = "";
      if (nodeType == "regen") {
        explanation = node.data.steps[1];
      }

      const messages =
        nodeType == "explanation"
          ? explanationMessage(question, answer, error)
          : nodeType == "regen"
          ? regenMessage(question, answer, error, explanation)
          : humanEvalMessageFromNode(node);
      const newInputTokens = countTokens(messages[0]["content"]);
      setInputTokenCount((prevCount) => prevCount + newInputTokens);

      const stream = await OpenAI(
        "chat",
        {
          model,
          temperature: temp,
          messages,
        },
        { apiKey: apiKey!, mode: "raw" }
      );
      let currentText: string = "";
      let currentChildNode: Node<ToTNodeData> | null = null;

      for await (const chunk of yieldStream(stream, abortController)) {
        if (abortController.signal.aborted) break;

        try {
          const decoded = JSON.parse(DECODER.decode(chunk));
          const choice = decoded.choices[0];

          if (choice.delta?.content) {
            const chars = choice.delta.content;
            const newTokens = countTokens(chars);
            setOutputTokenCount((prevCount) => prevCount + newTokens);

            // new node
            if (isNewNode) {
              currentChildNode = createNewNodeAndEdge(
                node,
                newFluxNode,
                newFluxEdge,
                setNodes,
                setEdges,
                streamId
              );
              isNewNode = false;
            }
            currentText += chars;

            setNodes((prevNodes: Node<ToTNodeData>[]) => {
              return appendTextToFluxNodeAsGPT(prevNodes, {
                id: currentChildNode?.id!,
                text: currentText,
                streamId,
              });
            });

            // We cannot return within the loop, and we do
            // not want to execute the code below, so we break.
            if (abortController.signal.aborted) break;
          }
        } catch (err) {
          console.error(err);
        }
      }

      const finalChild: Node<ToTNodeData> = await handleFinishedNode(
        currentChildNode!,
        false
      );
      return finalChild;
    }

    const N_ANSWER_FANOUT = 10; // TODO: can be adjusted

    const promises = Array(N_ANSWER_FANOUT)
      .fill(null)
      .map(async () => {
        return await generateChild(submittedNode, "normal", "");
      });

    const children = await Promise.all(promises);
    children.forEach(executeInterpreter);

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

  useEffect(() => {
    const updatedNodes: Node[] = nodes.filter((node) => node.data?.isInAnswerPath);
    setFilteredNodes(updatedNodes);
  }, [nodes]);

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
                  onToggleAnswerFilter={() => {
                    setShowAnswerPathOnly(!showAnswerPathOnly);
                  }}
                  showAnswerPathOnly={showAnswerPathOnly}
                />

                <Box>
                  <p>Input Token Count: {inputTokenCount}</p>
                </Box>

                <Box>
                  <p>Output Token Count: {outputTokenCount}</p>
                </Box>

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
                nodes={showAnswerPathOnly ? filteredNodes : nodes}
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
