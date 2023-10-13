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
  solutions,
  style,
  errors,
  explanations,
}: {
  id?: string;
  x: number;
  y: number;
  fluxNodeType: FluxNodeType;
  input: string;
  text: string;
  streamId?: string;
  steps: string[];
  solutions?: string[];
  style: any;
  errors: string[];
  explanations: string[];
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
      errors,
      input,
      steps,
      solutions: solutions ?? [],
      explanations: explanations ?? [],
      streamId,
      text,
    },
  };
}

export function adjustNodePositions(nodes: Node[], edges: Edge[], spacing = 200) {
  if (nodes.length > 0) {
    nodes[0].position.x = 0;
    nodes[0].position.y = 0;
  }

  nodes.forEach((node) => {
    const children: Node<ToTNodeData>[] = getFluxNodeChildren(nodes, edges, node.id);
    if (children.length === 0) return;

    // Center children's x position relative to the parent node
    const width = (children.length - 1) * spacing;
    children.forEach((child, index) => {
      child.position.x = node.position.x - width / 2 + index * spacing;
      child.position.y = node.position.y + spacing;
    });

    children.forEach((child) => {
      let collidingNode;
      do {
        collidingNode = detectCollisionAndAdjust(child, nodes, edges, spacing);
      } while (collidingNode);
    });
  });

  return nodes;
}

function detectCollisionAndAdjust(
  node: Node,
  nodes: Node[],
  edges: Edge[],
  spacing: number
) {
  const collidingNode = nodes.find(
    (other) =>
      other.id !== node.id &&
      other.position.y === node.position.y &&
      Math.abs(other.position.x - node.position.x) < spacing
  );

  if (collidingNode) {
    const offset = spacing - Math.abs(collidingNode.position.x - node.position.x);
    const nodeAncestor = getFluxNodeParent(nodes, edges, node.id);
    const collidingNodeAncestor = getFluxNodeParent(nodes, edges, collidingNode.id);

    if (nodeAncestor)
      adjustAncestorPositions(nodeAncestor, offset / 2, nodes, edges, spacing);
    if (collidingNodeAncestor)
      adjustAncestorPositions(collidingNodeAncestor, -offset / 2, nodes, edges, spacing);
  }

  return collidingNode;
}

function adjustAncestorPositions(
  node: Node,
  offset: number,
  nodes: Node[],
  edges: Edge[],
  spacing: number
) {
  const parent = getFluxNodeParent(nodes, edges, node.id);
  if (!parent) return;

  const siblings = getFluxNodeSiblings(nodes, edges, parent.id, node.id);
  updateSubtreePosition(parent, offset, 0, nodes, edges);

  siblings.forEach((sibling) => {
    updateSubtreePosition(sibling, offset, 0, nodes, edges);
  });

  adjustAncestorPositions(parent, offset, nodes, edges, spacing);
}

function updateSubtreePosition(
  node: Node,
  offsetX: number,
  offsetY: number,
  nodes: Node[],
  edges: Edge[]
) {
  node.position.x += offsetX;
  node.position.y += offsetY;

  const children: Node[] = getFluxNodeChildren(nodes, edges, node.id);
  children.forEach((child) =>
    updateSubtreePosition(child, offsetX, offsetY, nodes, edges)
  );
}

// Assume Node has attributes position: {x: number, y: number}
export function layoutTree(
  root: Node,
  nodes: Node[],
  edges: Edge[],
  x = 0,
  y = 0,
  spacing = 200
) {
  // Assign position to the root
  root.position = { x, y };

  // Find the children of the root
  const children = getFluxNodeChildren(nodes, edges, root.id);

  // If no children, we are done
  if (children.length === 0) return;

  let subtreeWidths = new Array(children.length).fill(0);

  // First, recursively layout each subtree rooted at each child
  children.forEach((child, i) => {
    layoutTree(child, nodes, edges, 0, y + spacing, spacing);
    subtreeWidths[i] = getSubtreeWidth(child, nodes, edges, spacing);
  });

  // Calculate total width required for this level
  const totalWidth =
    subtreeWidths.reduce((a, b) => a + b, 0) + (children.length - 1) * spacing;

  // Center children relative to the root node
  let currentX = x - totalWidth / 2;

  children.forEach((child, i) => {
    // Align the subtree rooted at child to currentX
    const offsetX = currentX - child.position.x;
    updateSubtreePosition(child, offsetX, 0, nodes, edges);

    // Move to the next position
    currentX += subtreeWidths[i] + spacing;
  });
}

function getSubtreeWidth(
  root: Node,
  nodes: Node[],
  edges: Edge[],
  spacing: number
): number {
  const children = getFluxNodeChildren(nodes, edges, root.id);
  if (children.length === 0) return 0;

  let width = 0;
  children.forEach((child) => {
    width += getSubtreeWidth(child, nodes, edges, spacing) + spacing;
  });

  // We added one extra spacing, remove it
  return width - spacing;
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
  {
    asHuman,
    id,
    text,
    isRunning,
  }: { asHuman: boolean; id: string; text: string; isRunning: boolean }
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
        background: getFluxNodeColor(
          false,
          isRunning,
          copy.data.isTerminal,
          copy.data.score
        ),
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

export function checkIfTerminal(text: string): boolean {
  const currentNumbers = getCurrentNumbers(text);
  return currentNumbers === "24";
}

export function appendTextToFluxNodeAsGPT(
  existingNodes: Node<ToTNodeData>[],
  { id, text, streamId }: { id: string; text: string; streamId: string },
  isSolutionNode: boolean // Add this argument
): Node<ToTNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    if (node.data.streamId === undefined) throw new Error(STREAM_CANCELED_ERROR_MESSAGE);
    if (node.data.streamId !== streamId) throw new Error(STALE_STREAM_ERROR_MESSAGE);

    const copy = { ...node, data: { ...node.data } };
    const isFirstToken = copy.data.text.length === 0;

    copy.data.text = text;
    copy.data.label = text;
    copy.data.steps[copy.data.steps.length - 1] = text;

    // Update the last element in the solutions array if isSolutionNode is true
    if (isSolutionNode) {
      copy.data.solutions[copy.data.solutions.length - 1] = text;
    } else {
      copy.data.explanations[copy.data.explanations.length - 1] = text;
    }

    if (copy.data.hasCustomLabel) return copy;

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

export function getFluxNodeSiblings(
  existingNodes: Node<ToTNodeData>[],
  existingEdges: Edge[],
  parentId: string,
  nodeId: string
): Node<ToTNodeData>[] {
  // Fetch all children of the parent node
  const siblings = getFluxNodeChildren(existingNodes, existingEdges, parentId);

  // Filter out the node itself to get its siblings
  return siblings.filter((node) => node.id !== nodeId);
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
