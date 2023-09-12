import * as nunjucks from "nunjucks";
import { writeFile } from "fs";
import * as fs from "fs";
import { llm } from "./llm";
import * as math from "mathjs";

function validateLLMOutput(input: string, output: string): boolean {
  const cleanedOutput =
    output
      .trim()
      .split("\n")
      .pop()
      ?.toLowerCase()
      .replace("answer: ", "")
      .split("=")[0] || "";
  const numbers = cleanedOutput.match(/\d+/g) || [];
  const problemNumbers = input.match(/\d+/g) || [];

  if (numbers.sort().join("") !== problemNumbers.sort().join("")) {
    return false;
  }

  try {
    return math.evaluate(cleanedOutput) === 24;
  } catch (e) {
    return false;
  }
}

nunjucks.configure({ autoescape: true });

class Node {
  input: string;
  steps: string[] = [];
  output?: string | null = null;

  constructor(input: string, steps?: string[], output?: string | null) {
    this.input = input;
    if (steps) this.steps = steps;
    if (output !== undefined) this.output = output;
  }

  toRepr(): string {
    // You need to define how you want to represent the Node here.
    return `Node(input='${this.input}', steps=[${this.steps
      .map((s) => `'${s}'`)
      .join(", ")}], output='${this.output}')`;
  }
}

function logDictToJson(data: any, filename: string): void {
  function convertNodesToRepr(obj: any): any {
    if (obj instanceof Node) {
      return obj.toRepr();
    } else if (obj !== null && typeof obj === "object") {
      const newObj: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        newObj[key] = convertNodesToRepr(obj[key]);
      }
      return newObj;
    } else {
      return obj;
    }
  }

  const jsonString = JSON.stringify(convertNodesToRepr(data), null, 4);
  writeFile(`${filename}.json`, jsonString, (err) => {
    if (err) {
      console.error("Failed to save the JSON file:", err);
    }
  });
}

function getCurrentNumbers(val: string): string {
  const lastLine = val.trim().split("\n").pop() || "";
  return lastLine.split("left: ").pop()?.split(")")[0] || "";
}

// PROPOSE PROMPT
const proposePromptTemplate = `{% for example in examples %}
Input: {{ example.input }}
Possible next steps:
{% for next_step in example.next_steps %}{{ next_step }}
{% endfor %}{% endfor %}
Input: {{ input }}
Possible next steps:
`;

const proposeExamples = [
  {
    input: "3 8 9",
    next_steps: [
      "9 / 3 = 3 (left: 3 8)",
      "3 * 8 = 24 (left: 24 9)",
      "9 * 3 = 27 (left: 27 8)",
      "9 - 8 = 1 (left: 1 3)",
    ],
  },
  {
    input: "3 3 7",
    next_steps: [
      "3 + 7 = 10 (left: 10 3)",
      "3 * 3 = 9 (left: 9 7)",
      "7 - 3 = 4 (left: 4 3)",
      "3 - 3 = 0 (left: 0 7)",
    ],
  },
];

// Create function to render the propose prompt by parsing the jinja
function textPromptDecorator(fn: Function) {
  return function (input: string, examples = proposeExamples) {
    const renderedTemplate = nunjucks.renderString(proposePromptTemplate, {
      input,
      examples,
    });
    return fn(renderedTemplate);
  };
}

export const proposePrompt = textPromptDecorator((renderedTemplate: string) => {
  return renderedTemplate;
});

type LLMOUTPUT = string[] | string;
function getNextSteps(llmOutput: LLMOUTPUT, maxSteps: number = 5): string[] {
  if (typeof llmOutput === "string") {
    let nextSteps = llmOutput.trim().split("\n");
    return nextSteps.slice(0, maxSteps);
  } else if (Array.isArray(llmOutput)) {
    // Check if it's an array before attempting to map
    return ([] as string[]).concat(
      ...llmOutput.map((item) => getNextSteps(item, maxSteps))
    );
  } else {
    // Return an empty array as a fallback
    return [];
  }
}

// COT PROMPT
const cotPromptTemplate = `Use numbers and basic arithmetic operations (+ - * /) to obtain 24. Be sure to use numbers uniquely only once. Each step, you are only allowed to choose two of the remaining numbers to obtain a new number.
{% for example in examples %}
Input: {{ example.input }}
Steps:
{% for step in example.steps %}
{{ step }}
{% endfor %}
Answer: {{ example.output }}
{% endfor %}
Input: {{input}}
Steps:
`;

const cot_examples = [
  {
    input: "3 3 5",
    steps: ["3 + 5 = 8 (left: 8 3)", "8 * 3 = 24 (left: 24)"],
    output: "(3 + 5) * 3 = 24",
  },
  {
    input: "3 8 9",
    steps: ["9 / 3 = 3 (left: 3 8)", "3 * 8 = 24 (left: 24)"],
    output: "(9 / 3) * 8 = 24",
  },
  {
    input: "5 8 8",
    steps: ["8 - 5 = 3 (left: 3 8)", "3 * 8 = 24 (left: 24)"],
    output: "(8 - 5) * 3 = 24",
  },
  {
    input: "3 3 9",
    steps: ["9 * 3 = 27 (left: 27 3)", "27 - 3 = 24 (left: 24)"],
    output: "(9 * 3) - 3 = 24",
  },
  {
    input: "2 5 7",
    steps: ["7 + 5 = 12 (left: 12 2)", "12 * 2 = 24 (left: 24)"],
    output: "(7 + 5) * 2 = 24",
  },
];

type RenderFunction = (template: string) => string;
// Create function to render the cot prompt by parsing the jinja
function cotPromptDecorator(fn: RenderFunction): RenderFunction {
  type Example = {
    input: string;
    steps: string[];
    output: string;
  };

  return function (input: string, examples: Example[] = cot_examples): string {
    const renderedTemplate = nunjucks.renderString(cotPromptTemplate, {
      input,
      examples,
    });
    return fn(renderedTemplate);
  };
}

export const cotPrompt = cotPromptDecorator((renderedTemplate: string) => {
  return renderedTemplate;
});

async function nodeGenerator(node: Node, fanout: number = 5): Promise<Node[]> {
  let currNumsStr: string;

  console.log("node", node);

  if (node.steps.length === 0) {
    currNumsStr = node.input;
  } else {
    currNumsStr = getCurrentNumbers(node.steps[node.steps.length - 1]);
    // Assuming getCurrentNumbers has been defined in TypeScript as shared before
  }

  if (currNumsStr !== "24") {
    let prompt = proposePrompt(currNumsStr);
    // Assuming proposePrompt function exists and returns a string

    let llmOutput = await llm(prompt);
    // Assuming llm function exists and returns the desired output
    let nextSteps = getNextSteps(llmOutput, fanout);
    console.log("next steps", nextSteps);

    let newNodes: Node[] = nextSteps.map(
      (step) => new Node(node.input, node.steps.concat([step]))
    );

    return newNodes;
  } else {
    let prompt = cotPrompt(node.input);
    // Assuming cotPrompt function exists and returns a string

    let answer = (await llm(prompt)) as string;
    // Remember to await llm here too, as it's an async operation
    let leafNode = new Node(node.input, node.steps, answer);
    return [leafNode];
  }
}

// VALUE PROMPT
const valuePromptTemplate = `Evaluate if given numbers can reach 24 (sure/likely/impossible)
{% for example in examples %}
Input: {{ example.input }}
{% for step in example.steps %}
{{ step }}
{% endfor %}
{{ example.output }}
{% endfor %}
Input: {{input}}
`;

const value_examples = [
  { input: "10 14", steps: ["10 + 14 = 24"], output: "sure" },
  {
    input: "11 12",
    steps: ["11 + 12 = 23", "12 - 11 = 1", "11 * 12 = 132", "11 / 12 = 0.91"],
    output: "impossible",
  },
  {
    input: "4 4 10",
    steps: [
      "4 + 4 + 10 = 8 + 10 = 18",
      "4 * 10 - 4 = 40 - 4 = 36",
      "(10 - 4) * 4 = 6 * 4 = 24",
    ],
    output: "sure",
  },
  { input: "4 9 11", steps: ["9 + 11 + 4 = 20 + 4 = 24"], output: "sure" },
  {
    input: "5 7 8",
    steps: [
      "5 + 7 + 8 = 12 + 8 = 20",
      "(8 - 5) * 7 = 3 * 7 = 21",
      "I cannot obtain 24 now, but numbers are within a reasonable range",
    ],
    output: "likely",
  },
  {
    input: "5 6 6",
    steps: [
      "5 + 6 + 6 = 17",
      "(6 - 5) * 6 = 1 * 6 = 6",
      "I cannot obtain 24 now, but numbers are within a reasonable range",
    ],
    output: "likely",
  },
  {
    input: "10 10 11",
    steps: ["10 + 10 + 11 = 31", "(11 - 10) * 10 = 10", "10 10 10 are all too big"],
    output: "impossible",
  },
  {
    input: "1 3 3",
    steps: ["1 * 3 * 3 = 9", "(1 + 3) * 3 = 12", "1 3 3 are all too small"],
    output: "impossible",
  },
  { input: "24", steps: ["24 = 24 (solved, no steps needed)"], output: "sure" },
];

function valuePromptDecorator(fn: Function) {
  return function (input: string, examples = value_examples) {
    const renderedTemplate = nunjucks.renderString(valuePromptTemplate, {
      input,
      examples,
    });
    return fn(renderedTemplate);
  };
}

export const valuePrompt = valuePromptDecorator((renderedTemplate: string) => {
  return renderedTemplate;
});

const valueLastStepPromptTemplate = `Use numbers and basic arithmetic operations (+ - * /) to obtain 24. Given an input and an answer, give a judgement (sure/impossible) if the answer is correct, i.e. it uses each input exactly once and no other numbers, and reach 24.
{% for example in examples %}
Input: {{ example.input }}
Answer: {{ example.answer }}
Judge: {{ example.judge }}
{% endfor %}
Input: {{input}}
Answer: {{answer}}
Judge:`;

const value_last_step_examples = [
  { input: "3 3 5", answer: "(5 + 3) * 3 = 24", judge: "sure" },
  { input: "3 3 5", answer: "(3 - 3) * 5 = 24", judge: "impossible" },
  { input: "2 5 7", answer: "(7 + 5) * 2 = 24", judge: "sure" },
  { input: "2 5 7", answer: "(7 - 5) * 2 = 24", judge: "impossible" },
  { input: "5 8 8", answer: "(8 + 8) - 5 = 24", judge: "impossible" },
  { input: "5 8 8", answer: "(8 - 5) / 8 = 24", judge: "impossible" },
];

function valueLastStepPromptDecorator(fn: Function) {
  return function (input: string, answer: string, examples = value_last_step_examples) {
    const renderedTemplate = nunjucks.renderString(valueLastStepPromptTemplate, {
      input,
      answer,
      examples,
    });
    return fn(renderedTemplate);
  };
}

export const valueLastStepPrompt = valueLastStepPromptDecorator(
  (renderedTemplate: string) => {
    return renderedTemplate;
  }
);

type ValueOutputs = string[] | string[][];

function parseAndCompute(valueOutputs: ValueOutputs): number | number[] {
  const valueMap: { [key: string]: number } = {
    impossible: 0.001,
    likely: 1,
    sure: 20,
  }; // TODO: ad hoc

  function computeValue(sample: string[]): number {
    const valueNames = sample.map((s) => s.split("\n").slice(-1)[0]);
    return Object.entries(valueMap).reduce((sum, [name, value]) => {
      return sum + value * valueNames.filter((vName) => vName === name).length;
    }, 0);
  }

  // Determine if valueOutputs is a single sample or multiple samples
  if (Array.isArray(valueOutputs[0])) {
    // Handling multiple samples
    return (valueOutputs as string[][]).map(computeValue);
  } else {
    // Handling a single sample
    return computeValue(valueOutputs as string[]);
  }
}

// TODO: CHECK VALIDITY OF NODE BY GRAMMAR CHECKING
function validNode(node: Node): boolean {
  return true;
}

async function nodeEvaluatorMulti(nodes: Node[]): Promise<[number, string[]][]> {
  const N_EVAL = 3;

  const prompts: string[] = [];
  const nodeValidity: boolean[] = [];

  for (const node of nodes) {
    if (!validNode(node)) {
      nodeValidity.push(false);
      continue;
    }

    let prompt: string;

    if (node.output) {
      const ansExpr = node.output.toLowerCase().replace("answer: ", "");
      prompt = valueLastStepPrompt(node.input, ansExpr);
    } else {
      const currNumsStr = getCurrentNumbers(node.steps[node.steps.length - 1]);
      prompt = valuePrompt(currNumsStr);
    }

    prompts.push(prompt);
    nodeValidity.push(true);
  }

  let llmOutputs: string[][] = []; // Defaulting to an array of string arrays

  if (prompts.length > 0) {
    const results = await Promise.all(prompts.map((prompt) => llm(prompt, N_EVAL)));

    // After all promises are resolved, results will be an array of the resolved values.
    if (Array.isArray(results[0])) {
      // Using a type guard
      llmOutputs = results as string[][];
    } else {
      throw new Error("Unexpected output format from llm.");
    }
  }

  const results: [number, string[]][] = [];
  let j = 0; // Counter for valid nodes

  for (let i = 0; i < nodes.length; i++) {
    if (nodeValidity[i]) {
      const valueOutput = parseAndCompute(llmOutputs[j]);
      const value = Array.isArray(valueOutput) ? valueOutput[0] : valueOutput;

      results.push([value, llmOutputs[j]]);
      j++;
    } else {
      results.push([-1, ["invalid node, will log reason later"]]);
    }
  }

  return results;
}

type Proposal = {
  node: Node;
  value: number;
  propEval: string[];
  isTerminal: boolean;
  isValid: boolean;
};

export async function treeOfThoughtsBfs(x: string): Promise<string[]> {
  const N_BEST = 5;
  const N_STEPS = 3;

  const terminalData: Proposal[] = [];
  const root = new Node(x);
  let queue: Node[] = [root];

  for (let step = 0; step < N_STEPS; step++) {
    const allProposalData: Proposal[] = [];

    for (let node of queue) {
      const nextNodes = await nodeGenerator(node);
      const nextNodeValuesAndLogs = await nodeEvaluatorMulti(nextNodes);

      nextNodes.forEach((nextNode, idx) => {
        const proposal: Proposal = {
          node: nextNode,
          value: nextNodeValuesAndLogs[idx][0],
          propEval: nextNodeValuesAndLogs[idx][1],
          isTerminal: nextNode.output !== null,
          isValid: nextNodeValuesAndLogs[idx][0] > -1,
        };

        allProposalData.push(proposal);

        if (proposal.isTerminal) {
          terminalData.push(proposal);
        }
      });
    }

    console.log(`>> step ${step + 1}: ${allProposalData.length} proposals`);

    if (!loggingDict[root.input]) {
      loggingDict[root.input] = { steps: [] };
    }
    loggingDict[root.input].steps.push({
      queue: [...queue],
      allProposals: allProposalData,
    });

    const validProposalData = allProposalData.filter((p) => p.isValid && !p.isTerminal);
    const sortedProposalData = validProposalData.sort((a, b) => b.value - a.value);
    queue = sortedProposalData.slice(0, N_BEST).map((p) => p.node);
  }

  // Sanity check
  if (!terminalData.every((p) => p.node.output !== null)) {
    throw new Error("Sanity check failed: Not all terminal nodes have an output.");
  }

  // Log terminal nodes
  loggingDict[root.input].terminalData = terminalData;

  const validTerminals = terminalData.filter((p) => p.isValid);
  const sortedValidTerminalData = validTerminals.sort((a, b) => b.value - a.value);
  const answers = sortedValidTerminalData.slice(0, N_BEST).map((p) => p.node.output!);

  return answers;
}

async function testTotBfs(): Promise<void> {
  loggingDict = {}; // Resetting loggingDict

  // Assuming inputs is a global or module-level array
  const outputs: string[][] = [];

  for (const x of inputs) {
    const answers = await treeOfThoughtsBfs(x); // Assuming treeOfThoughtsBfs is async
    outputs.push(answers);

    if (!loggingDict[x]) {
      loggingDict[x] = { answers: [] };
    }
    loggingDict[x]["answers"] = answers;
    console.log(`>> x = ${x}, answers = ${answers}`);

    // Assuming logDictToJson is a function available in your TS code
    logDictToJson(loggingDict, "logging_dict_tot");
  }

  const statusMatrix: boolean[][] = [];
  for (let i = 0; i < inputs.length; i++) {
    const x = inputs[i];
    const ys = outputs[i];

    const status = ys.map((y) => validateLLMOutput(x, y)); // Assuming validateLlmOutput is defined elsewhere
    statusMatrix.push(status);
  }

  const nAnyCorrect = statusMatrix.filter((row) => row.some(Boolean)).length;
  const avgCorrect =
    statusMatrix.map((row) => row.filter(Boolean).length).reduce((a, b) => a + b, 0) /
    inputs.length;

  console.log("ToT Prompting");
  console.log(`n_inputs: ${inputs.length}`);
  console.log(`n_inputs (min 1 correct): ${nAnyCorrect}`);
  console.log(`avg number of correct answers per input: ${avgCorrect.toFixed(2)}`);
}

async function main() {
  // let root = new Node("3 3 8");
  // // console.log(root);
  // let nodes = await nodeGenerator(root);
  // // let eval_nodes = await Promise.all(nodes.map(nodeEvaluator));
  // // console.log(eval_nodes);
  // let eval_nodes = await nodeEvaluatorMulti(nodes);
  // console.log(eval_nodes);
  // logDictToJson(nodes, "nodes");

  // let ans = await llm(valuePrompt("3 3 8"));
  // console.log(ans);

  const filePath = "../data/game24_3nums.csv";

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.trim().split("\n");
    // Assuming the header is the first line, skip it
    inputs = lines.slice(1);
    console.log(inputs);
  } catch (error) {
    console.error("Error reading the file:", error);
  }
  // inputs = [
  //     "1 2 8",
  //     "1 3 6",
  //     "3 4 4",
  //     "8 8 8",
  //     "4 4 5"
  // ]
  testTotBfs();
}

let loggingDict: { [key: string]: { [key: string]: any[] } } = {};
let inputs: string[];
main();
