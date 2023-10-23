import { Node, Edge } from "reactflow";

import { ChatCompletionResponseMessage } from "openai-streams";

type FluxNodeData = {
  label: string;
  fluxNodeType: FluxNodeType;
  text: string;
  streamId?: string;
  hasCustomlabel?: boolean;
};

// note: made some arguments optional here. if things break, could be my fault
export type ToTNodeData = FluxNodeData & {
  input: string;
  output?: string;
  score?: number;
  steps: string[];
  evals?: string[];
  expandable: boolean;
  expanded: boolean;
  isInAnswerPath?: boolean;
  isTerminal?: boolean;
  isValid?: boolean;
};

export enum FluxNodeType {
  System = "System",
  User = "User",
  GPT = "GPT",
  TweakedGPT = "GPT (tweaked)",
}

export type Settings = {
  defaultPreamble: string;
  autoZoom: boolean;
  model: string;
  temp: number;
  n: number;
};

export enum ReactFlowNodeTypes {
  LabelUpdater = "LabelUpdater",
}

// The stream response is weird and has a delta instead of message field.
export interface CreateChatCompletionStreamResponseChoicesInner {
  index?: number;
  delta?: ChatCompletionResponseMessage;
  finish_reason?: string;
}

export type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  lastSelectedNodeId: string | null;
};
