import { MIXPANEL_TOKEN } from "../../main";
import { getBranchesNodeTypeDarkColor } from "../../utils/color";
import { DEFAULT_SETTINGS } from "../../utils/constants";
import { Settings, BranchesNodeType } from "../../utils/types";
import { APIKeyInput } from "../utils/APIKeyInput";
import { LabeledSelect, LabeledSlider } from "../utils/LabeledInputs";

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Checkbox,
} from "@chakra-ui/react";
import mixpanel from "mixpanel-browser";
import { ChangeEvent, memo } from "react";

export const SettingsModal = memo(function SettingsModal({
  isOpen,
  onClose,
  settings,
  setSettings,
  apiKey,
  setApiKey,
  availableModels,
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  apiKey: string | null;
  setApiKey: (apiKey: string) => void;
  availableModels: string[] | null;
}) {
  const reset = () => {
    if (
      confirm(
        "Are you sure you want to reset your settings to default? This cannot be undone!"
      )
    ) {
      setSettings(DEFAULT_SETTINGS);

      if (MIXPANEL_TOKEN) mixpanel.track("Restored defaults");
    }
  };

  const hardReset = () => {
    if (
      confirm(
        "Are you sure you want to delete ALL data (including your saved API key, conversations, etc?) This cannot be undone!"
      ) &&
      confirm(
        "Are you 100% sure? Reminder this cannot be undone and you will lose EVERYTHING!"
      )
    ) {
      // Clear local storage.
      localStorage.clear();

      // Ensure that the page is reloaded even if there are unsaved changes.
      window.onbeforeunload = null;

      // Reload the window.
      window.location.reload();

      if (MIXPANEL_TOKEN) mixpanel.track("Performed hard reset");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <LabeledSelect
            label="Model"
            value={settings.model}
            options={availableModels || [settings.model]}
            setValue={(v: string) => {
              setSettings({ ...settings, model: v });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed model");
            }}
          />

          <APIKeyInput mt={4} width="100%" apiKey={apiKey} setApiKey={setApiKey} />

          <LabeledSlider
            mt={4}
            label="Temperature (randomness)"
            value={settings.temp}
            setValue={(v: number) => {
              setSettings({ ...settings, temp: v });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed temperature");
            }}
            color={getBranchesNodeTypeDarkColor(BranchesNodeType.User)}
            max={1.25}
            min={0}
            step={0.01}
          />

          <LabeledSlider
            mt={5}
            label="Answer Fanout"
            value={settings.N_ANSWER_FANOUT}
            setValue={(v: number) => {
              setSettings({ ...settings, N_ANSWER_FANOUT: v });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed answer fanout");
            }}
            color={getBranchesNodeTypeDarkColor(BranchesNodeType.User)}
            max={10}
            min={1}
            step={1}
          />

          <LabeledSlider
            mt={3}
            label="Explanation Fanout"
            value={settings.N_EXPLANATION_FANOUT}
            setValue={(v: number) => {
              setSettings({ ...settings, N_EXPLANATION_FANOUT: v });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed explanation fanout");
            }}
            color={getBranchesNodeTypeDarkColor(BranchesNodeType.User)}
            max={10}
            min={1}
            step={1}
          />

          <Checkbox
            mt={3}
            fontWeight="bold"
            isChecked={settings.autoZoom}
            colorScheme="gray"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setSettings({ ...settings, autoZoom: event.target.checked });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed auto zoom");
            }}
          >
            Auto Zoom
          </Checkbox>
        </ModalBody>

        <ModalFooter>
          <Button mb={2} onClick={reset} mr={3} color="orange">
            Restore Defaults
          </Button>

          <Button mb={2} onClick={hardReset} mr="auto" color="red">
            Hard Reset
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});
