import React, { useState, useEffect } from "react";
import { View, styled, YStack, Image, Dialog, XStack, Button } from "tamagui";

import { SketchCanvas } from "@terrylinla/react-native-sketch-canvas";

interface WhiteboardItemProps {
  itemData: {
    name: string; // name of the item (do not change)
    imageUri: string; // picture uri of the item (do not change)
    [key: string]: any; // any other properties (do not change)

    // add custom properties below ------

    // ---------------------------------
  };
  onDataUpdate: (newItemData: Record<string, any>) => void; // updates item data when called (do not change)
  isActive: boolean; // whether item is active/clicked (do not change)
  onClose: () => void; // called when dialog is closed (important, as it will unlock the item) (do not change)
  roomInfo: {
    name: string;
    users: {
      id: string;
      displayName: string;
      profilePicture?: string;
      isAdmin: boolean;
    }[];
    description: string;
  }; // various room info (do not change)
}

interface WhiteboardItemComponent extends React.FC<WhiteboardItemProps> {
  getInitialData: () => {};
}

const WhiteboardItem: WhiteboardItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Custom properties (remove these)

  // Opens dialog when item is active/clicked
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose(); // ensure you call onClose when dialog is closed (important, as it will unlock the item)
  };

  // Renders item when not active/clicked
  // (default state of item on shelf)
  if (!isActive) {
    return (
      <YStack flex={1}>
        <Image source={{ uri: itemData.imageUri }} width="80%" height="80%" />
      </YStack>
    );
  }

  // Renders item when active/clicked
  // (item is clicked and dialog is open, feel free to change this return)
  return (
    <YStack flex={1}>
      <Dialog modal open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <Dialog.Title>Draw on the Whiteboard</Dialog.Title>
            <YStack padding="$4" gap="$4">
              <SketchCanvas
                strokeColor={"red"}
                strokeWidth={7}
              />
            </YStack>
            <Dialog.Close displayWhenAdapted asChild>
              <Button theme="alt1" aria-label="Close">
                Close
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
};

// Initializes item data (default values)
WhiteboardItem.getInitialData = () => ({ color: "red", clickCount: 0 });

export default WhiteboardItem; // do not remove the export (but change the name of the Item to match the name of the file)
