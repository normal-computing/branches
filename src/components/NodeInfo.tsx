import { Node } from "reactflow";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  TagLeftIcon,
  TagLabel,
  List,
  ListItem,
  ListIcon,
  Heading,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { MdCheck, MdQuestionMark, MdClose, MdThumbUpOffAlt } from "react-icons/md";
import { Column } from "../utils/chakra";
import { BigButton } from "./utils/BigButton";
import { FluxNodeData, FluxNodeType, Settings } from "../utils/types";
import { Prompt } from "./Prompt";
import { ToTNodeData } from "./tree";
import { getPlatformModifierKeyText } from "../utils/platform";
import { getFluxNodeTypeDarkColor } from "../utils/color";

function EvalListItem({ item }: { item: string }) {
  const lines = item.split("\n");
  const lastLine = lines[lines.length - 1];
  let icon = null;
  if (lastLine === "sure") {
    icon = <ListIcon as={MdCheck} color="green.500" />;
  } else if (lastLine === "impossible") {
    icon = <ListIcon as={MdClose} color="red.500" />;
  } else if (lastLine === "likely") {
    icon = <ListIcon as={MdQuestionMark} color="yellow.500" />;
  }

  return (
    <ListItem>
      {icon}
      {lines.map((line, i) => {
        return (
          <span key={i}>
            {line}
            <br />
          </span>
        );
      })}
    </ListItem>
  );
}

export function NodeInfo({
  lineage,
  settings,
  setSettings,
  isGPT4,
  selectNode,
  submitPrompt,
  apiKey,
  onCreateNewConversation,
  onPromptType,
}: {
  lineage: Node<FluxNodeData>[] | null;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  isGPT4: boolean;
  submitPrompt: () => Promise<void>;
  selectNode: (id: string) => void;
  newConnectedToSelectedNode: (type: FluxNodeType) => void;
  apiKey: string | null;
  onCreateNewConversation: () => void;
  onPromptType: (text: string) => void;
}) {
  const selectedNode =
    lineage &&
    (lineage.find((n) => n.selected === true) as Node<ToTNodeData> | undefined);
  return (
    <div className="node-info">
      <Tabs>
        <TabList>
          <Tab>Details</Tab>
          <Tab>Conversation</Tab>
        </TabList>

        <TabPanels>
          <TabPanel className="tab-panel-full-width">
            {selectedNode?.data.isTerminal ? (
              <Tag
                size="lg"
                variant="subtle"
                colorScheme="purple"
                style={{ marginRight: "0.5rem" }}
              >
                <TagLeftIcon boxSize="12px" as={MdThumbUpOffAlt} />
                <TagLabel>Terminal</TagLabel>
              </Tag>
            ) : null}
            {selectedNode?.data.isValid ? (
              <Tag size="lg" variant="subtle" colorScheme="green">
                <TagLeftIcon boxSize="12px" as={CheckIcon} />
                <TagLabel>Valid</TagLabel>
              </Tag>
            ) : null}

            <Heading as="h4" size="md">
              Input
            </Heading>
            <p>{selectedNode?.data.input ?? ""}</p>
            <Heading as="h4" size="md">
              Score
            </Heading>
            <p>{selectedNode?.data.score ?? ""}</p>
            {selectedNode?.data.output != "" && (
              <>
                <Heading as="h4" size="md">
                  Output
                </Heading>
                <p>{selectedNode?.data.output ?? ""}</p>
              </>
            )}
            {selectedNode?.data?.steps && selectedNode?.data?.steps.length > 0 && (
              <>
                <Heading as="h4" size="md">
                  Steps
                </Heading>
                <List className="eval-list" spacing={3}>
                  {selectedNode?.data?.steps?.map((item, i) => {
                    return <ListItem key={i}>{item}</ListItem>;
                  })}
                </List>
              </>
            )}
            {selectedNode?.data?.evals && selectedNode?.data?.evals.length > 0 && (
              <>
                <Heading as="h4" size="md">
                  Evaluations
                </Heading>
                <List className="eval-list" spacing={3}>
                  {selectedNode?.data?.evals?.map((item, i) => {
                    return <EvalListItem key={i} item={item} />;
                  })}
                </List>
              </>
            )}
          </TabPanel>
          <TabPanel className="tab-panel-full-width">
            {lineage && lineage.length >= 1 ? (
              <Prompt
                settings={settings}
                setSettings={setSettings}
                isGPT4={isGPT4}
                selectNode={selectNode}
                lineage={lineage}
                onType={onPromptType}
                submitPrompt={submitPrompt}
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
    </div>
  );
}
