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

  return (
    <>
      {lineage.length > 1 &&
        lineage
          .slice(0, lineage.length - 1)
          .reverse()
          .map((node, i) => {
            const isLast = i === lineage.length - 1;

            const data = node.data;
            const errors = data.errors || [];
            const explanations = data.explanations || [];
            console.log("lineage", lineage);
            console.log("these are the explanations", explanations);

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
                      {errors[i] && (
                        <div
                          style={{
                            marginTop: "10px",
                            marginBottom: "20px",
                            color: "red",
                          }}
                        >
                          <strong>Error:</strong>
                          <Markdown text={"```\n" + errors[i] + "\n```"} />
                        </div>
                      )}
                      {explanations[i] && (
                        <div
                          style={{
                            marginTop: "10px",
                            marginBottom: "20px",
                            color: "green",
                          }}
                        >
                          <strong>Explanation:</strong>
                          <Markdown text={"```\n" + explanations[i] + "\n```"} />
                        </div>
                      )}
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
    </>
  );
}
