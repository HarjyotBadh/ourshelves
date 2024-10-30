import React, { useState, useEffect } from "react";
import { View, styled, YStack } from "tamagui";
import ClockGraphic from "components/ClockGraphic";
import { ClockDialog } from "components/ClockDialog";
import { auth } from "../../firebaseConfig";

interface ClockItemProps {
  itemData: {
    id: string; // unique id of the placed item (do not change)
    itemId: string; // id of the item (do not change)
    name: string; // name of the item (do not change)
    imageUri: string; // picture uri of the item (do not change)
    placedUserId: string; // user who placed the item (do not change)
    [key: string]: any; // any other properties (do not change)

    // add custom properties below ------
    isAnalog: boolean;
    timeZone: number;

    // ---------------------------------
  };
  onDataUpdate: (newItemData: Record<string, any>) => void; // updates item data when called (do not change)
  isActive: boolean; // whether item is active/clicked (do not change)
  onClose: () => void; // called when dialog is closed (important, as it will unlock the item) (do not change)
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
  }; // various room info (do not change)
}

interface ClockItemComponent extends React.FC<ClockItemProps> {
  getInitialData: () => { isAnalog: boolean; timeZone: number };
}

const ClockItemContainer = styled(View, {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
});

const ClockItem: ClockItemComponent = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [isAnalog, setIsAnalog] = useState(
    itemData.isAnalog !== undefined ? itemData.isAnalog : true
  );
  const [timeZone, setTimeZone] = useState(itemData.timeZone || 4);

  // Opens dialog when item is active/clicked
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  const handleClockOptionsSelect = (isAnalogOption: boolean, timeZoneOption: number) => {
    setIsAnalog(isAnalogOption);
    setTimeZone(timeZoneOption);
    onDataUpdate({ ...itemData, isAnalog: isAnalogOption, timeZone: timeZoneOption }); // updates item data when called
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose(); // ensure you call onClose when dialog is closed (important, as it will unlock the item)
  };

  // Renders item when not active/clicked
  // (default state of item on shelf)
  if (!isActive) {
    return (
      <YStack flex={1}>
        <ClockItemContainer>
          <ClockGraphic isAnalog={isAnalog} timeZone={timeZone} />
        </ClockItemContainer>
      </YStack>
    );
  }

  // Renders item when active/clicked
  // (item is clicked and dialog is open, feel free to change this return)
  return (
    <YStack flex={1}>
      <ClockItemContainer>
        <ClockGraphic isAnalog={isAnalog} timeZone={timeZone} />

        {itemData.placedUserId === auth.currentUser.uid && (
          <ClockDialog
            open={dialogOpen}
            onOpenChange={(isOpen) => {
              setDialogOpen(isOpen);
              if (!isOpen) {
                handleDialogClose();
              }
            }}
            onClockOptionsSelect={handleClockOptionsSelect}
            defaultIsAnalog={isAnalog}
            defaultTimeZone={timeZone}
          />
        )}
      </ClockItemContainer>
    </YStack>
  );
};

// Initializes item data (default values)
ClockItem.getInitialData = () => ({ isAnalog: true, timeZone: 0 });

export default ClockItem; // do not remove the export (but change the name of the Item to match the name of the file)
