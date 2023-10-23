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
  evalMessageFromText,
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
import useExpandCollapse from "./nodes/useExpandCollapse";
import useAnimatedNodes from "./nodes/useAnimatedNodes";

import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Node,
  Edge,
  NodeMouseHandler,
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

  const treeWidth: number = 300;
  const treeHeight: number = 150;
  const animationDuration: number = 200;

  const { nodes: visibleNodes, edges: visibleEdges } = useExpandCollapse(nodes, edges, {
    treeWidth,
    treeHeight,
  });
  const { nodes: animatedNodes } = useAnimatedNodes(visibleNodes, { animationDuration });

  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
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
    const streamId = generateStreamId();
    let foundTerminal = false;
    console.log("current node", submittedNode);

    const DECODER = new TextDecoder();

    const abortController = new AbortController();

    type SetNodes = React.Dispatch<React.SetStateAction<Node[]>>;
    type SetEdges = React.Dispatch<React.SetStateAction<Edge[]>>;
    type FluxNodeInput = {
      id?: string;
      x: number;
      y: number;
      fluxNodeType: FluxNodeType;
      input: string;
      text: string;
      streamId?: string;
      steps: string[];
      style: any;
    };
    type FluxEdgeInput = {
      source: string;
      target: string;
      animated: boolean;
    }

    const createNewNodeAndEdge = (
      currentNode: Node,
      newFluxNode: (node: FluxNodeInput) => Node,
      newFluxEdge: (node: FluxEdgeInput) => Edge,
      setNodes: SetNodes,
      setEdges: SetEdges
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

      autoZoomIfNecessary();

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
                  node.data.isTerminal || false,
                  node.data.score || 0
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
                output: newOutput, // This assumes 'output' is a field in the data object,
                isTerminal: true,
                isRunning: true,
              },
              style: {
                background: getFluxNodeColor(false, true, true, 0),
              },
            };
          }
          return node;
        });
      });
    };

    const markAsAnswerPath = (
      targetNodeId: string,
      setNodes: SetNodes,
      setEdges: SetEdges
    ) => {
      setEdges((prevEdges) => {
        const edges = [...prevEdges]; // Make a shallow copy for reference
        console.log("Edges are:", edges);

        setNodes((prevNodes) => {
          const markNodeAndAncestors = (nodeId: string, nodes: Node<ToTNodeData>[]) => {
            let updatedNodes: Node<ToTNodeData>[] = [];

            const nodeToUpdate = nodes.find((node) => node.id === nodeId);
            if (nodeToUpdate) {
              const updatedNode = {
                ...nodeToUpdate,
                data: { ...nodeToUpdate.data, isInAnswerPath: true },
              };
              updatedNodes.push(updatedNode);
            }

            edges.forEach((edge) => {
              if (edge.target === nodeId) {
                updatedNodes = [
                  ...updatedNodes,
                  ...markNodeAndAncestors(edge.source, nodes),
                ];
              }
            });

            return updatedNodes;
          };

          const nodesToUpdate = markNodeAndAncestors(targetNodeId, prevNodes);
          return prevNodes.map((node) => {
            const nodeToUpdate = nodesToUpdate.find((n) => n.id === node.id);
            return nodeToUpdate || node;
          });
        });

        return edges; // return the edges as-is since we're not modifying them
      });
    };

    async function getOutput(node: Node<ToTNodeData>, text: string): Promise<void> {
      const answerNode = createNewNodeAndEdge(
        node,
        newFluxNode,
        newFluxEdge,
        setNodes,
        setEdges
      );

      const messages = cotMessageFromNode(node, text);
      const newInputTokens = countTokens(messages[0]["content"]);
      setInputTokenCount((prevCount) => prevCount + newInputTokens);
      let output = "";
      const outputStream = await OpenAI(
        "chat",
        {
          model,
          temperature: temp,
          messages,
        },
        { apiKey: apiKey!, mode: "raw" }
      );
      for await (const chunk of yieldStream(outputStream, abortController)) {
        const decoded = JSON.parse(DECODER.decode(chunk));
        const choice = decoded.choices[0];
        if (choice.delta?.content) {
          const chars = choice.delta.content;
          output += chars;
          const newTokens = countTokens(chars);
          setOutputTokenCount((prevCount) => prevCount + newTokens);
        }
        markAsAnswerPath(answerNode.id!, setNodes, setEdges);
        updateNodeOutput(answerNode.id!, output);
        // Handle aborting or breaking out of the loop if needed.
      }
      setNodes((prevNodes: Node[]) => {
        return prevNodes.map((node) => {
          if (node.id === answerNode.id!) {
            return {
              ...node,
              data: {
                ...node.data,
                isRunning: false,
                isTerminal: true,
              },
              style: {
                background: getFluxNodeColor(true, false, true, 0),
              },
            };
          }
          return node;
        });
      });
      updatePreviousEdge(answerNode.id!, setEdges);
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
      N_EVAL: number,
      text: string
    ): Promise<{ evals: string[]; score: number }> {
      const messages = evalMessageFromText(text);
      const newInputTokens = countTokens(messages[0]["content"]);
      setInputTokenCount((prevCount) => prevCount + newInputTokens);
      let allEvals: string[] = [];

      await Promise.all(
        Array.from({ length: N_EVAL }).map(async (_, i) => {
          let evalOutput = "";
          const newStream = await OpenAI(
            "chat",
            {
              model,
              temperature: temp,
              messages,
            },
            { apiKey: apiKey!, mode: "raw" }
          );

          for await (const chunk of yieldStream(newStream, abortController)) {
            const decoded = JSON.parse(DECODER.decode(chunk));
            const choice = decoded.choices[0];
            if (choice.delta?.content) {
              const chars = choice.delta.content;
              evalOutput += chars;
              const newTokens = countTokens(chars);
              setOutputTokenCount((prevCount) => prevCount + newTokens);
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
      finishedNode: Node<ToTNodeData>,
      text: string
    ): Promise<Node<ToTNodeData>> {
      let modifiedNode = { ...finishedNode };
      const isTerminal = checkIfTerminal(text);
      // node is terminal, solved problem
      const { evals, score } = await getEvals(finishedNode!, 3, text).catch((err) => {
        console.error(err);
        return { evals: [], score: 0 }; // default values in case of an error
      });
      modifiedNode.data = {
        ...modifiedNode.data,
        evals,
        score,
      };
      if (isTerminal) {
        console.log("found terminal node");
        foundTerminal = true;
        setNodes((prevNodes: Node<ToTNodeData>[]) => {
          const newNodes = prevNodes.map((node) => {
            if (node.id === finishedNode?.id) {
              modifiedNode = {
                ...node,
                style: {
                  background: getFluxNodeColor(
                    false,
                    true,
                    isTerminal,
                    finishedNode.data.score || 0
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

        await getOutput(finishedNode!, text).catch((err) => console.error(err));
      }

      updateNodeColor(finishedNode?.id!, setNodes);
      updatePreviousEdge(finishedNode?.id!, setEdges);

      return modifiedNode;
    }

    async function generateChildren(node: Node): Promise<Node<ToTNodeData>[]> {
      console.log("new streamId", streamId);
      let numNewLines = 0;
      let isFirstNode = true;
      const newChildren: Node<ToTNodeData>[] = [];

      const messages = messageFromNode(node);
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
      let handlePromises: Promise<Node<ToTNodeData>>[] = []; // Collect promises here
      let prevText: string = "";
      let finalText: string = "";

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
            if (isFirstNode || chars.endsWith("\n")) {
              if (!isFirstNode) {
                currentText += chars;
                const prevNode = currentChildNode;
                prevText = currentText;
                setNodes((prevNodes: Node<ToTNodeData>[]) => {
                  return appendTextToFluxNodeAsGPT(prevNodes, {
                    id: prevNode?.id!,
                    text: prevText,
                    streamId,
                  });
                });

                const promise: Promise<Node<ToTNodeData>> = handleFinishedNode(
                  prevNode!,
                  prevText
                );
                handlePromises.push(promise);

                if (prevNode?.data.isTerminal) {
                  foundTerminal = true;
                  return newChildren;
                }
              }

              currentChildNode = createNewNodeAndEdge(
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

            finalText = currentText;

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

      const finalHandlePromise: Promise<Node<ToTNodeData>> = handleFinishedNode(
        currentChildNode!,
        finalText
      );
      handlePromises.push(finalHandlePromise);
      const finishedNodes = await Promise.all(handlePromises);
      newChildren.push(...finishedNodes);
      if (currentChildNode!.data.isTerminal && currentChildNode!.data.isTerminal) {
        foundTerminal = true;
        return newChildren;
      }
      return newChildren;
    }

    async function generateLevelChildren(nodes: Node[]): Promise<Node<ToTNodeData>[]> {
      try {
        const flattenedChildren: Node<ToTNodeData>[] = [];

        for (const node of nodes) {
          const children = await generateChildren(node);
          flattenedChildren.push(...children);
        }

        return flattenedChildren;
      } catch (error) {
        console.error("Error generating level children: ", error);
        return [];
      }
    }

    let currentText = "";
    let currentChildNode: Node<ToTNodeData> | null = null;

    // TODO: N_BEST usually 5, but 3 makes more sense to me for speed, 4th best or 5th best probably bad
    const N_BEST = 10; // max nodes in queue TODO
    //const N_STEPS = 2; // how many times to go through queue again

    let currentNodes: Node<ToTNodeData>[] = [submittedNode];
    let step = 0;
    const N_STEP = submittedNode.data.input.split(/\s+/).length - 1; // TODO: this is just the number of nodes
    const K = 4;

    while (currentNodes.some((node) => !node.data.isTerminal) && step < N_STEP) {
      const nonTerminalNodes = currentNodes.filter((node) => !node.data.isTerminal);
      nonTerminalNodes.sort((a, b) => (b.data.score || 0) - (a.data.score || 0));
      const topKNodes = nonTerminalNodes.slice(0, K);
      if (topKNodes.length === 0) break;

      const levelChildren: Node<ToTNodeData>[] = await generateLevelChildren(topKNodes);
      currentNodes = levelChildren;

      autoZoomIfNecessary();
      step++;
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

  useEffect(() => {
    console.log("Nodes have been updated:", nodes);
  }, [nodes]);

  useEffect(() => {
    const updatedNodes: Node[] = animatedNodes.filter(
      (node) => node.data?.isInAnswerPath
    );
    setFilteredNodes(updatedNodes);
    console.log("new filtered nodes", filteredNodes);
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

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id);
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: { ...n.data, expanded: !n.data.expanded },
            };
          }

          return n;
        })
      );
    },
    [setNodes]
  );

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
                proOptions={{ account: "paid-pro", hideAttribution: true }}
                nodes={showAnswerPathOnly ? filteredNodes : animatedNodes}
                edges={visibleEdges}
                maxZoom={1.5}
                minZoom={0}
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
                onNodeClick={onNodeClick}
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
