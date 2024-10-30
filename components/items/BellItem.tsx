import React, { useState, useEffect } from "react";
import { View, Image, YStack, Button, Pressable } from "tamagui";
import { notifyRoomUsers } from "project-functions/roomFunctions";

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

const BellItem: BellItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // When the bell is "rung"
  const handlePress = () => {
    notifyRoomUsers(roomInfo.roomId)
  };


  // Opens dialog when item is active/clicked
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);  

  // Renders item when active/clicked
  // (item is clicked and dialog is open, feel free to change this return)
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
       {/* Camel Button */}
       <Button 
          onPress={handlePress}     
          backgroundColor="black" 
          padding={1} 
          height = {100}
          borderRadius="$3">
          <Image
            source={{ uri: itemData.imageUri }} // Replace with a valid camel image URL or local file path
            width={100}
            height={120}
          />
        </Button>
    </YStack>
  );
};

// Initializes item data (default values)
BellItem.getInitialData = () => ({});

export default BellItem; // do not remove the export (but change the name of the Item to match the name of the file)
