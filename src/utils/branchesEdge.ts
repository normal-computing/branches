import { Edge } from "reactflow";

/*//////////////////////////////////////////////////////////////
                          CONSTRUCTORS
//////////////////////////////////////////////////////////////*/

export function newBranchesEdge({
  source,
  target,
  animated,
}: {
  source: string;
  target: string;
  animated: boolean;
}): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    animated,
  };
}

/*//////////////////////////////////////////////////////////////
                          TRANSFORMERS
//////////////////////////////////////////////////////////////*/

export function addBranchesEdge(
  existingEdges: Edge[],
  { source, target, animated }: { source: string; target: string; animated: boolean }
): Edge[] {
  const newEdge = newBranchesEdge({ source, target, animated });

  return [...existingEdges, newEdge];
}

export function modifyBranchesEdge(
  existingEdges: Edge[],
  { source, target, animated }: { source: string; target: string; animated: boolean }
): Edge[] {
  return existingEdges.map((edge) => {
    if (edge.id !== `${source}-${target}`) return edge;

    const copy = { ...edge };

    copy.animated = animated;

    return copy;
  });
}
