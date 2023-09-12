import { MIXPANEL_TOKEN } from "../main";
import { Row, Center, Column } from "../utils/chakra";
import { getFluxNodeTypeColor, getFluxNodeTypeDarkColor } from "../utils/color";
import { displayNameFromFluxNodeType, setFluxNodeStreamId } from "../utils/fluxNode";
import { ToTNodeData, FluxNodeType, Settings } from "../utils/types";
import { BigButton } from "./utils/BigButton";
import { LabeledSlider } from "./utils/LabeledInputs";
import { Markdown } from "./utils/Markdown";
import { NotAllowedIcon } from "@chakra-ui/icons";
import { Spinner, Text, Button } from "@chakra-ui/react";
import mixpanel from "mixpanel-browser";
import { useState, useEffect, useRef } from "react";
import { Node, useReactFlow } from "reactflow";
import { getPlatformModifierKeyText } from "../utils/platform";

export function Prompt({
  lineage,
  submitPrompt,
  selectNode,
  isGPT4,
  settings,
  setSettings,
}: {
  lineage: Node<ToTNodeData>[];
  onType: (text: string) => void;
  submitPrompt: () => Promise<void>;
  selectNode: (id: string) => void;
  isGPT4: boolean;
  settings: Settings;
  setSettings: (settings: Settings) => void;
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

  const modifierKeyText = getPlatformModifierKeyText();

  return (
    <>
      {lineage
        .slice()
        .reverse()
        .map((node, i) => {
          const isLast = i === lineage.length - 1;

          const data = node.data;

          return (
            <Row
              mb={2}
              p={3}
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              borderRadius="6px"
              borderLeftWidth={isLast ? "4px" : "0px"}
              _hover={{
                boxShadow: isLast ? "none" : "0 0 0 0.5px #1a192b",
              }}
              borderColor={getFluxNodeTypeDarkColor(data.fluxNodeType)}
              position="relative"
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              bg={getFluxNodeTypeColor(data.fluxNodeType)}
              key={node.id}
              onClick={() => {
                const selection = window.getSelection();

                // We don't want to trigger the selection
                // if they're just selecting/copying text.
                if (selection?.isCollapsed) {
                  if (isLast) {
                    if (data.streamId) {
                      stopGenerating();
                    }
                  } else {
                    // TODO: Note this is basically broken because of codeblocks.
                    textOffsetRef.current = selection.anchorOffset ?? 0;

                    selectNode(node.id);
                  }
                }
              }}
              cursor="pointer"
            >
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
                  <Text fontWeight="bold" width="auto" whiteSpace="nowrap">
                    {displayNameFromFluxNodeType(data.fluxNodeType)}
                    :&nbsp;
                  </Text>
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
                    <Markdown text={data.text} />
                  </Column>
                </>
              )}
            </Row>
          );
        })}

      <Row
        mainAxisAlignment="center"
        crossAxisAlignment="stretch"
        width="100%"
        height="100px"
        id="promptButtons"
      >
        <BigButton
          tooltip={
            promptNodeType === FluxNodeType.User
              ? `${modifierKeyText}⏎`
              : `${modifierKeyText}P`
          }
          onClick={onMainButtonClick}
          color={getFluxNodeTypeDarkColor(promptNodeType)}
          width="100%"
          height="100%"
          fontSize="lg"
        >
          {promptNodeType === FluxNodeType.User ? "Generate" : "Compose"}
          <Text fontWeight="extrabold">
            &nbsp;
            {promptNodeType === FluxNodeType.User
              ? displayNameFromFluxNodeType(FluxNodeType.GPT, isGPT4)
              : displayNameFromFluxNodeType(FluxNodeType.User, isGPT4)}
            &nbsp;
          </Text>
          response
        </BigButton>
      </Row>

      {promptNodeType === FluxNodeType.User ? (
        <>
          <LabeledSlider
            mt={3}
            label="Temperature (randomness)"
            value={settings.temp}
            setValue={(v: number) => {
              setSettings({ ...settings, temp: v });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed temperature inline");
            }}
            color={getFluxNodeTypeDarkColor(FluxNodeType.User)}
            max={1.25}
            min={0}
            step={0.01}
          />

          <LabeledSlider
            mt={3}
            label="Number of Responses"
            value={settings.n}
            setValue={(v: number) => {
              setSettings({ ...settings, n: v });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed number of responses inline");
            }}
            color={getFluxNodeTypeDarkColor(FluxNodeType.User)}
            max={10}
            min={1}
            step={1}
          />
        </>
      ) : null}
    </>
  );
}
