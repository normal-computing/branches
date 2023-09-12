import { ToTNodeData, Settings } from "./types";
import { ChatCompletionRequestMessage } from "openai-streams";
import { MAX_AUTOLABEL_CHARS } from "./constants";
import { Node } from "reactflow";
import * as nunjucks from "nunjucks";

export function messageFromNode(
  currNode: Node<ToTNodeData>,
  settings: Settings
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
