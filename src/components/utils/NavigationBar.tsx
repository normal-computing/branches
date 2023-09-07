import { Button, Box, Text } from "@chakra-ui/react";

import { Row } from "../../utils/chakra";

export function NavigationBar({
  onOpenSettingsModal,
}: {
  onOpenSettingsModal: () => void;
}) {
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      height="100%"
      width="auto"
    >
      <Text whiteSpace="nowrap">
        <b>Flux</b> <small>Tree of Thoughts</small>
      </Text>

      <Box mx="20px" height="100%" width="1px" bg="#EEEEEE" />

      <Button
        variant="ghost"
        height="80%"
        px="5px"
        ml="11px"
        onClick={onOpenSettingsModal}
      >
        Settings
      </Button>
    </Row>
  );
}
