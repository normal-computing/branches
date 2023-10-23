import { Node, Edge } from "reactflow";
import {
  Tag,
  TagLeftIcon,
  TagLabel,
  Textarea,
  List,
  ListItem,
  ListIcon,
  Heading,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { MdCheck, MdQuestionMark, MdClose, MdThumbUpOffAlt } from "react-icons/md";
import { Settings, ToTNodeData } from "../utils/types";
import { Prompt } from "./Prompt";
import { getFluxNodeParent } from "../utils/fluxNode";
import { useEffect, useState } from "react";

function EvalListItem({ item }: { item: string }) {
  if (item) {
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
  return <ListItem />;
}

export function NodeInfo({
  lineage,
  selectNode,
  submitPrompt,
  apiKey,
  onPromptType,
  nodes,
  edges,
}: {
  lineage: Node<ToTNodeData>[] | null;
  settings?: Settings;
  setSettings?: (settings: Settings) => void;
  isGPT4?: boolean;
  submitPrompt: () => Promise<void>;
  selectNode: (id: string) => void;
  apiKey: string | null;
  onPromptType: (text: string) => void;
  nodes: Node<ToTNodeData>[];
  edges: Edge[];
}) {
  const selectedNode =
    lineage &&
    (lineage.find((n) => n.selected === true) as Node<ToTNodeData> | undefined);
  const selectedNodeId = selectedNode?.id ?? null;

  const [selectedNodeParent, setSelectedNodeParent] = useState<
    Node<ToTNodeData> | null | undefined
  >(null);

  useEffect(() => {
    const newSelectedNodeParent =
      selectedNodeId !== null ? getFluxNodeParent(nodes, edges, selectedNodeId) : null;
    setSelectedNodeParent(newSelectedNodeParent);
  }, [selectedNodeId, nodes, edges]);

  return (
    <div className="node-info">
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
      {selectedNodeParent || selectedNodeId == null ? (
        <p>{selectedNode?.data.input ?? ""}</p>
      ) : (
        <Textarea
          defaultValue={selectedNode?.data.input ?? ""}
          onChange={(e) => {
            const newText = e.target.value;
            onPromptType(newText);
          }}
        />
      )}

      {selectedNode?.data.output && selectedNode?.data.output != "" && (
        <>
          <Heading as="h4" size="md">
            Output
          </Heading>
          <p>{selectedNode?.data.output ?? ""}</p>
        </>
      )}
      <Heading as="h4" size="md">
        Steps
      </Heading>

      {lineage && lineage.length >= 1 ? (
        <Prompt
          selectNode={selectNode}
          lineage={lineage}
          onType={onPromptType}
          submitPrompt={submitPrompt}
          apiKey={apiKey}
        />
      ) : (
        <></>
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
      {selectedNode?.data.score && (
        <>
          <Heading as="h4" size="md">
            Evaluation Score
          </Heading>
          <p style={{ whiteSpace: "pre-line" }}>{selectedNode?.data.score ?? ""}</p>
        </>
      )}
    </div>
  );
}
