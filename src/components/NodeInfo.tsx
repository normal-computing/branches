import { Node, useReactFlow } from "reactflow";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { Column, Row } from "../utils/chakra";
import { BigButton } from "./utils/BigButton";
import {
  FluxNodeData,
  FluxNodeType,
  HistoryItem,
  Settings,
  CreateChatCompletionStreamResponseChoicesInner,
  ReactFlowNodeTypes,
} from "../utils/types";
import { Prompt } from "./Prompt";
import { getPlatformModifierKey, getPlatformModifierKeyText } from "../utils/platform";
import { getFluxNodeTypeColor, getFluxNodeTypeDarkColor } from "../utils/color";

export function NodeInfo({
  lineage,
  settings,
  setSettings,
  isGPT4,
  selectNode,
  submitPrompt,
  newConnectedToSelectedNode,
  apiKey,
  onCreateNewConversation,
  onPromptType,
}: {
  lineage: Node<FluxNodeData>[] | null;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  isGPT4: boolean;
  submitPrompt: (p: boolean) => Promise<void>;
  selectNode: (id: string) => void;
  newConnectedToSelectedNode: (type: FluxNodeType) => void;
  apiKey: string | null;
  onCreateNewConversation: () => void;
  onPromptType: (text: string) => void;
}) {
  return (
    <Tabs>
      <TabList>
        <Tab>Details</Tab>
        <Tab>Conversation</Tab>
      </TabList>

      <TabPanels>
        <TabPanel className="tab-panel-full-width">
          <p>TODO: add info</p>
        </TabPanel>
        <TabPanel className="tab-panel-full-width">
          {lineage && lineage.length >= 1 ? (
            <Prompt
              settings={settings}
              setSettings={setSettings}
              isGPT4={isGPT4}
              selectNode={selectNode}
              newConnectedToSelectedNode={newConnectedToSelectedNode}
              lineage={lineage}
              onType={onPromptType}
              submitPrompt={() => submitPrompt(false)}
              apiKey={apiKey}
            />
          ) : (
            <Column
              expand
              textAlign="center"
              mainAxisAlignment={"center"}
              crossAxisAlignment={"center"}
            >
              <BigButton
                tooltip={`⇧${getPlatformModifierKeyText()}P`}
                width="400px"
                height="100px"
                fontSize="xl"
                onClick={() => onCreateNewConversation()}
                color={getFluxNodeTypeDarkColor(FluxNodeType.GPT)}
              >
                Create a new conversation tree
              </BigButton>
            </Column>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
