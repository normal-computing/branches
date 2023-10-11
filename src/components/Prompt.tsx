import { MIXPANEL_TOKEN } from "../main";
import { Row, Center, Column } from "../utils/chakra";
import { getFluxNodeColor, getFluxNodeTypeDarkColor } from "../utils/color";
import { setFluxNodeStreamId } from "../utils/fluxNode";
import { ToTNodeData, FluxNodeType, Settings } from "../utils/types";
import { BigButton } from "./utils/BigButton";
import { Markdown } from "./utils/Markdown";
import { NotAllowedIcon } from "@chakra-ui/icons";
import { Spinner, Button, Heading } from "@chakra-ui/react";
import mixpanel from "mixpanel-browser";
import { useState, useEffect, useRef } from "react";
import { Node, useReactFlow } from "reactflow";

export function Prompt({
  lineage,
  submitPrompt,
  selectNode,
}: {
  lineage: Node<ToTNodeData>[];
  onType: (text: string) => void;
  submitPrompt: () => Promise<void>;
  selectNode: (id: string) => void;
  apiKey: string | null;
}) {
  const { setNodes } = useReactFlow();

  const promptNode = lineage[0];

  const promptNodeType = promptNode.data.fluxNodeType;

  const onMainButtonClick = () => {
    submitPrompt();
  };

  const stopGenerating = () => {
    // Reset the stream id.
    setNodes((nodes) =>
      setFluxNodeStreamId(nodes, { id: promptNode.id, streamId: undefined })
    );

    if (MIXPANEL_TOKEN) mixpanel.track("Stopped generating response");
  };

  /*//////////////////////////////////////////////////////////////
                              STATE
  //////////////////////////////////////////////////////////////*/

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  /*//////////////////////////////////////////////////////////////
                              EFFECTS
  //////////////////////////////////////////////////////////////*/

  const textOffsetRef = useRef<number>(-1);

  // Scroll to the prompt buttons
  // when the bottom node is swapped.
  useEffect(() => {
    window.document
      .getElementById("promptButtons")
      ?.scrollIntoView(/* { behavior: "smooth" } */);
  }, [promptNode.id]);

  /*//////////////////////////////////////////////////////////////
                              APP
  //////////////////////////////////////////////////////////////*/

  console.log("lineage", lineage);

  let slicedLineage;

  if (lineage.length === 2) {
    slicedLineage = lineage.slice(0, 1);
  } else if (lineage.length === 3) {
    slicedLineage = lineage.slice(1);
  } else if (lineage.length === 4) {
    slicedLineage = [...lineage.slice(0, 1), ...lineage.slice(2)];
    slicedLineage = slicedLineage;
  } else {
    slicedLineage = lineage;
  }

  return (
    <>
      {lineage.length > 1 &&
        slicedLineage
          .reverse()
          .slice(lineage.length > 2 ? 1 : 0)
          .map((node, i) => {
            const isLast = i === lineage.length - 1;

            const data = node.data;

            return (
              <>
                {data.streamId && data.text === "" ? (
                  <Center expand>
                    <Spinner />
                  </Center>
                ) : (
                  <>
                    <Button
                      display={
                        hoveredNodeId === promptNode.id && promptNode.id === node.id
                          ? "block"
                          : "none"
                      }
                      onClick={() =>
                        data.streamId ? stopGenerating() : console.log("no stream ID")
                      }
                      position="absolute"
                      top={1}
                      right={1}
                      zIndex={10}
                      variant="outline"
                      border="0px"
                      p={1}
                      _hover={{ background: "none" }}
                    >
                      <NotAllowedIcon boxSize={4} />
                    </Button>
                    <Column
                      width="100%"
                      marginRight="30px"
                      whiteSpace="pre-wrap" // Preserve newlines.
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="flex-start"
                      borderRadius="6px"
                      wordBreak="break-word"
                      minHeight={
                        data.fluxNodeType === FluxNodeType.User && isLast ? "75px" : "0px"
                      }
                    >
                      <Markdown text={"```python\n" + data.text + "\n```"} />
                    </Column>
                  </>
                )}
              </>
            );
          })}

      {lineage.length == 1 && (
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="stretch"
          width="100%"
          height="100px"
          id="promptButtons"
        >
          <BigButton
            tooltip=""
            onClick={onMainButtonClick}
            color={getFluxNodeTypeDarkColor(promptNodeType)}
            width="100%"
            height="100%"
            fontSize="lg"
          >
            Generate children nodes
          </BigButton>
        </Row>
      )}
      {lineage.length > 2 && (
        <>
          <Heading as="h4" size="md">
            Explanation
          </Heading>

          <Markdown text={"```\n" + lineage[lineage.length - 3].data.text + "\n```"} />
        </>
      )}
    </>
  );
}
