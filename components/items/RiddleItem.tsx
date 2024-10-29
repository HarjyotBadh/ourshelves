import React, { useState, useEffect } from "react";
import { View, styled, YStack } from "tamagui";
import { ColorSelectionDialog } from "../ColorSelectionDialog";
import { auth } from "firebaseConfig";

interface RiddleItemProps {
  itemData: {
    id: string; // unique id of the placed item (do not change)
    itemId: string; // id of the item (do not change)
    name: string; // name of the item (do not change)
    imageUri: string; // picture uri of the item (do not change)
    placedUserId: string; // user who placed the item (do not change)
    [key: string]: any; // any other properties (do not change)

    // add custom properties below ------
    riddleAnswer: string;
    usersSolved: string[];
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

interface RiddleItemComponent extends React.FC<RiddleItemProps> {
  getInitialData: () => {usersSolved: string[]};
}

// Styling for placeholder item (remove this)
const PlaceholderItemView = styled(View, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
});

const RiddleItem: RiddleItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Custom properties (remove these)
  const [riddleAnswer, setRiddleAnswer] =  useState(itemData.riddleAnswer || '');
  const [solvedUsers, setSolvedUsers] = useState<string[]>(itemData.usersSolved || []); // All the users who solved the riddle
  const profileId = auth.currentUser?.uid; // Current user's profile id



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
        <PlaceholderItemView backgroundColor={color}></PlaceholderItemView>
      </YStack>
    );
  }

  // Renders item when active/clicked
  // (item is clicked and dialog is open, feel free to change this return)
  return (
  );
};

// Initializes item data (default values)
RiddleItem.getInitialData = () => ({ usersSolved: [] });

export default RiddleItem; // do not remove the export (but change the name of the Item to match the name of the file)
