import React from "react";

import ReactDOM from "react-dom/client";

import { ReactFlowProvider } from "reactflow";

import { ChakraProvider } from "@chakra-ui/react";

import mixpanel from "mixpanel-browser";

import App from "./components/App";

import "./index.css";

// change the below line if `MIXPANEL_TOKEN` is needed; 
// if so, must change `module` in `tsconfig.json`.
export const MIXPANEL_TOKEN = ""; // import.meta.env.VITE_MIXPANEL_TOKEN;

if (MIXPANEL_TOKEN) mixpanel.init(MIXPANEL_TOKEN);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </ReactFlowProvider>
  </React.StrictMode>
);
