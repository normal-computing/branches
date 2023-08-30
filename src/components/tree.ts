import { Node, useReactFlow } from "reactflow";
import {
  FluxNodeData,
  FluxNodeType,
  HistoryItem,
  Settings,
  CreateChatCompletionStreamResponseChoicesInner,
  ReactFlowNodeTypes,
} from "../utils/types";

export type ToTNodeData = FluxNodeData & {
  input: string;
  output: string;
  score: number;
  evals: string[];
  isTerminal: boolean;
  isValid: boolean;
};

export const treeDemoNodes: Node[] = [{id: '0', position: {x: 0, y: 0}, data: {id: '0', parent_id: '', input: '1 1 11 11', steps: [], output: '', label: '1 1 11 11', score: '', evals: [], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0', position: {x: 0, y: 100}, data: {id: '0-0', parent_id: '0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)'], output: '', label: '1 + 11 = 12 (left: 1 11 12)', score: 40.001, evals: ['1 + 11 + 12 = 24\nsure', '1 * 11 * 12 = 132\n(1 + 11) * 12 = 144\n(12 - 11) * 1 = 1\nimpossible', '1 + 11 + 12 = 24\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1', position: {x: 200, y: 100}, data: {id: '0-1', parent_id: '0', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)'], output: '', label: '11 - 1 = 10 (left: 1 10 11)', score: 2.001, evals: ['1 * 10 * 11 = 110\n(11 - 10) * 1 = 1\n1 10 11 are all too big\nimpossible', '1 + 10 + 11 = 22\n10 * 11 - 1 = 109\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '1 * 10 + 11 = 10 + 11 = 21\n(10 - 1) + 11 = 9 + 11 = 20\n(11 - 10) * 1 = 1\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-2', position: {x: 400, y: 100}, data: {id: '0-2', parent_id: '0', input: '1 1 11 11', steps: ['11 / 1 = 11 (left: 1 11 11)'], output: '', label: '11 / 1 = 11 (left: 1 11 11)', score: 1.002, evals: ['(11 - 1) * 11 = 10 * 11 = 110\n(11 + 1) * 11 = 12 * 11 = 132\n1 11 11 are all too big\nimpossible', '(11 - 1) * 11 = 10 * 11 = 110\n1 + 11 + 11 = 23\n1 * 11 * 11 = 121\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '1 * 11 * 11 = 121\n(1 + 11) * 11 = 132\n1 11 11 are all too big\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-3', position: {x: 600, y: 100}, data: {id: '0-3', parent_id: '0', input: '1 1 11 11', steps: ['1 * 11 = 11 (left: 1 11 11)'], output: '', label: '1 * 11 = 11 (left: 1 11 11)', score: 1.002, evals: ['(11 - 1) * 11 = 10 * 11 = 110\n(11 + 1) * 11 = 12 * 11 = 132\n1 11 11 are all too big\nimpossible', '(11 - 1) * 11 = 10 * 11 = 110\n1 + 11 + 11 = 23\n1 * 11 * 11 = 121\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '1 * 11 * 11 = 121\n(1 + 11) * 11 = 132\n1 11 11 are all too big\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4', position: {x: 800, y: 100}, data: {id: '0-4', parent_id: '0', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)'], output: '', label: '11 + 1 = 12 (left: 1 11 12)', score: 40.001, evals: ['1 + 11 + 12 = 24\nsure', '1 * 11 * 12 = 132\n(1 + 11) * 12 = 144\n(12 - 11) * 1 = 1\nimpossible', '1 + 11 + 12 = 24\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-0', position: {x: 0, y: 200}, data: {id: '0-0-0', parent_id: '0-0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)'], output: '', label: '1 + 11 = 12 (left: 12 12)', score: 60.0, evals: ['12 + 12 = 24\nsure', '12 + 12 = 24\nsure', '12 + 12 = 24\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-1', position: {x: 200, y: 200}, data: {id: '0-0-1', parent_id: '0-0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)'], output: '', label: '11 + 1 = 12 (left: 12 12)', score: 60.0, evals: ['12 + 12 = 24\nsure', '12 + 12 = 24\nsure', '12 + 12 = 24\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-2', position: {x: 400, y: 200}, data: {id: '0-0-2', parent_id: '0-0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '12 - 1 = 11 (left: 11 11)'], output: '', label: '12 - 1 = 11 (left: 11 11)', score: 0.003, evals: ['11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-3', position: {x: 600, y: 200}, data: {id: '0-0-3', parent_id: '0-0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '12 / 1 = 12 (left: 11 12)'], output: '', label: '12 / 1 = 12 (left: 11 12)', score: 0.003, evals: ['11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible', '11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible', '11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-4', position: {x: 800, y: 200}, data: {id: '0-0-4', parent_id: '0-0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '11 - 1 = 10 (left: 10 12)'], output: '', label: '11 - 1 = 10 (left: 10 12)', score: 0.003, evals: ['10 + 12 = 22\n12 - 10 = 2\n10 * 12 = 120\n10 / 12 = 0.83\nimpossible', '10 + 12 = 22\n12 - 10 = 2\n10 * 12 = 120\n12 / 10 = 1.2\nimpossible', '10 + 12 = 22\n12 - 10 = 2\n10 * 12 = 120\n10 / 12 = 0.83\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-0', position: {x: 800, y: 200}, data: {id: '0-4-0', parent_id: '0-4', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)'], output: '', label: '1 + 11 = 12 (left: 12 12)', score: 60.0, evals: ['12 + 12 = 24\nsure', '12 + 12 = 24\nsure', '12 + 12 = 24\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-1', position: {x: 1000, y: 200}, data: {id: '0-4-1', parent_id: '0-4', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)'], output: '', label: '11 + 1 = 12 (left: 12 12)', score: 60.0, evals: ['12 + 12 = 24\nsure', '12 + 12 = 24\nsure', '12 + 12 = 24\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-2', position: {x: 1200, y: 200}, data: {id: '0-4-2', parent_id: '0-4', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '12 - 1 = 11 (left: 11 11)'], output: '', label: '12 - 1 = 11 (left: 11 11)', score: 0.003, evals: ['11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-3', position: {x: 1400, y: 200}, data: {id: '0-4-3', parent_id: '0-4', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '12 / 1 = 12 (left: 11 12)'], output: '', label: '12 / 1 = 12 (left: 11 12)', score: 0.003, evals: ['11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible', '11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible', '11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-4', position: {x: 1600, y: 200}, data: {id: '0-4-4', parent_id: '0-4', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '11 - 1 = 10 (left: 10 12)'], output: '', label: '11 - 1 = 10 (left: 10 12)', score: 0.003, evals: ['10 + 12 = 22\n12 - 10 = 2\n10 * 12 = 120\n10 / 12 = 0.83\nimpossible', '10 + 12 = 22\n12 - 10 = 2\n10 * 12 = 120\n12 / 10 = 1.2\nimpossible', '10 + 12 = 22\n12 - 10 = 2\n10 * 12 = 120\n10 / 12 = 0.83\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-0', position: {x: 200, y: 200}, data: {id: '0-1-0', parent_id: '0-1', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '1 + 10 = 11 (left: 11 11)'], output: '', label: '1 + 10 = 11 (left: 11 11)', score: 0.003, evals: ['11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-1', position: {x: 400, y: 200}, data: {id: '0-1-1', parent_id: '0-1', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '10 - 1 = 9 (left: 9 11)'], output: '', label: '10 - 1 = 9 (left: 9 11)', score: 0.003, evals: ['9 + 11 = 20\n9 - 11 = -2\n9 * 11 = 99\n9 / 11 = 0.81\nimpossible', '9 + 11 = 20\n9 - 11 = -2\n9 * 11 = 99\n9 / 11 = 0.81\nimpossible', '9 + 11 = 20\n9 - 11 = -2\n9 * 11 = 99\n9 / 11 = 0.81\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-2', position: {x: 600, y: 200}, data: {id: '0-1-2', parent_id: '0-1', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)'], output: '', label: '11 - 1 = 10 (left: 10 10)', score: 1.002, evals: ['10 + 10 = 20\n10 - 10 = 0\n10 * 10 = 100\n10 / 10 = 1\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '10 + 10 = 20\n10 * 10 = 100\n10 - 10 = 0\n10 / 10 = 1\nimpossible', '10 + 10 = 20\n10 - 10 = 0\n10 * 10 = 100\n10 / 10 = 1\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-3', position: {x: 800, y: 200}, data: {id: '0-1-3', parent_id: '0-1', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 / 1 = 11 (left: 10 11)'], output: '', label: '11 / 1 = 11 (left: 10 11)', score: 0.003, evals: ['10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.91\nimpossible', '10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.9\nimpossible', '10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.909\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-4', position: {x: 1000, y: 200}, data: {id: '0-1-4', parent_id: '0-1', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '10 * 1 = 10 (left: 10 11)'], output: '', label: '10 * 1 = 10 (left: 10 11)', score: 0.003, evals: ['10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.91\nimpossible', '10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.9\nimpossible', '10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.909\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-2-0', position: {x: 400, y: 200}, data: {id: '0-2-0', parent_id: '0-2', input: '1 1 11 11', steps: ['11 / 1 = 11 (left: 1 11 11)', '1 + 11 = 12 (left: 11 12)'], output: '', label: '1 + 11 = 12 (left: 11 12)', score: 0.003, evals: ['11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible', '11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible', '11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-2-1', position: {x: 600, y: 200}, data: {id: '0-2-1', parent_id: '0-2', input: '1 1 11 11', steps: ['11 / 1 = 11 (left: 1 11 11)', '11 - 1 = 10 (left: 10 11)'], output: '', label: '11 - 1 = 10 (left: 10 11)', score: 0.003, evals: ['10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.91\nimpossible', '10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.9\nimpossible', '10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.909\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-2-2', position: {x: 800, y: 200}, data: {id: '0-2-2', parent_id: '0-2', input: '1 1 11 11', steps: ['11 / 1 = 11 (left: 1 11 11)', '11 / 1 = 11 (left: 11 11)'], output: '', label: '11 / 1 = 11 (left: 11 11)', score: 0.003, evals: ['11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-2-3', position: {x: 1000, y: 200}, data: {id: '0-2-3', parent_id: '0-2', input: '1 1 11 11', steps: ['11 / 1 = 11 (left: 1 11 11)', '1 * 11 = 11 (left: 11 11)'], output: '', label: '1 * 11 = 11 (left: 11 11)', score: 0.003, evals: ['11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-3-0', position: {x: 600, y: 200}, data: {id: '0-3-0', parent_id: '0-3', input: '1 1 11 11', steps: ['1 * 11 = 11 (left: 1 11 11)', '1 + 11 = 12 (left: 11 12)'], output: '', label: '1 + 11 = 12 (left: 11 12)', score: 0.003, evals: ['11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible', '11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible', '11 + 12 = 23\n12 - 11 = 1\n11 * 12 = 132\n11 / 12 = 0.91\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-3-1', position: {x: 800, y: 200}, data: {id: '0-3-1', parent_id: '0-3', input: '1 1 11 11', steps: ['1 * 11 = 11 (left: 1 11 11)', '11 - 1 = 10 (left: 10 11)'], output: '', label: '11 - 1 = 10 (left: 10 11)', score: 0.003, evals: ['10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.91\nimpossible', '10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.9\nimpossible', '10 + 11 = 21\n10 - 11 = -1\n10 * 11 = 110\n10 / 11 = 0.909\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-3-2', position: {x: 1000, y: 200}, data: {id: '0-3-2', parent_id: '0-3', input: '1 1 11 11', steps: ['1 * 11 = 11 (left: 1 11 11)', '11 / 1 = 11 (left: 11 11)'], output: '', label: '11 / 1 = 11 (left: 11 11)', score: 0.003, evals: ['11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-3-3', position: {x: 1200, y: 200}, data: {id: '0-3-3', parent_id: '0-3', input: '1 1 11 11', steps: ['1 * 11 = 11 (left: 1 11 11)', '1 * 11 = 11 (left: 11 11)'], output: '', label: '1 * 11 = 11 (left: 11 11)', score: 0.003, evals: ['11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 * 11 = 121\n11 / 11 = 1\nimpossible', '11 + 11 = 22\n11 - 11 = 0\n11 * 11 = 121\n11 / 11 = 1\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-0-0', position: {x: 0, y: 300}, data: {id: '0-0-0-0', parent_id: '0-0-0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 / 12 = 1 (left: 1)'], output: '', label: '12 / 12 = 1 (left: 1)', score: 0.003, evals: ['1 is too far from 24\nimpossible', '1 is too small to reach 24 by any operation\nimpossible', '1 is too small to reach 24 by any operation\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-0-1', position: {x: 200, y: 300}, data: {id: '0-0-0-1', parent_id: '0-0-0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 * 12 = 144 (left: 144)'], output: '', label: '12 * 12 = 144 (left: 144)', score: 0.003, evals: ['144 is too far from 24\nimpossible', '144 is too far from 24\nimpossible', '144 is too far from 24\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-0-2', position: {x: 400, y: 300}, data: {id: '0-0-0-2', parent_id: '0-0-0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 + 12 = 24 (left: 24)'], output: '', label: '12 + 12 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-0-3', position: {x: 600, y: 300}, data: {id: '0-0-0-3', parent_id: '0-0-0', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 - 12 = 0 (left: 0)'], output: '', label: '12 - 12 = 0 (left: 0)', score: 0.003, evals: ['0 is too small to reach 24\nimpossible', '0 cannot reach 24 on its own\nimpossible', '0 cannot reach 24 as there are no other numbers to perform operations with.\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-1-0', position: {x: 200, y: 300}, data: {id: '0-0-1-0', parent_id: '0-0-1', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 / 12 = 1 (left: 1)'], output: '', label: '12 / 12 = 1 (left: 1)', score: 0.003, evals: ['1 is too far from 24\nimpossible', '1 is too small to reach 24 by any operation\nimpossible', '1 is too small to reach 24 by any operation\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-1-1', position: {x: 400, y: 300}, data: {id: '0-0-1-1', parent_id: '0-0-1', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 * 12 = 144 (left: 144)'], output: '', label: '12 * 12 = 144 (left: 144)', score: 0.003, evals: ['144 is too far from 24\nimpossible', '144 is too far from 24\nimpossible', '144 is too far from 24\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-1-2', position: {x: 600, y: 300}, data: {id: '0-0-1-2', parent_id: '0-0-1', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 + 12 = 24 (left: 24)'], output: '', label: '12 + 12 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-1-3', position: {x: 800, y: 300}, data: {id: '0-0-1-3', parent_id: '0-0-1', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 - 12 = 0 (left: 0)'], output: '', label: '12 - 12 = 0 (left: 0)', score: 0.003, evals: ['0 is too small to reach 24\nimpossible', '0 cannot reach 24 on its own\nimpossible', '0 cannot reach 24 as there are no other numbers to perform operations with.\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-0-0', position: {x: 800, y: 300}, data: {id: '0-4-0-0', parent_id: '0-4-0', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 / 12 = 1 (left: 1)'], output: '', label: '12 / 12 = 1 (left: 1)', score: 0.003, evals: ['1 is too far from 24\nimpossible', '1 is too small to reach 24 by any operation\nimpossible', '1 is too small to reach 24 by any operation\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-0-1', position: {x: 1000, y: 300}, data: {id: '0-4-0-1', parent_id: '0-4-0', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 * 12 = 144 (left: 144)'], output: '', label: '12 * 12 = 144 (left: 144)', score: 0.003, evals: ['144 is too far from 24\nimpossible', '144 is too far from 24\nimpossible', '144 is too far from 24\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-0-2', position: {x: 1200, y: 300}, data: {id: '0-4-0-2', parent_id: '0-4-0', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 + 12 = 24 (left: 24)'], output: '', label: '12 + 12 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-0-3', position: {x: 1400, y: 300}, data: {id: '0-4-0-3', parent_id: '0-4-0', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 - 12 = 0 (left: 0)'], output: '', label: '12 - 12 = 0 (left: 0)', score: 0.003, evals: ['0 is too small to reach 24\nimpossible', '0 cannot reach 24 on its own\nimpossible', '0 cannot reach 24 as there are no other numbers to perform operations with.\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-1-0', position: {x: 1000, y: 300}, data: {id: '0-4-1-0', parent_id: '0-4-1', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 / 12 = 1 (left: 1)'], output: '', label: '12 / 12 = 1 (left: 1)', score: 0.003, evals: ['1 is too far from 24\nimpossible', '1 is too small to reach 24 by any operation\nimpossible', '1 is too small to reach 24 by any operation\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-1-1', position: {x: 1200, y: 300}, data: {id: '0-4-1-1', parent_id: '0-4-1', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 * 12 = 144 (left: 144)'], output: '', label: '12 * 12 = 144 (left: 144)', score: 0.003, evals: ['144 is too far from 24\nimpossible', '144 is too far from 24\nimpossible', '144 is too far from 24\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-1-2', position: {x: 1400, y: 300}, data: {id: '0-4-1-2', parent_id: '0-4-1', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 + 12 = 24 (left: 24)'], output: '', label: '12 + 12 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-4-1-3', position: {x: 1600, y: 300}, data: {id: '0-4-1-3', parent_id: '0-4-1', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 - 12 = 0 (left: 0)'], output: '', label: '12 - 12 = 0 (left: 0)', score: 0.003, evals: ['0 is too small to reach 24\nimpossible', '0 cannot reach 24 on its own\nimpossible', '0 cannot reach 24 as there are no other numbers to perform operations with.\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-2-0', position: {x: 600, y: 300}, data: {id: '0-1-2-0', parent_id: '0-1-2', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)', '10 + 10 = 20 (left: 20)'], output: '', label: '10 + 10 = 20 (left: 20)', score: 3.0, evals: ['20 + 4 = 24\nI cannot obtain 24 now, but the number is within a reasonable range\nlikely', '20 + 4 = 24\nI cannot obtain 24 now, but number is within a reasonable range\nlikely', '20 + 4 = 24\nlikely'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-2-1', position: {x: 800, y: 300}, data: {id: '0-1-2-1', parent_id: '0-1-2', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)', '10 - 10 = 0 (left: 0)'], output: '', label: '10 - 10 = 0 (left: 0)', score: 0.003, evals: ['0 is too small to reach 24\nimpossible', '0 cannot reach 24 on its own\nimpossible', '0 cannot reach 24 as there are no other numbers to perform operations with.\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-2-2', position: {x: 1000, y: 300}, data: {id: '0-1-2-2', parent_id: '0-1-2', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)', '10 / 10 = 1 (left: 1)'], output: '', label: '10 / 10 = 1 (left: 1)', score: 0.003, evals: ['1 is too far from 24\nimpossible', '1 is too small to reach 24 by any operation\nimpossible', '1 is too small to reach 24 by any operation\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-2-3', position: {x: 1200, y: 300}, data: {id: '0-1-2-3', parent_id: '0-1-2', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)', '10 * 10 = 100 (left: 100)'], output: '', label: '10 * 10 = 100 (left: 100)', score: 0.003, evals: ['100 is too big\nimpossible', '100 = 100 (solved, no steps needed)\n100 is too big to reach 24\nimpossible', '100 is too big\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-0-0-2-0', position: {x: 400, y: 400}, data: {id: '0-0-0-2-0', parent_id: '0-0-0-2', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 + 12 = 24 (left: 24)'], output: 'Answer: (1 + 11) + (1 + 11) = 24', label: 'Answer: (1 + 11) + (1 + 11) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true, fluxNodeType: 'GPT'}},
{id: '0-0-1-2-0', position: {x: 600, y: 400}, data: {id: '0-0-1-2-0', parent_id: '0-0-1-2', input: '1 1 11 11', steps: ['1 + 11 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 + 12 = 24 (left: 24)'], output: 'Answer: (1 + 11) + (11 + 1) = 24', label: 'Answer: (1 + 11) + (11 + 1) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true, fluxNodeType: 'GPT'}},
{id: '0-4-0-2-0', position: {x: 1200, y: 400}, data: {id: '0-4-0-2-0', parent_id: '0-4-0-2', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '1 + 11 = 12 (left: 12 12)', '12 + 12 = 24 (left: 24)'], output: 'Answer: (11 + 1) + (1 + 11) = 24', label: 'Answer: (11 + 1) + (1 + 11) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true, fluxNodeType: 'GPT'}},
{id: '0-4-1-2-0', position: {x: 1400, y: 400}, data: {id: '0-4-1-2-0', parent_id: '0-4-1-2', input: '1 1 11 11', steps: ['11 + 1 = 12 (left: 1 11 12)', '11 + 1 = 12 (left: 12 12)', '12 + 12 = 24 (left: 24)'], output: 'Answer: (11 + 1) + (11 + 1) = 24', label: 'Answer: (11 + 1) + (11 + 1) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true, fluxNodeType: 'GPT'}},
{id: '0-1-2-0-0', position: {x: 600, y: 400}, data: {id: '0-1-2-0-0', parent_id: '0-1-2-0', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)', '10 + 10 = 20 (left: 20)', '20 + 2 = 22 (left: 8 8 14 22)'], output: '', label: '20 + 2 = 22 (left: 8 8 14 22)', score: 3.0, evals: ['8 + 8 + 14 = 30\n22 - 14 = 8\n8 * 8 = 64\n(8 * 8) - 22 = 42\n(8 + 8) * 14 = 224\n(22 - 14) * 8 = 64\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '8 + 8 + 14 = 30\n22 - 14 = 8\n8 * 8 = 64\n(8 - 8) * 14 = 0\n(22 - 14) / 8 = 1\n(22 - 8) / 8 = 1.75\n(22 - 8 - 14) = 0\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '8 + 8 + 14 + 22 = 52\n14 + 22 = 36\n8 + 8 = 16\n36 - 16 = 20\n(14 - 8) * 8 = 6 * 8 = 48\n(22 - 14) * 8 = 8 * 8 = 64\n(22 - 8) * 8 = 14 * 8 = 112\n(22 - 8) - 14 = 0\n\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-2-0-1', position: {x: 800, y: 400}, data: {id: '0-1-2-0-1', parent_id: '0-1-2-0', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)', '10 + 10 = 20 (left: 20)', '20 - 2 = 18 (left: 8 8 14 18)'], output: '', label: '20 - 2 = 18 (left: 8 8 14 18)', score: 2.001, evals: ['8 + 8 + 14 + 18 = 48\n(8 - 8) + 14 + 18 = 32\n8 + 8 - (18 - 14) = 16\n(8 + 8) / 2 + 14 = 22\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '8 + 8 + 14 + 18 = 48\n(8 - 8) + 14 + 18 = 32\n8 * 8 - 14 - 18 = 64 - 14 - 18 = 32\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '8 + 8 + 14 + 18 = 48\n(14 - 8) * 8 + 18 = 48 + 18 = 66\n(18 - 14) * 8 + 8 = 32 + 8 = 40\nI cannot obtain 24 now, and numbers are too big\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-2-0-2', position: {x: 1000, y: 400}, data: {id: '0-1-2-0-2', parent_id: '0-1-2-0', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)', '10 + 10 = 20 (left: 20)', '20 * 2 = 40 (left: 8 8 14 40)'], output: '', label: '20 * 2 = 40 (left: 8 8 14 40)', score: 1.002, evals: ['8 + 8 + 14 + 40 = 70\n8 * 8 + 14 - 40 = 30\n(40 - (8 + 8)) * 14 = 336\n8 8 14 40 are all too big\nimpossible', '8 + 8 + 14 + 40 = 70\n(14 - 8) * 8 + 40 = 48 + 40 = 88\nAll numbers are too big\nimpossible', '8 + 8 + 14 + 40 = 70\n(40 - 14) * 8 = 208\n8 * 8 - 14 + 40 = 26\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-2-0-3', position: {x: 1200, y: 400}, data: {id: '0-1-2-0-3', parent_id: '0-1-2-0', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)', '10 + 10 = 20 (left: 20)', '20 / 2 = 10 (left: 8 8 10 14)'], output: '', label: '20 / 2 = 10 (left: 8 8 10 14)', score: 40.001, evals: ['8 + 8 + 10 + 14 = 40\n(14 - 10) * 8 - 8 = 32 - 8 = 24\nsure', '8 + 8 + 10 + 14 = 40\n(14 - 8) * 8 = 6 * 8 = 48\n10 * 14 / 8 = 17.5\nNumbers are too high, no calculation gives 24\nimpossible', '8 + 8 + 10 + 14 = 40\n(14 - 8) * 10 - 8 = 6 * 10 - 8 = 60 - 8 = 52\n(14 - 10) * 8 - 8 = 4 * 8 - 8 = 32 - 8 = 24\nsure'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
{id: '0-1-2-0-4', position: {x: 1400, y: 400}, data: {id: '0-1-2-0-4', parent_id: '0-1-2-0', input: '1 1 11 11', steps: ['11 - 1 = 10 (left: 1 10 11)', '11 - 1 = 10 (left: 10 10)', '10 + 10 = 20 (left: 20)', '20 + 8 = 28 (left: 2 8 14 28)'], output: '', label: '20 + 8 = 28 (left: 2 8 14 28)', score: 20.002, evals: ['2 + 8 + 14 + 28 = 52\n28 - 14 - 8 - 2 = 4\n(14 - 2) * 2 = 24\nsure', '2 * 14 = 28\n28 - 8 = 20\n20 + 2 = 22\n28 / 2 = 14\n14 + 8 = 22\nNumbers are too high to reach 24\nimpossible', '2 + 8 + 14 + 28 = 52\n28 - 14 = 14\n14 * 2 = 28\n28 / 8 = 3.5\nI cannot obtain 24 now, and numbers are too big\nimpossible'], isValid: true, isTerminal: false, fluxNodeType: 'GPT'}},
]
export const treeDemoEdges = [
  {id: '0__0-0', source: '0', target: '0-0'},
  {id: '0__0-1', source: '0', target: '0-1'},
  {id: '0__0-2', source: '0', target: '0-2'},
  {id: '0__0-3', source: '0', target: '0-3'},
  {id: '0__0-4', source: '0', target: '0-4'},
  {id: '0-0__0-0-0', source: '0-0', target: '0-0-0'},
  {id: '0-0__0-0-1', source: '0-0', target: '0-0-1'},
  {id: '0-0__0-0-2', source: '0-0', target: '0-0-2'},
  {id: '0-0__0-0-3', source: '0-0', target: '0-0-3'},
  {id: '0-0__0-0-4', source: '0-0', target: '0-0-4'},
  {id: '0-4__0-4-0', source: '0-4', target: '0-4-0'},
  {id: '0-4__0-4-1', source: '0-4', target: '0-4-1'},
  {id: '0-4__0-4-2', source: '0-4', target: '0-4-2'},
  {id: '0-4__0-4-3', source: '0-4', target: '0-4-3'},
  {id: '0-4__0-4-4', source: '0-4', target: '0-4-4'},
  {id: '0-1__0-1-0', source: '0-1', target: '0-1-0'},
  {id: '0-1__0-1-1', source: '0-1', target: '0-1-1'},
  {id: '0-1__0-1-2', source: '0-1', target: '0-1-2'},
  {id: '0-1__0-1-3', source: '0-1', target: '0-1-3'},
  {id: '0-1__0-1-4', source: '0-1', target: '0-1-4'},
  {id: '0-2__0-2-0', source: '0-2', target: '0-2-0'},
  {id: '0-2__0-2-1', source: '0-2', target: '0-2-1'},
  {id: '0-2__0-2-2', source: '0-2', target: '0-2-2'},
  {id: '0-2__0-2-3', source: '0-2', target: '0-2-3'},
  {id: '0-3__0-3-0', source: '0-3', target: '0-3-0'},
  {id: '0-3__0-3-1', source: '0-3', target: '0-3-1'},
  {id: '0-3__0-3-2', source: '0-3', target: '0-3-2'},
  {id: '0-3__0-3-3', source: '0-3', target: '0-3-3'},
  {id: '0-0-0__0-0-0-0', source: '0-0-0', target: '0-0-0-0'},
  {id: '0-0-0__0-0-0-1', source: '0-0-0', target: '0-0-0-1'},
  {id: '0-0-0__0-0-0-2', source: '0-0-0', target: '0-0-0-2'},
  {id: '0-0-0__0-0-0-3', source: '0-0-0', target: '0-0-0-3'},
  {id: '0-0-1__0-0-1-0', source: '0-0-1', target: '0-0-1-0'},
  {id: '0-0-1__0-0-1-1', source: '0-0-1', target: '0-0-1-1'},
  {id: '0-0-1__0-0-1-2', source: '0-0-1', target: '0-0-1-2'},
  {id: '0-0-1__0-0-1-3', source: '0-0-1', target: '0-0-1-3'},
  {id: '0-4-0__0-4-0-0', source: '0-4-0', target: '0-4-0-0'},
  {id: '0-4-0__0-4-0-1', source: '0-4-0', target: '0-4-0-1'},
  {id: '0-4-0__0-4-0-2', source: '0-4-0', target: '0-4-0-2'},
  {id: '0-4-0__0-4-0-3', source: '0-4-0', target: '0-4-0-3'},
  {id: '0-4-1__0-4-1-0', source: '0-4-1', target: '0-4-1-0'},
  {id: '0-4-1__0-4-1-1', source: '0-4-1', target: '0-4-1-1'},
  {id: '0-4-1__0-4-1-2', source: '0-4-1', target: '0-4-1-2'},
  {id: '0-4-1__0-4-1-3', source: '0-4-1', target: '0-4-1-3'},
  {id: '0-1-2__0-1-2-0', source: '0-1-2', target: '0-1-2-0'},
  {id: '0-1-2__0-1-2-1', source: '0-1-2', target: '0-1-2-1'},
  {id: '0-1-2__0-1-2-2', source: '0-1-2', target: '0-1-2-2'},
  {id: '0-1-2__0-1-2-3', source: '0-1-2', target: '0-1-2-3'},
  {id: '0-0-0-2__0-0-0-2-0', source: '0-0-0-2', target: '0-0-0-2-0'},
  {id: '0-0-1-2__0-0-1-2-0', source: '0-0-1-2', target: '0-0-1-2-0'},
  {id: '0-4-0-2__0-4-0-2-0', source: '0-4-0-2', target: '0-4-0-2-0'},
  {id: '0-4-1-2__0-4-1-2-0', source: '0-4-1-2', target: '0-4-1-2-0'},
  {id: '0-1-2-0__0-1-2-0-0', source: '0-1-2-0', target: '0-1-2-0-0'},
  {id: '0-1-2-0__0-1-2-0-1', source: '0-1-2-0', target: '0-1-2-0-1'},
  {id: '0-1-2-0__0-1-2-0-2', source: '0-1-2-0', target: '0-1-2-0-2'},
  {id: '0-1-2-0__0-1-2-0-3', source: '0-1-2-0', target: '0-1-2-0-3'},
  {id: '0-1-2-0__0-1-2-0-4', source: '0-1-2-0', target: '0-1-2-0-4'},
];

function processNode(node: Node): Node<ToTNodeData> {
  const data = {...node.data} as ToTNodeData;
  if (data.fluxNodeType == null) {
    data.fluxNodeType = FluxNodeType.GPT;
  }
  if (data.text == null) {
    data.text = '';
  }
  if (!Array.isArray(data.evals)) {
    data.evals = [];
  }
  let color = "#f7d0a1";
  if (data.isValid) {
    color = "#d9f3d6"
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
  }
}

export const treeDemo = {
  nodes: treeDemoNodes.map(processNode),
  edges: treeDemoEdges,
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  }
}