import { BranchesNodeType } from "./types";

export function adjustColor(color: string, amount: number) {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
}

export function getBranchesNodeColor(
  isExplanation: boolean,
  isRunning: boolean,
  isTerminal: boolean,
  isValid: boolean,
  score: number
) {
  if (isRunning) {
    return "#c5e2f6";
  }
  if (isExplanation) {
    return "#EEEEEE";
  }
  if (isTerminal) {
    return "#e9d8fd";
  }
  if (!isValid) {
    return "#f7d0a1";
  }

  return "#c5e2f6";
}

export function getBranchesNodeTypeDarkColor(branchesNodeType: BranchesNodeType) {
  return "#619F83";
}
