import { FluxNodeType } from "./types";

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

export function getFluxNodeColor(isRunning: boolean, isTerminal: boolean, score: number) {
  if (isRunning) {
    return "#c5e2f6";
  }
  if (isTerminal) {
    return "#f7d0a1";
  }

  const opacity = Math.min(Math.max(score / 60, 0.2), 1); // constrain opacity between 0.2 and 1
  return `rgba(217, 243, 214, ${opacity})`; // RGBA for #d9f3d6 with varying opacity
}

export function getFluxNodeTypeDarkColor(fluxNodeType: FluxNodeType) {
  return "#619F83";
}
