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
  steps: string[];
  evals: string[];
  isTerminal: boolean;
  isValid: boolean;
};

export const treeDemoNodes: Node[] = [{ id: '0', position: { x: 0, y: 0 }, data: { id: '0', parent_id: '', input: '1 2 3 4', steps: [], output: '', label: '1 2 3 4', score: '', evals: '', isValid: true, isTerminal: false } },
{ id: '0-0', position: { x: 0, y: 100 }, data: { id: '0-0', parent_id: '0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)'], output: '', label: '1 + 2 = 3 (left: 3 3 4)', score: 41.0, evals: ['3 * 3 * 4 = 36\n(3 + 3) * 4 = 24\nsure', '3 * 3 * 4 = 36\n(3 + 3) * 4 = 24\nsure', '3 * 3 * 4 = 36\n(4 - 3) * 3 = 3\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely'], isValid: true, isTerminal: false } },
{ id: '0-1', position: { x: 200, y: 100 }, data: { id: '0-1', parent_id: '0', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)'], output: '', label: '2 * 1 = 2 (left: 2 3 4)', score: 41.0, evals: ['(4 - 2) * 3 = 6\n(3 * 4) - 2 = 10\n(4 / 2) * 3 = 6\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 * 3 * 4 = 24\nsure', '2 * 3 * 4 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-2', position: { x: 400, y: 100 }, data: { id: '0-2', parent_id: '0', input: '1 2 3 4', steps: ['4 - 1 = 3 (left: 2 3 3)'], output: '', label: '4 - 1 = 3 (left: 2 3 3)', score: 1.002, evals: ['2 * 3 * 3 = 18\n(2 + 3) * 3 = 15\n2 3 3 are all too small\nimpossible', '2 * 3 * 3 = 18\n(3 - 2) * 3 = 3\n2 3 3 are all too small\nimpossible', '2 + 3 + 3 = 8\n(2 + 3) * 3 = 15\n2 * 3 * 3 = 18\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely'], isValid: true, isTerminal: false } },
{ id: '0-3', position: { x: 600, y: 100 }, data: { id: '0-3', parent_id: '0', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)'], output: '', label: '4 / 1 = 4 (left: 2 3 4)', score: 41.0, evals: ['(4 - 2) * 3 = 6\n(3 * 4) - 2 = 10\n(4 / 2) * 3 = 6\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 * 3 * 4 = 24\nsure', '2 * 3 * 4 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-4', position: { x: 800, y: 100 }, data: { id: '0-4', parent_id: '0', input: '1 2 3 4', steps: ['3 * 1 = 3 (left: 2 3 4)'], output: '', label: '3 * 1 = 3 (left: 2 3 4)', score: 41.0, evals: ['(4 - 2) * 3 = 6\n(3 * 4) - 2 = 10\n(4 / 2) * 3 = 6\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 * 3 * 4 = 24\nsure', '2 * 3 * 4 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-0-0', position: { x: 0, y: 200 }, data: { id: '0-0-0', parent_id: '0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 + 3 = 6 (left: 4 6)'], output: '', label: '3 + 3 = 6 (left: 4 6)', score: 60.0, evals: ['4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-0-1', position: { x: 200, y: 200 }, data: { id: '0-0-1', parent_id: '0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 * 3 = 9 (left: 4 9)'], output: '', label: '3 * 3 = 9 (left: 4 9)', score: 0.003, evals: ['4 + 9 = 13\n4 * 9 = 36\n4 - 9 = -5\n9 - 4 = 5\n4 / 9 = 0.44\n9 / 4 = 2.25\nI cannot obtain 24 now, and the numbers are not within a reasonable range\nimpossible', '4 + 9 = 13\n4 * 9 = 36\n9 - 4 = 5\n9 / 4 = 2.25\nimpossible', '4 + 9 = 13\n4 * 9 = 36\n9 - 4 = 5\n9 / 4 = 2.25\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-0-2', position: { x: 600, y: 200 }, data: { id: '0-0-2', parent_id: '0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '4 - 3 = 1 (left: 1 3)'], output: '', label: '4 - 3 = 1 (left: 1 3)', score: 0.003, evals: ['1 + 3 = 4\n1 * 3 = 3\n1 - 3 = -2\n3 - 1 = 2\n1 / 3 = 0.33\n3 / 1 = 3\nI cannot obtain 24 now, and numbers are too small\nimpossible', '1 + 3 = 4\n1 * 3 = 3\n1 / 3 = 0.33\n3 - 1 = 2\nI cannot obtain 24 with these numbers, they are too small\nimpossible', '1 + 3 = 4\n1 * 3 = 3\n1 / 3 = 0.33\n3 - 1 = 2\nI cannot obtain 24 now, and numbers are too small\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-0-3', position: { x: 1200, y: 200 }, data: { id: '0-0-3', parent_id: '0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '4 / 3 = 1.33 (left: 1.33 3)'], output: '', label: '4 / 3 = 1.33 (left: 1.33 3)', score: -1, evals: ['invalid node, will log reason later'], isValid: false, isTerminal: false } },
{ id: '0-0-4', position: { x: 2000, y: 200 }, data: { id: '0-0-4', parent_id: '0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '4 + 3 = 7 (left: 3 7)'], output: '', label: '4 + 3 = 7 (left: 3 7)', score: 0.003, evals: ['3 + 7 = 10\n3 * 7 = 21\n3 - 7 = -4\n3 / 7 = 0.43\n\nimpossible', '3 + 7 = 10\n3 * 7 = 21\n3 / 7 = 0.43\n7 - 3 = 4\nI cannot obtain 24 now, and numbers are not within a reasonable range\nimpossible', '3 + 7 = 10\n3 * 7 = 21\n7 - 3 = 4\n3 / 7 = 0.43\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-1-0', position: { x: 400, y: 200 }, data: { id: '0-1-0', parent_id: '0-1', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 + 3 = 5 (left: 4 5)'], output: '', label: '2 + 3 = 5 (left: 4 5)', score: 0.003, evals: ['4 + 5 = 9\n4 * 5 = 20\n4 / 5 = 0.8\n5 - 4 = 1\nI cannot obtain 24 with these numbers.\nimpossible', '4 + 5 = 9\n4 * 5 = 20\n4 / 5 = 0.8\n5 - 4 = 1\nI cannot obtain 24 now, and numbers are too small\nimpossible', '4 + 5 = 9\n4 * 5 = 20\n4 - 5 = -1\n4 / 5 = 0.8\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-1-1', position: { x: 800, y: 200 }, data: { id: '0-1-1', parent_id: '0-1', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 + 4 = 7 (left: 2 7)'], output: '', label: '3 + 4 = 7 (left: 2 7)', score: 0.003, evals: ['2 + 7 = 9\n2 * 7 = 14\n2 / 7 = 0.28\n7 - 2 = 5\nI cannot obtain 24 now, numbers are too small\nimpossible', '2 + 7 = 9\n2 * 7 = 14\n2 / 7 = 0.29\n7 - 2 = 5\n\nI cannot obtain 24 now, and the numbers are too small\nimpossible', '2 + 7 = 9\n2 * 7 = 14\n2 / 7 = 0.29\n7 - 2 = 5\nI cannot obtain 24 now, and numbers are not within a reasonable range\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-1-2', position: { x: 1400, y: 200 }, data: { id: '0-1-2', parent_id: '0-1', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)'], output: '', label: '2 * 3 = 6 (left: 4 6)', score: 60.0, evals: ['4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-1-3', position: { x: 2200, y: 200 }, data: { id: '0-1-3', parent_id: '0-1', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)'], output: '', label: '3 * 4 = 12 (left: 2 12)', score: 60.0, evals: ['2 * 12 = 24\nsure', '2 * 12 = 24\nsure', '2 * 12 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-1-4', position: { x: 3000, y: 200 }, data: { id: '0-1-4', parent_id: '0-1', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '4 - 2 = 2 (left: 2 3)'], output: '', label: '4 - 2 = 2 (left: 2 3)', score: 0.003, evals: ['2 + 3 = 5\n2 * 3 = 6\n2 / 3 = 0.66\n3 - 2 = 1\nI cannot obtain 24 now, and numbers are too small\nimpossible', '2 + 3 = 5\n2 * 3 = 6\n2 / 3 = 0.67\n3 - 2 = 1\nimpossible', '2 + 3 = 5\n2 * 3 = 6\n2 / 3 = 0.66\n3 - 2 = 1\nI cannot obtain 24 now, and numbers are too small\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-3-0', position: { x: 1600, y: 200 }, data: { id: '0-3-0', parent_id: '0-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 + 3 = 5 (left: 4 5)'], output: '', label: '2 + 3 = 5 (left: 4 5)', score: 0.003, evals: ['4 + 5 = 9\n4 * 5 = 20\n4 / 5 = 0.8\n5 - 4 = 1\nI cannot obtain 24 with these numbers.\nimpossible', '4 + 5 = 9\n4 * 5 = 20\n4 / 5 = 0.8\n5 - 4 = 1\nI cannot obtain 24 now, and numbers are too small\nimpossible', '4 + 5 = 9\n4 * 5 = 20\n4 - 5 = -1\n4 / 5 = 0.8\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-3-1', position: { x: 2400, y: 200 }, data: { id: '0-3-1', parent_id: '0-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '3 + 4 = 7 (left: 2 7)'], output: '', label: '3 + 4 = 7 (left: 2 7)', score: 0.003, evals: ['2 + 7 = 9\n2 * 7 = 14\n2 / 7 = 0.28\n7 - 2 = 5\nI cannot obtain 24 now, numbers are too small\nimpossible', '2 + 7 = 9\n2 * 7 = 14\n2 / 7 = 0.29\n7 - 2 = 5\n\nI cannot obtain 24 now, and the numbers are too small\nimpossible', '2 + 7 = 9\n2 * 7 = 14\n2 / 7 = 0.29\n7 - 2 = 5\nI cannot obtain 24 now, and numbers are not within a reasonable range\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-3-2', position: { x: 3200, y: 200 }, data: { id: '0-3-2', parent_id: '0-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)'], output: '', label: '2 * 3 = 6 (left: 4 6)', score: 60.0, evals: ['4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-3-3', position: { x: 3800, y: 200 }, data: { id: '0-3-3', parent_id: '0-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)'], output: '', label: '3 * 4 = 12 (left: 2 12)', score: 60.0, evals: ['2 * 12 = 24\nsure', '2 * 12 = 24\nsure', '2 * 12 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-3-4', position: { x: 4200, y: 200 }, data: { id: '0-3-4', parent_id: '0-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '4 - 2 = 2 (left: 2 3)'], output: '', label: '4 - 2 = 2 (left: 2 3)', score: 0.003, evals: ['2 + 3 = 5\n2 * 3 = 6\n2 / 3 = 0.66\n3 - 2 = 1\nI cannot obtain 24 now, and numbers are too small\nimpossible', '2 + 3 = 5\n2 * 3 = 6\n2 / 3 = 0.67\n3 - 2 = 1\nimpossible', '2 + 3 = 5\n2 * 3 = 6\n2 / 3 = 0.66\n3 - 2 = 1\nI cannot obtain 24 now, and numbers are too small\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-4-0', position: { x: 2600, y: 200 }, data: { id: '0-4-0', parent_id: '0-4', input: '1 2 3 4', steps: ['3 * 1 = 3 (left: 2 3 4)', '2 + 3 = 5 (left: 4 5)'], output: '', label: '2 + 3 = 5 (left: 4 5)', score: 0.003, evals: ['4 + 5 = 9\n4 * 5 = 20\n4 / 5 = 0.8\n5 - 4 = 1\nI cannot obtain 24 with these numbers.\nimpossible', '4 + 5 = 9\n4 * 5 = 20\n4 / 5 = 0.8\n5 - 4 = 1\nI cannot obtain 24 now, and numbers are too small\nimpossible', '4 + 5 = 9\n4 * 5 = 20\n4 - 5 = -1\n4 / 5 = 0.8\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-4-1', position: { x: 3400, y: 200 }, data: { id: '0-4-1', parent_id: '0-4', input: '1 2 3 4', steps: ['3 * 1 = 3 (left: 2 3 4)', '3 + 4 = 7 (left: 2 7)'], output: '', label: '3 + 4 = 7 (left: 2 7)', score: 0.003, evals: ['2 + 7 = 9\n2 * 7 = 14\n2 / 7 = 0.28\n7 - 2 = 5\nI cannot obtain 24 now, numbers are too small\nimpossible', '2 + 7 = 9\n2 * 7 = 14\n2 / 7 = 0.29\n7 - 2 = 5\n\nI cannot obtain 24 now, and the numbers are too small\nimpossible', '2 + 7 = 9\n2 * 7 = 14\n2 / 7 = 0.29\n7 - 2 = 5\nI cannot obtain 24 now, and numbers are not within a reasonable range\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-4-2', position: { x: 4000, y: 200 }, data: { id: '0-4-2', parent_id: '0-4', input: '1 2 3 4', steps: ['3 * 1 = 3 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)'], output: '', label: '2 * 3 = 6 (left: 4 6)', score: 60.0, evals: ['4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-4-3', position: { x: 4400, y: 200 }, data: { id: '0-4-3', parent_id: '0-4', input: '1 2 3 4', steps: ['3 * 1 = 3 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)'], output: '', label: '3 * 4 = 12 (left: 2 12)', score: 60.0, evals: ['2 * 12 = 24\nsure', '2 * 12 = 24\nsure', '2 * 12 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-4-4', position: { x: 4600, y: 200 }, data: { id: '0-4-4', parent_id: '0-4', input: '1 2 3 4', steps: ['3 * 1 = 3 (left: 2 3 4)', '4 - 2 = 2 (left: 2 3)'], output: '', label: '4 - 2 = 2 (left: 2 3)', score: 0.003, evals: ['2 + 3 = 5\n2 * 3 = 6\n2 / 3 = 0.66\n3 - 2 = 1\nI cannot obtain 24 now, and numbers are too small\nimpossible', '2 + 3 = 5\n2 * 3 = 6\n2 / 3 = 0.67\n3 - 2 = 1\nimpossible', '2 + 3 = 5\n2 * 3 = 6\n2 / 3 = 0.66\n3 - 2 = 1\nI cannot obtain 24 now, and numbers are too small\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-2-0', position: { x: 1000, y: 200 }, data: { id: '0-2-0', parent_id: '0-2', input: '1 2 3 4', steps: ['4 - 1 = 3 (left: 2 3 3)', '2 * 3 = 6 (left: 3 6)'], output: '', label: '2 * 3 = 6 (left: 3 6)', score: 0.003, evals: ['3 + 6 = 9\n3 * 6 = 18\n6 / 3 = 2\n3 - 6 = -3\nI cannot obtain 24 now, and numbers are too small\nimpossible', '3 + 6 = 9\n3 * 6 = 18\n3 / 6 = 0.5\nI cannot obtain 24 now, and numbers are too small\nimpossible', '3 + 6 = 9\n3 * 6 = 18\n3 / 6 = 0.5\nI cannot obtain 24 now, and the numbers are too small\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-2-1', position: { x: 1800, y: 200 }, data: { id: '0-2-1', parent_id: '0-2', input: '1 2 3 4', steps: ['4 - 1 = 3 (left: 2 3 3)', '3 + 2 = 5 (left: 3 5)'], output: '', label: '3 + 2 = 5 (left: 3 5)', score: 0.003, evals: ['3 + 5 = 8\n3 * 5 = 15\n3 / 5 = 0.6\n5 - 3 = 2\nI cannot obtain 24 now, and numbers are too small\nimpossible', '3 + 5 = 8\n3 * 5 = 15\n3 / 5 = 0.6\n5 - 3 = 2\nI cannot obtain 24 now, and numbers are not within a reasonable range\nimpossible', '3 + 5 = 8\n3 * 5 = 15\n3 / 5 = 0.6\n5 - 3 = 2\nI cannot obtain 24 now, and numbers are too small\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-2-2', position: { x: 2800, y: 200 }, data: { id: '0-2-2', parent_id: '0-2', input: '1 2 3 4', steps: ['4 - 1 = 3 (left: 2 3 3)', '3 - 2 = 1 (left: 1 3)'], output: '', label: '3 - 2 = 1 (left: 1 3)', score: 0.003, evals: ['1 + 3 = 4\n1 * 3 = 3\n1 - 3 = -2\n3 - 1 = 2\n1 / 3 = 0.33\n3 / 1 = 3\nI cannot obtain 24 now, and numbers are too small\nimpossible', '1 + 3 = 4\n1 * 3 = 3\n1 / 3 = 0.33\n3 - 1 = 2\nI cannot obtain 24 with these numbers, they are too small\nimpossible', '1 + 3 = 4\n1 * 3 = 3\n1 / 3 = 0.33\n3 - 1 = 2\nI cannot obtain 24 now, and numbers are too small\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-2-3', position: { x: 3600, y: 200 }, data: { id: '0-2-3', parent_id: '0-2', input: '1 2 3 4', steps: ['4 - 1 = 3 (left: 2 3 3)', '3 / 2 = 1.5 (left: 1.5 3)'], output: '', label: '3 / 2 = 1.5 (left: 1.5 3)', score: -1, evals: ['invalid node, will log reason later'], isValid: false, isTerminal: false } },
{ id: '0-0-0-0', position: { x: 0, y: 300 }, data: { id: '0-0-0-0', parent_id: '0-0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 + 3 = 6 (left: 4 6)', '4 + 6 = 10 (left: 10)'], output: '', label: '4 + 6 = 10 (left: 10)', score: 0.003, evals: ['10 is too far from 24 with only one number.\nimpossible', '10 is far from 24 and no additional numbers are provided.\nimpossible', '10 is too far from 24 with only one number given.\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-0-0-1', position: { x: 200, y: 300 }, data: { id: '0-0-0-1', parent_id: '0-0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 + 3 = 6 (left: 4 6)', '6 - 4 = 2 (left: 2)'], output: '', label: '6 - 4 = 2 (left: 2)', score: 0.003, evals: ['2 is too small to reach 24\nimpossible', '2 is too small to reach 24 with only one number\nimpossible', '2 is too small to reach 24 by any operation\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-0-0-2', position: { x: 400, y: 300 }, data: { id: '0-0-0-2', parent_id: '0-0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 + 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: '', label: '4 * 6 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false } },
{ id: '0-0-0-3', position: { x: 600, y: 300 }, data: { id: '0-0-0-3', parent_id: '0-0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 + 3 = 6 (left: 4 6)', '6 / 4 = 1.5 (left: 1.5)'], output: '', label: '6 / 4 = 1.5 (left: 1.5)', score: -1, evals: ['invalid node, will log reason later'], isValid: false, isTerminal: false } },
{ id: '0-1-2-0', position: { x: 800, y: 300 }, data: { id: '0-1-2-0', parent_id: '0-1-2', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 + 6 = 10 (left: 10)'], output: '', label: '4 + 6 = 10 (left: 10)', score: 0.003, evals: ['10 is too far from 24 with only one number.\nimpossible', '10 is far from 24 and no additional numbers are provided.\nimpossible', '10 is too far from 24 with only one number given.\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-1-2-1', position: { x: 1000, y: 300 }, data: { id: '0-1-2-1', parent_id: '0-1-2', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '6 - 4 = 2 (left: 2)'], output: '', label: '6 - 4 = 2 (left: 2)', score: 0.003, evals: ['2 is too small to reach 24\nimpossible', '2 is too small to reach 24 with only one number\nimpossible', '2 is too small to reach 24 by any operation\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-1-2-2', position: { x: 1400, y: 300 }, data: { id: '0-1-2-2', parent_id: '0-1-2', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: '', label: '4 * 6 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false } },
{ id: '0-1-2-3', position: { x: 2000, y: 300 }, data: { id: '0-1-2-3', parent_id: '0-1-2', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '6 / 4 = 1.5 (left: 1.5)'], output: '', label: '6 / 4 = 1.5 (left: 1.5)', score: -1, evals: ['invalid node, will log reason later'], isValid: false, isTerminal: false } },
{ id: '0-1-3-0', position: { x: 1200, y: 300 }, data: { id: '0-1-3-0', parent_id: '0-1-3', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 + 12 = 14 (left: 14)'], output: '', label: '2 + 12 = 14 (left: 14)', score: 60.0, evals: ['14 + 10 = 24\nsure', '14 + 10 = 24\nsure', '14 + 10 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-1-3-1', position: { x: 1600, y: 300 }, data: { id: '0-1-3-1', parent_id: '0-1-3', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '12 - 2 = 10 (left: 10)'], output: '', label: '12 - 2 = 10 (left: 10)', score: 0.003, evals: ['10 is too far from 24 with only one number.\nimpossible', '10 is far from 24 and no additional numbers are provided.\nimpossible', '10 is too far from 24 with only one number given.\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-1-3-2', position: { x: 2200, y: 300 }, data: { id: '0-1-3-2', parent_id: '0-1-3', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '12 / 2 = 6 (left: 6)'], output: '', label: '12 / 2 = 6 (left: 6)', score: 0.003, evals: ['6 is too far from 24 and cannot be combined with any operation to reach 24\nimpossible', '6 is too small to reach 24 by itself.\nimpossible', '6 is too small to reach 24 by itself\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-1-3-3', position: { x: 2800, y: 300 }, data: { id: '0-1-3-3', parent_id: '0-1-3', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 * 12 = 24 (left: 24)'], output: '', label: '2 * 12 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false } },
{ id: '0-3-2-0', position: { x: 1800, y: 300 }, data: { id: '0-3-2-0', parent_id: '0-3-2', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 + 6 = 10 (left: 10)'], output: '', label: '4 + 6 = 10 (left: 10)', score: 0.003, evals: ['10 is too far from 24 with only one number.\nimpossible', '10 is far from 24 and no additional numbers are provided.\nimpossible', '10 is too far from 24 with only one number given.\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-3-2-1', position: { x: 2400, y: 300 }, data: { id: '0-3-2-1', parent_id: '0-3-2', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '6 - 4 = 2 (left: 2)'], output: '', label: '6 - 4 = 2 (left: 2)', score: 0.003, evals: ['2 is too small to reach 24\nimpossible', '2 is too small to reach 24 with only one number\nimpossible', '2 is too small to reach 24 by any operation\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-3-2-2', position: { x: 3000, y: 300 }, data: { id: '0-3-2-2', parent_id: '0-3-2', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: '', label: '4 * 6 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false } },
{ id: '0-3-2-3', position: { x: 3400, y: 300 }, data: { id: '0-3-2-3', parent_id: '0-3-2', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '6 / 4 = 1.5 (left: 1.5)'], output: '', label: '6 / 4 = 1.5 (left: 1.5)', score: -1, evals: ['invalid node, will log reason later'], isValid: false, isTerminal: false } },
{ id: '0-3-3-0', position: { x: 2600, y: 300 }, data: { id: '0-3-3-0', parent_id: '0-3-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 + 12 = 14 (left: 14)'], output: '', label: '2 + 12 = 14 (left: 14)', score: 60.0, evals: ['14 + 10 = 24\nsure', '14 + 10 = 24\nsure', '14 + 10 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-3-3-1', position: { x: 3200, y: 300 }, data: { id: '0-3-3-1', parent_id: '0-3-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '12 - 2 = 10 (left: 10)'], output: '', label: '12 - 2 = 10 (left: 10)', score: 0.003, evals: ['10 is too far from 24 with only one number.\nimpossible', '10 is far from 24 and no additional numbers are provided.\nimpossible', '10 is too far from 24 with only one number given.\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-3-3-2', position: { x: 3600, y: 300 }, data: { id: '0-3-3-2', parent_id: '0-3-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '12 / 2 = 6 (left: 6)'], output: '', label: '12 / 2 = 6 (left: 6)', score: 0.003, evals: ['6 is too far from 24 and cannot be combined with any operation to reach 24\nimpossible', '6 is too small to reach 24 by itself.\nimpossible', '6 is too small to reach 24 by itself\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-3-3-3', position: { x: 3800, y: 300 }, data: { id: '0-3-3-3', parent_id: '0-3-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 * 12 = 24 (left: 24)'], output: '', label: '2 * 12 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false } },
{ id: '0-0-0-2-0', position: { x: 0, y: 400 }, data: { id: '0-0-0-2-0', parent_id: '0-0-0-2', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 + 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: 'Answer: 4 * ((1 + 2) + 3) = 24', label: 'Answer: 4 * ((1 + 2) + 3) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true } },
{ id: '0-1-2-2-0', position: { x: 400, y: 400 }, data: { id: '0-1-2-2-0', parent_id: '0-1-2-2', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: 'Answer: (1 * 2) * (3 * 4) = 24', label: 'Answer: (1 * 2) * (3 * 4) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true } },
{ id: '0-1-3-0-0', position: { x: 200, y: 400 }, data: { id: '0-1-3-0-0', parent_id: '0-1-3-0', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 + 12 = 14 (left: 14)', '14 + 2 = 16 (left: 2 8 8)'], output: '', label: '14 + 2 = 16 (left: 2 8 8)', score: 3.0, evals: ['2 + 8 + 8 = 18\n(8 - 2) * 8 = 6 * 8 = 48\n(8 / 2) * 8 = 4 * 8 = 32\n\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 + 8 + 8 = 18\n(8 - 2) * 8 = 6 * 8 = 48\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 + 8 + 8 = 18\n(8 - 2) * 8 = 6 * 8 = 48\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely'], isValid: true, isTerminal: false } },
{ id: '0-1-3-0-1', position: { x: 600, y: 400 }, data: { id: '0-1-3-0-1', parent_id: '0-1-3-0', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 + 12 = 14 (left: 14)', '14 + 8 = 22 (left: 2 8)'], output: '', label: '14 + 8 = 22 (left: 2 8)', score: 0.003, evals: ['2 + 8 = 10\n2 * 8 = 16\n8 - 2 = 6\n2 / 8 = 0.25\n\nI cannot obtain 24 now, and the numbers are too small\nimpossible', '2 + 8 = 10\n2 * 8 = 16\n8 - 2 = 6\n2 / 8 = 0.25\n\nI cannot obtain 24 now, and numbers are not within a reasonable range\nimpossible', '2 + 8 = 10\n2 * 8 = 16\n8 - 2 = 6\n2 / 8 = 0.25\nI cannot obtain 24 now, and numbers are too far from a reasonable range\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-1-3-0-2', position: { x: 800, y: 400 }, data: { id: '0-1-3-0-2', parent_id: '0-1-3-0', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 + 12 = 14 (left: 14)', '14 * 2 = 28 (left: 2 8 8)'], output: '', label: '14 * 2 = 28 (left: 2 8 8)', score: 3.0, evals: ['2 + 8 + 8 = 18\n(8 - 2) * 8 = 6 * 8 = 48\n(8 / 2) * 8 = 4 * 8 = 32\n\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 + 8 + 8 = 18\n(8 - 2) * 8 = 6 * 8 = 48\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 + 8 + 8 = 18\n(8 - 2) * 8 = 6 * 8 = 48\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely'], isValid: true, isTerminal: false } },
{ id: '0-1-3-0-3', position: { x: 1000, y: 400 }, data: { id: '0-1-3-0-3', parent_id: '0-1-3-0', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 + 12 = 14 (left: 14)', '14 * 8 = 112 (left: 2 8)'], output: '', label: '14 * 8 = 112 (left: 2 8)', score: 0.003, evals: ['2 + 8 = 10\n2 * 8 = 16\n8 - 2 = 6\n2 / 8 = 0.25\n\nI cannot obtain 24 now, and the numbers are too small\nimpossible', '2 + 8 = 10\n2 * 8 = 16\n8 - 2 = 6\n2 / 8 = 0.25\n\nI cannot obtain 24 now, and numbers are not within a reasonable range\nimpossible', '2 + 8 = 10\n2 * 8 = 16\n8 - 2 = 6\n2 / 8 = 0.25\nI cannot obtain 24 now, and numbers are too far from a reasonable range\nimpossible'], isValid: true, isTerminal: false } },
{ id: '0-1-3-0-4', position: { x: 1600, y: 400 }, data: { id: '0-1-3-0-4', parent_id: '0-1-3-0', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 + 12 = 14 (left: 14)', '14 / 2 = 7 (left: 7 8 8)'], output: '', label: '14 / 2 = 7 (left: 7 8 8)', score: 3.0, evals: ['7 + 8 + 8 = 23\n(8 - 7) * 8 = 1 * 8 = 8\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '7 + 8 + 8 = 23\n(8 - 7) * 8 = 1 * 8 = 8\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '7 + 8 + 8 = 23\n(8 - 7) * 8 = 1 * 8 = 8\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely'], isValid: true, isTerminal: false } },
{ id: '0-1-3-3-0', position: { x: 1200, y: 400 }, data: { id: '0-1-3-3-0', parent_id: '0-1-3-3', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 * 12 = 24 (left: 24)'], output: 'Answer: (2 * 1) * (3 * 4) = 24', label: 'Answer: (2 * 1) * (3 * 4) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true } },
{ id: '0-3-2-2-0', position: { x: 1400, y: 400 }, data: { id: '0-3-2-2-0', parent_id: '0-3-2-2', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: 'Answer: 4 * (2 * 3) = 24', label: 'Answer: 4 * (2 * 3) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true } },
]

export const treeAnswerPathNodes: Node[] = [{ id: '0-0-0-2-0', position: { x: 0, y: 400 }, data: { id: '0-0-0-2-0', parent_id: '0-0-0-2', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 + 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: 'Answer: 4 * ((1 + 2) + 3) = 24', label: 'Answer: 4 * ((1 + 2) + 3) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true } },
{ id: '0-1-2-2-0', position: { x: 400, y: 400 }, data: { id: '0-1-2-2-0', parent_id: '0-1-2-2', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: 'Answer: (1 * 2) * (3 * 4) = 24', label: 'Answer: (1 * 2) * (3 * 4) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true } },
{ id: '0-1-3-3-0', position: { x: 1200, y: 400 }, data: { id: '0-1-3-3-0', parent_id: '0-1-3-3', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 * 12 = 24 (left: 24)'], output: 'Answer: (2 * 1) * (3 * 4) = 24', label: 'Answer: (2 * 1) * (3 * 4) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true } },
{ id: '0-3-2-2-0', position: { x: 1400, y: 400 }, data: { id: '0-3-2-2-0', parent_id: '0-3-2-2', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: 'Answer: 4 * (2 * 3) = 24', label: 'Answer: 4 * (2 * 3) = 24', score: 0.0, evals: 'sure', isValid: true, isTerminal: true } },
{ id: '0-0-0-2', position: { x: 400, y: 300 }, data: { id: '0-0-0-2', parent_id: '0-0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 + 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: '', label: '4 * 6 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false } },
{ id: '0-1-2-2', position: { x: 1400, y: 300 }, data: { id: '0-1-2-2', parent_id: '0-1-2', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: '', label: '4 * 6 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false } },
{ id: '0-1-3-3', position: { x: 2800, y: 300 }, data: { id: '0-1-3-3', parent_id: '0-1-3', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)', '2 * 12 = 24 (left: 24)'], output: '', label: '2 * 12 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false } },
{ id: '0-3-2-2', position: { x: 3000, y: 300 }, data: { id: '0-3-2-2', parent_id: '0-3-2', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)', '4 * 6 = 24 (left: 24)'], output: '', label: '4 * 6 = 24 (left: 24)', score: 60.0, evals: ['24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure', '24 = 24 (solved, no steps needed)\nsure'], isValid: true, isTerminal: false } },
{ id: '0-0-0', position: { x: 0, y: 200 }, data: { id: '0-0-0', parent_id: '0-0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)', '3 + 3 = 6 (left: 4 6)'], output: '', label: '3 + 3 = 6 (left: 4 6)', score: 60.0, evals: ['4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-1-2', position: { x: 1400, y: 200 }, data: { id: '0-1-2', parent_id: '0-1', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)'], output: '', label: '2 * 3 = 6 (left: 4 6)', score: 60.0, evals: ['4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-1-3', position: { x: 2200, y: 200 }, data: { id: '0-1-3', parent_id: '0-1', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)', '3 * 4 = 12 (left: 2 12)'], output: '', label: '3 * 4 = 12 (left: 2 12)', score: 60.0, evals: ['2 * 12 = 24\nsure', '2 * 12 = 24\nsure', '2 * 12 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-3-2', position: { x: 3200, y: 200 }, data: { id: '0-3-2', parent_id: '0-3', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)', '2 * 3 = 6 (left: 4 6)'], output: '', label: '2 * 3 = 6 (left: 4 6)', score: 60.0, evals: ['4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure', '4 + 6 = 10\n4 * 6 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-0', position: { x: 0, y: 100 }, data: { id: '0-0', parent_id: '0', input: '1 2 3 4', steps: ['1 + 2 = 3 (left: 3 3 4)'], output: '', label: '1 + 2 = 3 (left: 3 3 4)', score: 41.0, evals: ['3 * 3 * 4 = 36\n(3 + 3) * 4 = 24\nsure', '3 * 3 * 4 = 36\n(3 + 3) * 4 = 24\nsure', '3 * 3 * 4 = 36\n(4 - 3) * 3 = 3\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely'], isValid: true, isTerminal: false } },
{ id: '0-1', position: { x: 200, y: 100 }, data: { id: '0-1', parent_id: '0', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)'], output: '', label: '2 * 1 = 2 (left: 2 3 4)', score: 41.0, evals: ['(4 - 2) * 3 = 6\n(3 * 4) - 2 = 10\n(4 / 2) * 3 = 6\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 * 3 * 4 = 24\nsure', '2 * 3 * 4 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-1', position: { x: 200, y: 100 }, data: { id: '0-1', parent_id: '0', input: '1 2 3 4', steps: ['2 * 1 = 2 (left: 2 3 4)'], output: '', label: '2 * 1 = 2 (left: 2 3 4)', score: 41.0, evals: ['(4 - 2) * 3 = 6\n(3 * 4) - 2 = 10\n(4 / 2) * 3 = 6\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 * 3 * 4 = 24\nsure', '2 * 3 * 4 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0-3', position: { x: 600, y: 100 }, data: { id: '0-3', parent_id: '0', input: '1 2 3 4', steps: ['4 / 1 = 4 (left: 2 3 4)'], output: '', label: '4 / 1 = 4 (left: 2 3 4)', score: 41.0, evals: ['(4 - 2) * 3 = 6\n(3 * 4) - 2 = 10\n(4 / 2) * 3 = 6\nI cannot obtain 24 now, but numbers are within a reasonable range\nlikely', '2 * 3 * 4 = 24\nsure', '2 * 3 * 4 = 24\nsure'], isValid: true, isTerminal: false } },
{ id: '0', position: { x: 0, y: 0 }, data: { id: '0', parent_id: '', input: '1 2 3 4', steps: [], output: '', label: '1 2 3 4', score: '', evals: '', isValid: true, isTerminal: false } },
{ id: '0', position: { x: 0, y: 0 }, data: { id: '0', parent_id: '', input: '1 2 3 4', steps: [], output: '', label: '1 2 3 4', score: '', evals: '', isValid: true, isTerminal: false } },
{ id: '0', position: { x: 0, y: 0 }, data: { id: '0', parent_id: '', input: '1 2 3 4', steps: [], output: '', label: '1 2 3 4', score: '', evals: '', isValid: true, isTerminal: false } },
{ id: '0', position: { x: 0, y: 0 }, data: { id: '0', parent_id: '', input: '1 2 3 4', steps: [], output: '', label: '1 2 3 4', score: '', evals: '', isValid: true, isTerminal: false } },
]

export const treeDemoEdges = [{ id: '0__0-0', source: '0', target: '0-0' },
{ id: '0__0-1', source: '0', target: '0-1' },
{ id: '0__0-2', source: '0', target: '0-2' },
{ id: '0__0-3', source: '0', target: '0-3' },
{ id: '0__0-4', source: '0', target: '0-4' },
{ id: '0-0__0-0-0', source: '0-0', target: '0-0-0' },
{ id: '0-0__0-0-1', source: '0-0', target: '0-0-1' },
{ id: '0-0__0-0-2', source: '0-0', target: '0-0-2' },
{ id: '0-0__0-0-3', source: '0-0', target: '0-0-3' },
{ id: '0-0__0-0-4', source: '0-0', target: '0-0-4' },
{ id: '0-1__0-1-0', source: '0-1', target: '0-1-0' },
{ id: '0-1__0-1-1', source: '0-1', target: '0-1-1' },
{ id: '0-1__0-1-2', source: '0-1', target: '0-1-2' },
{ id: '0-1__0-1-3', source: '0-1', target: '0-1-3' },
{ id: '0-1__0-1-4', source: '0-1', target: '0-1-4' },
{ id: '0-3__0-3-0', source: '0-3', target: '0-3-0' },
{ id: '0-3__0-3-1', source: '0-3', target: '0-3-1' },
{ id: '0-3__0-3-2', source: '0-3', target: '0-3-2' },
{ id: '0-3__0-3-3', source: '0-3', target: '0-3-3' },
{ id: '0-3__0-3-4', source: '0-3', target: '0-3-4' },
{ id: '0-4__0-4-0', source: '0-4', target: '0-4-0' },
{ id: '0-4__0-4-1', source: '0-4', target: '0-4-1' },
{ id: '0-4__0-4-2', source: '0-4', target: '0-4-2' },
{ id: '0-4__0-4-3', source: '0-4', target: '0-4-3' },
{ id: '0-4__0-4-4', source: '0-4', target: '0-4-4' },
{ id: '0-2__0-2-0', source: '0-2', target: '0-2-0' },
{ id: '0-2__0-2-1', source: '0-2', target: '0-2-1' },
{ id: '0-2__0-2-2', source: '0-2', target: '0-2-2' },
{ id: '0-2__0-2-3', source: '0-2', target: '0-2-3' },
{ id: '0-0-0__0-0-0-0', source: '0-0-0', target: '0-0-0-0' },
{ id: '0-0-0__0-0-0-1', source: '0-0-0', target: '0-0-0-1' },
{ id: '0-0-0__0-0-0-2', source: '0-0-0', target: '0-0-0-2' },
{ id: '0-0-0__0-0-0-3', source: '0-0-0', target: '0-0-0-3' },
{ id: '0-1-2__0-1-2-0', source: '0-1-2', target: '0-1-2-0' },
{ id: '0-1-2__0-1-2-1', source: '0-1-2', target: '0-1-2-1' },
{ id: '0-1-2__0-1-2-2', source: '0-1-2', target: '0-1-2-2' },
{ id: '0-1-2__0-1-2-3', source: '0-1-2', target: '0-1-2-3' },
{ id: '0-1-3__0-1-3-0', source: '0-1-3', target: '0-1-3-0' },
{ id: '0-1-3__0-1-3-1', source: '0-1-3', target: '0-1-3-1' },
{ id: '0-1-3__0-1-3-2', source: '0-1-3', target: '0-1-3-2' },
{ id: '0-1-3__0-1-3-3', source: '0-1-3', target: '0-1-3-3' },
{ id: '0-3-2__0-3-2-0', source: '0-3-2', target: '0-3-2-0' },
{ id: '0-3-2__0-3-2-1', source: '0-3-2', target: '0-3-2-1' },
{ id: '0-3-2__0-3-2-2', source: '0-3-2', target: '0-3-2-2' },
{ id: '0-3-2__0-3-2-3', source: '0-3-2', target: '0-3-2-3' },
{ id: '0-3-3__0-3-3-0', source: '0-3-3', target: '0-3-3-0' },
{ id: '0-3-3__0-3-3-1', source: '0-3-3', target: '0-3-3-1' },
{ id: '0-3-3__0-3-3-2', source: '0-3-3', target: '0-3-3-2' },
{ id: '0-3-3__0-3-3-3', source: '0-3-3', target: '0-3-3-3' },
{ id: '0-0-0-2__0-0-0-2-0', source: '0-0-0-2', target: '0-0-0-2-0' },
{ id: '0-1-2-2__0-1-2-2-0', source: '0-1-2-2', target: '0-1-2-2-0' },
{ id: '0-1-3-0__0-1-3-0-0', source: '0-1-3-0', target: '0-1-3-0-0' },
{ id: '0-1-3-0__0-1-3-0-1', source: '0-1-3-0', target: '0-1-3-0-1' },
{ id: '0-1-3-0__0-1-3-0-2', source: '0-1-3-0', target: '0-1-3-0-2' },
{ id: '0-1-3-0__0-1-3-0-3', source: '0-1-3-0', target: '0-1-3-0-3' },
{ id: '0-1-3-0__0-1-3-0-4', source: '0-1-3-0', target: '0-1-3-0-4' },
{ id: '0-1-3-3__0-1-3-3-0', source: '0-1-3-3', target: '0-1-3-3-0' },
{ id: '0-3-2-2__0-3-2-2-0', source: '0-3-2-2', target: '0-3-2-2-0' },
];

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
  data.text = data.steps.join('\n') + '\n' + data.evals.join('\n') + '\n'  + data.label;
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
};

export const treeAnswerDemo = {
  nodes: treeAnswerPathNodes.map(processNode),
  edges: treeDemoEdges,
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  }
};