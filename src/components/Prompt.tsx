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
  submitPrompt,
  selectedNode,
}: {
  submitPrompt: () => Promise<void>;
  selectedNode: (id: string) => void;
}) {
  const { setNodes } = useReactFlow();

  // const promptNode = lineage[0];

  // const promptNodeType = selectedNode.data.fluxNodeType;

  const onMainButtonClick = () => {
    submitPrompt();
  };

  const stopGenerating = () => {
    // Reset the stream id.
    setNodes((nodes) =>
      setFluxNodeStreamId(nodes, { id: selectedNode.id, streamId: undefined })
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
  // useEffect(() => {
  //   window.document
  //     .getElementById("promptButtons")
  //     ?.scrollIntoView(/* { behavior: "smooth" } */);
  // }, [selectedNode.id]);

  /*//////////////////////////////////////////////////////////////
                              APP
  //////////////////////////////////////////////////////////////*/

  return (
    <>
      {selectedNode &&
        selectedNode?.data &&
        selectedNode.data.solutions.reverse().map((solution, i) => {
          const data = selectedNode.data;
          const errors = data.errors || [];
          const explanations = data.explanations || [];

          return (
            <>
              {data.streamId && data.text === "" ? (
                <Center expand>
                  <Spinner />
                </Center>
              ) : (
                <>
                  <Button
                    display={hoveredNodeId === selectedNode.id ? "block" : "none"}
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
                      "75px" // TODO: may be "0px"
                    }
                  >
                    {solution && (
                      <div
                        style={{
                          marginTop: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <strong>Solution</strong>
                        <Markdown text={"```python\n" + solution + "\n```"} />
                      </div>
                    )}
                    {errors[i] && (
                      <div
                        style={{
                          marginTop: "10px",
                          marginBottom: "20px",
                          color: "red",
                        }}
                      >
                        <strong>Error</strong>
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
                        <strong>Explanation</strong>
                        <Markdown text={"```\n" + explanations[i] + "\n```"} />
                      </div>
                    )}
                  </Column>
                </>
              )}
            </>
          );
        })}

      {
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
            color={getFluxNodeTypeDarkColor(FluxNodeType.User)}
            width="100%"
            height="100%"
            fontSize="lg"
          >
            Generate children nodes
          </BigButton>
        </Row>
      }
    </>
  );
}
