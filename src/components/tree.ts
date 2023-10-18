import { Node } from "reactflow";
import { ToTNodeData, FluxNodeType } from "../utils/types";

export const treeDemoNodes: Node[] = [
  {
    id: "0",
    position: { x: 0, y: 0 },
    data: {
      id: "0",
      parent_id: "",
      input: "HumanEval/4",
      steps: [],
      solutions: [],
      output: "",
      label: "HumanEval/4",
      score: 60,
      evals: "",
      isValid: true,
      isTerminal: false,
      errors: [],
      explanations: [],
      expandable: true,
      expanded: true,
    },
  },
];

export const treeDemoEdges = [];

function processNode(node: Node): Node<ToTNodeData> {
  const data = { ...node.data } as ToTNodeData;
  if (data.fluxNodeType == null) {
    data.fluxNodeType = FluxNodeType.GPT;
  }
  // if (data.text == null) {
  //   data.text = '';
  // }
  if (!Array.isArray(data.evals)) {
    data.evals = [];
  }
  data.text = data.steps.join("\n") + "\n" + data.evals.join("\n") + "\n" + data.label;
  let color = "#f7d0a1";
  if (data.isValid) {
    color = "#d9f3d6";
  }
  if (data.isTerminal) {
    color = "rgb(233, 216, 253)";
  }

  return {
    ...node,
    height: 38,
    width: 150,
    selected: false,
    style: {
      outline: data.isTerminal ? "1px dashed #f7d0a1" : "",
      background: color,
    },
    data,
  };
}

export const treeDemo = {
  nodes: treeDemoNodes.map(processNode),
  edges: treeDemoEdges,
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },
};
