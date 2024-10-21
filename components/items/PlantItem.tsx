import React, { useState, useEffect } from "react";
import { View, styled, YStack, Button, Text, Dialog, XStack, Progress, Circle } from "tamagui";
import plants from "../Plants";
import {
  differenceInDays,
  differenceInMinutes,
  addDays,
  format,
  differenceInHours,
} from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Droplet, Sun } from "@tamagui/lucide-icons";

const PlantItemView = styled(View, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
  justifyContent: "flex-end",
});

const StyledProgressBar = styled(Progress, {
  height: 20,
  backgroundColor: "$gray5",
  overflow: "hidden",
});

const ProgressIndicator = styled(Progress.Indicator, {
  backgroundColor: "$green9",
});

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

const PlantItem: PlantItemComponent = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [growthStage, setGrowthStage] = useState(itemData.growthStage || 0);
  const [lastWatered, setLastWatered] = useState(itemData.lastWatered || Timestamp.now());
  const [seedType, setSeedType] = useState(itemData.seedType || "sunflower");
  const [isWithered, setIsWithered] = useState(itemData.isWithered || false);
  const [timeUntilWatering, setTimeUntilWatering] = useState("");
  const [canWater, setCanWater] = useState(false);

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
    const updateTimeUntilWatering = () => {
      const nextWateringTime = addDays(lastWatered.toDate(), 1); // Changed from 3 to 1 day
      const minutesUntilWatering = differenceInMinutes(nextWateringTime, new Date());

      if (minutesUntilWatering <= 0) {
        setTimeUntilWatering("Ready to water!");
        setCanWater(true);
      } else {
        const hours = Math.floor(minutesUntilWatering / 60);
        const minutes = minutesUntilWatering % 60;
        setTimeUntilWatering(`${hours}h ${minutes}m`);
        setCanWater(false);
      }
    };

    updateTimeUntilWatering();
    const interval = setInterval(updateTimeUntilWatering, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastWatered]);

  useEffect(() => {
    const checkWithering = () => {
      const daysSinceWatered = differenceInDays(new Date(), lastWatered.toDate());
      const newIsWithered = daysSinceWatered >= 3;
      console.log("Days since watered:", daysSinceWatered, "Is withered:", newIsWithered);
      setIsWithered(newIsWithered);
    };

    checkWithering();
    const interval = setInterval(checkWithering, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastWatered]);

  const handleWater = () => {
    if (isFullyGrown && !isWithered) {
      console.log("Plant is fully grown and not withered. It cannot be watered.");
      return;
    }

    if (!canWater) {
      console.log("Plant can only be watered once every 24 hours.");
      return;
    }

    let newGrowthStage = growthStage;
    if (!isFullyGrown) {
      const growthIncrement = Math.random() * (15 - 5) + 5; // Random growth between 5 and 15
      newGrowthStage = Math.min(growthStage + growthIncrement, 100);
    }

    const newLastWatered = Timestamp.now();
    setGrowthStage(newGrowthStage);
    setLastWatered(newLastWatered);

    // Check if the plant has reached a new milestone
    const milestone = Math.floor(newGrowthStage / 10) * 10; // Milestones at every 10%
    const reachedNewMilestone = milestone > Math.floor(growthStage / 10) * 10;

    setIsWithered(false);

    setCanWater(false);

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
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
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
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            y={0}
            opacity={1}
            scale={1}
          >
            <YStack space="$4" maxWidth={350}>
              <Dialog.Title>
                <Text fontSize="$8" fontWeight="bold" color="$gray12">
                  Your {seedType.charAt(0).toUpperCase() + seedType.slice(1)}
                </Text>
              </Dialog.Title>
              <YStack alignItems="center" space="$4">
                <Circle size={200} backgroundColor="$green3">
                  <PlantComponent growth={growthStage} isWithered={isWithered} />
                </Circle>
                <XStack alignItems="center" space="$2">
                  <Sun color="$yellow10" size={24} />
                  <StyledProgressBar value={growthStage}>
                    <ProgressIndicator />
                  </StyledProgressBar>
                </XStack>
                <Text fontSize="$5" fontWeight="bold" color="$gray11">
                  {isWithered
                    ? "Withered"
                    : isFullyGrown
                    ? "Fully Grown"
                    : `${Math.round(growthStage)}% Grown`}
                </Text>
                <XStack alignItems="center" space="$2">
                  <Droplet color="$blue10" size={24} />
                  <Text fontSize="$4" color="$gray11">
                    Next watering: {timeUntilWatering}
                  </Text>
                </XStack>
                <Text fontSize="$3" color="$gray10">
                  Last watered: {format(lastWatered.toDate(), "MMM d, yyyy 'at' h:mm a")}
                </Text>
              </YStack>
              <Button
                onPress={handleWater}
                disabled={(isFullyGrown && !isWithered) || !canWater}
                opacity={(isFullyGrown && !isWithered) || !canWater ? 0.5 : 1}
                backgroundColor={isWithered ? "$red9" : "$blue9"}
                color="white"
                pressStyle={{ opacity: 0.8 }}
              >
                <Text>
                  {isWithered
                    ? "Revive Plant"
                    : isFullyGrown
                    ? "Fully Grown"
                    : canWater
                    ? "Water Plant"
                    : "Wait to Water"}
                </Text>
              </Button>
              <Dialog.Close asChild>
                <Button onPress={handleDialogClose} backgroundColor="$gray3" color="$gray11">
                  <Text>Close</Text>
                </Button>
              </Dialog.Close>
            </YStack>
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
