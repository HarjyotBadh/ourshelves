import React from "react";
import { Dialog, Button, XStack, YStack } from "tamagui";

interface ColorSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onColorSelect: (color: string) => void;
}

const colors = ["$red10", "$blue10", "$green10", "$yellow10", "$purple10", "$orange10"];

export const ColorSelectionDialog: React.FC<ColorSelectionDialogProps> = ({
  open,
  onOpenChange,
  onColorSelect,
}) => {
  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay key="overlay" />
        <Dialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
        >
          <Dialog.Title>Select a Color</Dialog.Title>
          <Dialog.Description>Choose a color for the placeholder item.</Dialog.Description>
          <YStack padding="$4" gap="$4">
            <XStack flexWrap="wrap" justifyContent="space-between">
              {colors.map((color) => (
                <Button
                  key={color}
                  backgroundColor={color}
                  width={60}
                  height={60}
                  onPress={() => {
                    onColorSelect(color);
                    onOpenChange(false);
                  }}
                />
              ))}
            </XStack>
          </YStack>
          <Dialog.Close displayWhenAdapted asChild>
            <Button theme="alt1" aria-label="Close">
              Cancel
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
