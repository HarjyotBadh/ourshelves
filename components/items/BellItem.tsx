import React, { useState, useEffect } from "react";
import { View, styled, YStack } from "tamagui";
import { ColorSelectionDialog } from "../ColorSelectionDialog";

interface BellItemProps {
  itemData: {
    id: string; // unique id of the placed item (do not change)
    itemId: string; // id of the item (do not change)
    name: string; // name of the item (do not change)
    imageUri: string; // picture uri of the item (do not change)
    placedUserId: string; // user who placed the item (do not change)
    [key: string]: any; // any other properties (do not change)

    // add custom properties below ------

    // ---------------------------------
  };
  onDataUpdate: (newItemData: Record<string, any>) => void; // updates item data when called (do not change)
  isActive: boolean; // whether item is active/clicked (do not change)
  onClose: () => void; // called when dialog is closed (important, as it will unlock the item) (do not change)
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  }; // various room info (do not change)
}

interface BellItemComponent extends React.FC<BellItemProps> {
  getInitialData: () => {};
}

// Styling for placeholder item (remove this)
const PlaceholderItemView = styled(View, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
});

const PlaceholderItem: BellItemComponent = ({
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

  

  // Renders item when active/clicked
  // (item is clicked and dialog is open, feel free to change this return)
  return (
    <YStack flex={1}>

    </YStack>
  );
};

// Initializes item data (default values)
PlaceholderItem.getInitialData = () => ({});

export default PlaceholderItem; // do not remove the export (but change the name of the Item to match the name of the file)
