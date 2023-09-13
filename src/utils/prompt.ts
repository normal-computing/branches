import { ToTNodeData } from "./types";
import { ChatCompletionRequestMessage } from "openai-streams";
import { MAX_AUTOLABEL_CHARS } from "./constants";
import { Node } from "reactflow";
import * as nunjucks from "nunjucks";

export function messageFromNode(
  currNode: Node<ToTNodeData>
): ChatCompletionRequestMessage[] {
  const messages: ChatCompletionRequestMessage[] = [];

  console.log(currNode.data.input);
  console.log(currNode.data.output);
  console.log(currNode.data.steps);

  let currNumsStr: string;

  if (currNode.data.steps.length === 0) {
    currNumsStr = currNode.data.input;
  } else {
    currNumsStr = getCurrentNumbers(currNode.data.steps[currNode.data.steps.length - 1]);
    // Assuming getCurrentNumbers has been defined in TypeScript as shared before
  }
  console.log("curr num str", currNumsStr);
  let prompt = proposePrompt(currNumsStr);
  console.log("this is the prompt", prompt);

  messages.push({
    role: "user",
    content: prompt,
  });

  console.table(messages);

  return messages;
}

function getCurrentNumbers(val: string): string {
  console.log("val", val);
  const lastLine = val.trim().split("\n").pop() || "";
  return lastLine.split("left: ").pop()?.split(")")[0] || "";
}

// PROPOSE PROMPT
const proposePromptTemplate = `{% for example in examples %}
Input: {{ example.input }}
Possible next steps:
{% for next_step in example.next_steps %}{{ next_step }}
{% endfor %}{% endfor %}
Provide only 4 possible next steps.
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

const proposePrompt = textPromptDecorator((renderedTemplate: string) => {
  return renderedTemplate;
});

export function formatAutoLabel(text: string) {
  const formattedText = removeInvalidChars(text);

  return formattedText.length > MAX_AUTOLABEL_CHARS
    ? formattedText.slice(0, MAX_AUTOLABEL_CHARS).split(" ").slice(0, -1).join(" ") +
        " ..."
    : formattedText;
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

const valueLastStepPrompt = valueLastStepPromptDecorator((renderedTemplate: string) => {
  return renderedTemplate;
});

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
Steps:\n
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

const cotPrompt = cotPromptDecorator((renderedTemplate: string) => {
  return renderedTemplate;
});

export function cotMessageFromNode(
  currNode: Node<ToTNodeData>
): ChatCompletionRequestMessage[] {
  const messages: ChatCompletionRequestMessage[] = [];

  // Using cotPrompt to generate the prompt
  let prompt = cotPrompt(currNode.data.input) + currNode.data.steps.join("\n");

  messages.push({
    role: "user",
    content: prompt,
  });

  console.table(messages);

  return messages;
}

function removeInvalidChars(text: string) {
  // The regular expression pattern:
  // ^: not
  // a-zA-Z0-9: letters and numbers
  // .,?!: common punctuation marks
  // \s: whitespace characters (space, tab, newline, etc.)
  const regex = /[^a-zA-Z0-9.,'?!-\s+=*\/<>():]+/g;

  // Replace `\n` with spaces and remove invalid characters
  const cleanedStr = text.replaceAll("\n", " ").replace(regex, "");

  return cleanedStr;
}
