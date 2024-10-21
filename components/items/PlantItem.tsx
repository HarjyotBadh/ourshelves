import React, { useState, useEffect } from "react";
import { View, styled, YStack, Button, Text, Dialog } from "tamagui";
import plants from "../Plants";
import { differenceInDays } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface PlantItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    [key: string]: any;

    // Custom properties for PlantItem
    growthStage: number;
    lastWatered: Timestamp;
    seedType: string;
    isWithered: boolean;
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  };
}

interface PlantItemComponent extends React.FC<PlantItemProps> {
  getInitialData: () => { growthStage: number; lastWatered: Timestamp; seedType: string };
}

const PlantItemView = styled(View, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
  justifyContent: "flex-end",
});

const PlantItem: PlantItemComponent = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [growthStage, setGrowthStage] = useState(itemData.growthStage || 0);
  const [lastWatered, setLastWatered] = useState(itemData.lastWatered || Timestamp.now());
  const [seedType, setSeedType] = useState(itemData.seedType || "sunflower");
  const [isWithered, setIsWithered] = useState(itemData.isWithered || false);

  const isFullyGrown = growthStage >= 100;

  // Print the item's id when the dialog opens
  if (isActive) {
    console.log(itemData.id);
  }
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  useEffect(() => {
    const checkWithering = () => {
      const daysSinceWatered = differenceInDays(new Date(), lastWatered.toDate());
      const newIsWithered = daysSinceWatered >= 3;
      console.log('Days since watered:', daysSinceWatered, 'Is withered:', newIsWithered);
      setIsWithered(newIsWithered);
    };

    checkWithering();
    const interval = setInterval(checkWithering, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastWatered]);

  const handleWater = () => {
    if (isFullyGrown) {
      console.log("Plant is fully grown and cannot be watered.");
      return;
    }

    const growthIncrement = Math.random() * (15 - 5) + 5; // Random growth between 5 and 15
    const newGrowthStage = Math.min(growthStage + growthIncrement, 100);

    const newLastWatered = Timestamp.now();
    setGrowthStage(newGrowthStage);
    setLastWatered(newLastWatered);

    // Check if the plant has reached a new milestone
    const milestone = Math.floor(newGrowthStage / 10) * 10; // Milestones at every 10%
    const reachedNewMilestone = milestone > Math.floor(growthStage / 10) * 10;

    setIsWithered(false);

    const updatedData = {
      ...itemData,
      growthStage: newGrowthStage,
      lastWatered: newLastWatered.toDate(), // Convert Timestamp to Date
      milestone: reachedNewMilestone ? milestone : itemData.milestone,
      isWithered: false,
    };

    onDataUpdate(updatedData);

    console.log("Updated plant data:", updatedData);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose();
  };

  const PlantComponent = plants[seedType] || plants["sunflower"];

  const plantDisplay = (
    <PlantItemView>
      <PlantComponent growth={growthStage} isWithered={isWithered} />
    </PlantItemView>
  );

  if (!isActive) {
    return <YStack flex={1}>{plantDisplay}</YStack>;
  }

  return (
    <YStack flex={1}>
      {plantDisplay}
      <Dialog
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) {
            handleDialogClose();
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>
              <Text>Your Plant</Text>
            </Dialog.Title>
            <YStack gap="$4">
              <PlantComponent growth={growthStage} />
              <Text>Plant Type: {seedType}</Text>
              <Text>Growth Stage: {growthStage}%</Text>
              <Text>Last Watered: {lastWatered.toDate().toLocaleString()}</Text>
              <Button
                onPress={handleWater}
                disabled={isFullyGrown}
                opacity={isFullyGrown ? 0.5 : 1}
              >
                <Text>{isFullyGrown ? "Fully Grown" : "Water Plant"}</Text>
              </Button>
              <Button onPress={handleDialogClose}>
                <Text>Close</Text>
              </Button>
            </YStack>
            <Dialog.Close />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
};

PlantItem.getInitialData = () => ({
  growthStage: 0,
  lastWatered: Timestamp.now(),
  seedType: "sunflower",
});

export default PlantItem;
