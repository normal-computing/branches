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

export function getFluxNodeColor(isTerminal: boolean) {
  return isTerminal ? "#f7d0a1" : "#d9f3d6";
}

export function getFluxNodeTypeDarkColor(fluxNodeType: FluxNodeType) {
  return "#619F83";
}
