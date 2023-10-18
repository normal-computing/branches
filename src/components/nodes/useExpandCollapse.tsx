import { useMemo } from "react";
import { Node, Edge, XYPosition } from "reactflow";
import { HierarchyNode, HierarchyPointNode, stratify, tree } from "d3-hierarchy";
import { ToTNodeData } from "../../utils/types";

type ExpandCollapseNode = Node<ToTNodeData>;

export type UseExpandCollapseOptions = {
  layoutNodes?: boolean;
  treeWidth?: number;
  treeHeight?: number;
};

function isHierarchyPointNode(
  pointNode: HierarchyNode<ExpandCollapseNode> | HierarchyPointNode<ExpandCollapseNode>
): pointNode is HierarchyPointNode<ExpandCollapseNode> {
  return (
    typeof (pointNode as HierarchyPointNode<ExpandCollapseNode>).x === "number" &&
    typeof (pointNode as HierarchyPointNode<ExpandCollapseNode>).y === "number"
  );
}

function useExpandCollapse(
  nodes: Node[],
  edges: Edge[],
  { layoutNodes = true, treeWidth = 220, treeHeight = 100 }: UseExpandCollapseOptions = {} // TODO: make layout true
): { nodes: Node[]; edges: Edge[] } {
  return useMemo(() => {
    if (nodes.length === 0) {
      return { nodes: [], edges: [] };
    }

    const hierarchy = stratify<ExpandCollapseNode>()
      .id((d) => d.id)
      .parentId((d: Node) => {
        const parent_id = edges.find((e: Edge) => e.target === d.id)?.source;
        return parent_id || null; // returns null if parent_id is an empty string or undefined
      })(nodes);

    hierarchy.descendants().forEach((d) => {
      d.data.data.expandable = !!d.children?.length;
      d.children = d.data.data.expanded ? d.children : undefined;
    });

    const layout = tree<ExpandCollapseNode>()
      .nodeSize([treeWidth, treeHeight])
      .separation(() => 1);

    const root = layoutNodes ? layout(hierarchy) : hierarchy;

    return {
      nodes: root.descendants().map((d) => ({
        ...d.data,
        // This bit is super important! We *mutated* the object in the `forEach`
        // above so the reference is the same. React needs to see a new reference
        // to trigger a re-render of the node.
        data: { ...d.data.data },
        type: "default",
        position: isHierarchyPointNode(d) ? { x: d.x, y: d.y } : d.data.position,
      })),
      edges: edges.filter(
        (edge) =>
          root.find((h) => h.id === edge.source) && root.find((h) => h.id === edge.target)
      ),
    };
  }, [nodes, edges, layoutNodes, treeWidth, treeHeight]);
}

export default useExpandCollapse;
