import { MIXPANEL_TOKEN } from "../../main";
import { Row } from "../../utils/chakra";
import { modifyFluxNodeLabel, modifyReactFlowNodeProperties } from "../../utils/fluxNode";
import { ToTNodeData } from "../../utils/types";
import { Box, Input, Tooltip } from "@chakra-ui/react";
import mixpanel from "mixpanel-browser";
import { useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { FaChevronDown, FaChevronRight } from "react-icons/fa"; // Import the icons

export function LabelUpdaterNode({
  id,
  data,
  isConnectable,
}: {
  id: string;
  data: ToTNodeData;
  isConnectable: boolean;
}) {
  const { setNodes } = useReactFlow();

  const [renameLabel, setRenameLabel] = useState(data.label);

  const inputId = `renameInput-${id}`;

  // Select the input element on mount.
  useEffect(() => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;

    // Have to do this with a bit of a delay to
    // ensure it works when triggered via navbar.
    setTimeout(() => input?.select(), 50);
  }, []);

  const cancel = () => {
    setNodes((nodes) =>
      // Reset the node type to the default
      // type and make it draggable again.
      modifyReactFlowNodeProperties(nodes, {
        id,
        type: undefined,
        draggable: true,
      })
    );

    if (MIXPANEL_TOKEN) mixpanel.track("Canceled renaming");
  };

  const submit = () => {
    setNodes((nodes) =>
      modifyFluxNodeLabel(nodes, {
        id,
        label: renameLabel,
      })
    );

    if (MIXPANEL_TOKEN) mixpanel.track("Node renamed");
  };

  return (
    <Tooltip label="⏎">
      <Box width="150px" height="38px">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

        <Row mainAxisAlignment="center" crossAxisAlignment="center" height="100%" px={2}>
          {data.expanded ? <FaChevronDown /> : <FaChevronRight />}{" "}
          <Input
            onBlur={cancel}
            id={inputId}
            value={renameLabel}
            onChange={(e: any) => setRenameLabel(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" ? submit() : e.key === "Escape" && cancel()
            }
            className="nodrag" // https://reactflow.dev/docs/api/nodes/custom-nodes/#prevent-dragging--selecting
            textAlign="center"
            size="xs"
            // px={6}
          />
        </Row>

        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
      </Box>
    </Tooltip>
  );
}
