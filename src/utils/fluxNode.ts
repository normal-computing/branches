import { Node, Edge } from "reactflow";

import { STALE_STREAM_ERROR_MESSAGE, STREAM_CANCELED_ERROR_MESSAGE } from "./constants";
import { FluxNodeType, ToTNodeData, ReactFlowNodeTypes } from "./types";
import { getFluxNodeColor } from "./color";
import { generateNodeId } from "./nodeId";
import { formatAutoLabel, getCurrentNumbers } from "./prompt";

/*//////////////////////////////////////////////////////////////
                         CONSTRUCTORS
//////////////////////////////////////////////////////////////*/

export function newFluxNode({
  id,
  x,
  y,
  fluxNodeType,
  input,
  text,
  streamId,
  steps,
  style,
}: {
  id?: string;
  x: number;
  y: number;
  fluxNodeType: FluxNodeType;
  input: string;
  text: string;
  streamId?: string;
  steps: string[];
  style: any;
}): Node<ToTNodeData> {
  return {
    id: id ?? generateNodeId(),
    position: { x, y },
    style: {
      background: style.background,
    },
    data: {
      label: text,
      fluxNodeType,
      input,
      steps,
      streamId,
      text,
    },
  };
}

/*//////////////////////////////////////////////////////////////
                         TRANSFORMERS
//////////////////////////////////////////////////////////////*/

export function modifyReactFlowNodeProperties(
  existingNodes: Node<ToTNodeData>[],
  {
    id,
    type,
    draggable,
  }: { id: string; type: ReactFlowNodeTypes | undefined; draggable: boolean }
): Node<ToTNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    const copy = { ...node, data: { ...node.data }, type, draggable };

    return copy;
  });
}

export function modifyFluxNodeText(
  existingNodes: Node<ToTNodeData>[],
  { asHuman, id, text }: { asHuman: boolean; id: string; text: string }
): Node<ToTNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    const copy = { ...node, data: { ...node.data } };

    copy.data.text = text;
    copy.data.input = text;
    copy.data.label = text;

    // If the node's fluxNodeType is GPT and we're changing
    // it as a human then its type becomes GPT + Human.
    if (asHuman && copy.data.fluxNodeType === FluxNodeType.GPT) {
      copy.style = {
        ...copy.style,
        background: getFluxNodeColor(copy.data.isTerminal),
      };

      copy.data.fluxNodeType = FluxNodeType.TweakedGPT;
    }

    // Generate auto label based on prompt text, and preserve custom label
    if (!copy.data.hasCustomlabel) {
      copy.data.label = copy.data.text
        ? formatAutoLabel(copy.data.text)
        : displayNameFromFluxNodeType(copy.data.fluxNodeType);
    }

    return copy;
  });
}

export function modifyFluxNodeLabel(
  existingNodes: Node<ToTNodeData>[],
  { id, type, label }: { id: string; type?: FluxNodeType; label: string }
): Node<ToTNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    const copy = {
      ...node,
      data: { ...node.data, label, hasCustomlabel: true },
      type,
      draggable: undefined,
    };

    return copy;
  });
}

export function setFluxNodeStreamId(
  existingNodes: Node<ToTNodeData>[],
  { id, streamId }: { id: string; streamId: string | undefined }
) {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    return { ...node, data: { ...node.data, streamId } };
  });
}

export function checkIfTerminal(node: Node<ToTNodeData>): boolean {
  const currentNumbers = getCurrentNumbers(node.data.steps[node.data.steps.length - 1]);
  return currentNumbers === "24";
}

export function appendTextToFluxNodeAsGPT(
  existingNodes: Node<ToTNodeData>[],
  { id, text, streamId }: { id: string; text: string; streamId: string }
): Node<ToTNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    // If the node's streamId is now undefined, the stream has been canceled.
    if (node.data.streamId === undefined) throw new Error(STREAM_CANCELED_ERROR_MESSAGE);

    // If the node's streamId is not undefined but does
    // not match the provided id, the stream is now stale.
    if (node.data.streamId !== streamId) throw new Error(STALE_STREAM_ERROR_MESSAGE);

    const copy = { ...node, data: { ...node.data } };

    const isFirstToken = copy.data.text.length === 0;

    copy.data.text = text;
    copy.data.label = text;
    copy.data.steps[copy.data.steps.length - 1] = text;

    // Preserve custom labels
    if (copy.data.hasCustomlabel) return copy;

    // If label hasn't reached max length or it's a new prompt, set from text.
    // Once label reaches max length, truncate it.
    if (!copy.data.label.endsWith(" ...") || isFirstToken) {
      copy.data.label = formatAutoLabel(copy.data.text);
    }

    return copy;
  });
}

export function markOnlyNodeAsSelected(
  existingNodes: Node<ToTNodeData>[],
  id: string
): Node<ToTNodeData>[] {
  return existingNodes.map((node) => {
    return { ...node, selected: node.id === id };
  });
}

/*//////////////////////////////////////////////////////////////
                            GETTERS
//////////////////////////////////////////////////////////////*/

export function getFluxNode(
  nodes: Node<ToTNodeData>[],
  id: string
): Node<ToTNodeData> | undefined {
  return nodes.find((node) => node.id === id);
}

export function getFluxNodeChildren(
  existingNodes: Node<ToTNodeData>[],
  existingEdges: Edge[],
  id: string
) {
  return existingNodes.filter(
    (node) => getFluxNodeParent(existingNodes, existingEdges, node.id)?.id === id
  );
}

export function getFluxNodeParent(
  existingNodes: Node<ToTNodeData>[],
  existingEdges: Edge[],
  id: string
): Node<ToTNodeData> | undefined {
  let edge: Edge | undefined;

  // We iterate in reverse to ensure we don't try to route
  // through a stale (now hidden) edge to find the parent.
  for (let i = existingEdges.length - 1; i >= 0; i--) {
    const e = existingEdges[i];

    if (e.target === id) {
      edge = e;
      break;
    }
  }

  if (!edge) return;

  return existingNodes.find((node) => node.id === edge!.source);
}

// Get the lineage of the node,
// where index 0 is the node,
// index 1 is the node's parent,
// index 2 is the node's grandparent, etc.
// TODO: Eventually would be nice to have
// support for connecting multiple parents!
export function getFluxNodeLineage(
  existingNodes: Node<ToTNodeData>[],
  existingEdges: Edge[],
  id: string
): Node<ToTNodeData>[] {
  const lineage: Node<ToTNodeData>[] = [];

  let currentNode = getFluxNode(existingNodes, id);

  while (currentNode) {
    lineage.push(currentNode);

    currentNode = getFluxNodeParent(existingNodes, existingEdges, currentNode.id);
  }

  return lineage;
}

export function isFluxNodeInLineage(
  existingNodes: Node<ToTNodeData>[],
  existingEdges: Edge[],
  { nodeToCheck, nodeToGetLineageOf }: { nodeToCheck: string; nodeToGetLineageOf: string }
): boolean {
  const lineage = getFluxNodeLineage(existingNodes, existingEdges, nodeToGetLineageOf);

  return lineage.some((node) => node.id === nodeToCheck);
}

export function getConnectionAllowed(
  existingNodes: Node<ToTNodeData>[],
  existingEdges: Edge[],
  { source, target }: { source: string; target: string }
): boolean {
  return (
    // Check the lineage of the source node to make
    // sure we aren't creating a recursive connection.
    !isFluxNodeInLineage(existingNodes, existingEdges, {
      nodeToCheck: target,
      nodeToGetLineageOf: source,
      // Check if the target node already has a parent.
    }) && getFluxNodeParent(existingNodes, existingEdges, target) === undefined
  );
}

/*//////////////////////////////////////////////////////////////
                            RENDERERS
//////////////////////////////////////////////////////////////*/

export function displayNameFromFluxNodeType(
  fluxNodeType: FluxNodeType,
  isGPT4?: boolean
): string {
  switch (fluxNodeType) {
    case FluxNodeType.User:
      return "User";
    case FluxNodeType.GPT:
      return isGPT4 === undefined ? "GPT" : isGPT4 ? "GPT-4" : "GPT-3.5";
    case FluxNodeType.TweakedGPT:
      return displayNameFromFluxNodeType(FluxNodeType.GPT, isGPT4) + " (edited)";
    case FluxNodeType.System:
      return "System";
  }
}
