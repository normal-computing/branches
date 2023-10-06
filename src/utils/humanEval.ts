import HUMAN_EVAL_PROBLEMS from "./human_eval_problems.json";

// Prompt Templates
// const q_template = (question: string): string => {
//     return `
//     You are a smart and capable agent. Given the header of python function, only output the body of the program.

//     QUESTION:
//     ----
//     ${question}
//     ----
//     ANSWER:
//     ----
//     `;
// }

export const q_template = (question: string): string => {
  return `${question}`;
};

const error2explanation = (question: string, answer: string, error: string): string => {
  return `
    You are a smart and capable agent and can learn from your mistakes. You can correctly debug and code a python program.
    Only output the explanation of the traceback error so that you can fix the previous answer by rewriting. Do not output code.

    QUESTION:
    ----
    ${question}
    ----
    ANSWER:
    ----
    ${answer}
    ----
    ERROR TRACEBACK:
    ----
    ${error}
    ----
    EXPLANATION:
    ----
    `;
};

const explanation2code = (
  question: string,
  answer: string,
  error: string,
  explanation: string
): string => {
  return `
    You are a smart and capable agent who can learn from mistakes. Given an incorrect code and its error traceback, correct the completion answer by incorporating the explanation. 
    Only output the body of the completion answer.

    QUESTION:
    ----
    ${question}
    ----
    ANSWER:
    ----
    ${answer}
    ----
    ERROR TRACEBACK:
    ----
    ${error}
    ----
    EXPLANATION:
    ----
    ${explanation}
    ----
    ANSWER:
    ----
    `;
};

// currently we need to choose amongst predefined humaneval questions called task id - here we choose the 21st one
const t1 = "HumanEval/22";

const q1 = `from typing import List\n\n\ndef rescale_to_unit(numbers: List[float]) -> List[float]:\n    """ Given list of numbers (of at least two elements), apply a linear transform to that list,\n    such that the smallest number will become 0 and the largest will become 1\n    >>> rescale_to_unit([1.0, 2.0, 3.0, 4.0, 5.0])\n    [0.0, 0.25, 0.5, 0.75, 1.0]\n    """\n`;

let prompt = q_template(q1);
let answer = (await llm(prompt)) as string;
console.log(answer);
console.log(typeof answer);

let data = {
  // "task_id": t1,
  // "prompt": prompt,
  problem: HUMAN_EVAL_PROBLEMS[t1],
  completion: answer,
};

// Sending a POST request to the server
let url = "http://127.0.0.1:5000/execute"; // Replace with your server's URL
let response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});

// Parse JSON response
let jsonResponse = await response.json();
console.log(jsonResponse);

// if code fails, regen
if (jsonResponse.result.passed === false) {
  let ex_prompt = error2explanation(q1, answer, jsonResponse.result.result);
  let explanation = (await llm(ex_prompt, 1)) as string;
  console.log(explanation);

  let ans_prompt = explanation2code(q1, answer, jsonResponse.result.result, explanation);
  let re_ans = (await llm(ans_prompt, 1)) as string;
  console.log(re_ans);
}
