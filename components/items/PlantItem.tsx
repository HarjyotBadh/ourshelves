import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View as TamaguiView,
  styled,
  YStack,
  Button,
  Text,
  Dialog,
  XStack,
  Progress,
  Circle,
} from "tamagui";
import { useToastController } from "@tamagui/toast";
import { Animated, PanResponder, StyleSheet, View } from "react-native";
import plants from "../Plants";
import { differenceInDays, differenceInMinutes, addDays, format, subDays } from "date-fns";
import { auth } from "firebaseConfig";
import { Timestamp } from "firebase/firestore";
import { Droplet, Sun, Cloud } from "@tamagui/lucide-icons";
import { earnCoins } from "project-functions/shopFunctions";

type WateringZone = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

// Styled components with wood theme
const PlantItemView = styled(TamaguiView, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
  justifyContent: "flex-end",
});

const DialogContainer = styled(Dialog.Content, {
  backgroundColor: "#DEB887",
  width: "90%",
  maxWidth: 800,
  padding: 0,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  overflow: "hidden",
});

const ContentContainer = styled(YStack, {
  padding: "$4",
  backgroundColor: "#F5DEB3",
});

const StyledProgressBar = styled(Progress, {
  height: 20,
  backgroundColor: "#DEB887",
  overflow: "hidden",
  borderWidth: 1,
  borderColor: "#8B4513",
});

const ProgressIndicator = styled(Progress.Indicator, {
  backgroundColor: "#8B4513",
});

const PlantCircle = styled(Circle, {
  backgroundColor: "#DEB887",
  borderWidth: 2,
  borderColor: "#8B4513",
});

const ActionButton = styled(Button, {
  backgroundColor: "#8B4513",
  borderRadius: "$4",
  marginTop: "$4",
  variants: {
    variant: {
      test: {
        backgroundColor: "#CD853F",
      },
      close: {
        backgroundColor: "#A0522D",
      },
    },
    disabled: {
      true: {
        backgroundColor: "#D2B48C",
        opacity: 0.6,
      },
    },
  },
});

const StyledText = styled(Text, {
  color: "#8B4513",
});

const BottomBar = styled(View, {
  height: 20,
  backgroundColor: "#8B4513",
  marginTop: "auto",
});

const NotificationBadge = styled(TamaguiView, {
  position: "absolute",
  top: 5,
  left: 5,
  borderRadius: "$full",
  padding: "$1",
  backgroundColor: "#DEB887",
  borderWidth: 2,
  borderColor: "#8B4513",
});

interface PlantItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    [key: string]: any;

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
  const [lastWatered, setLastWatered] = useState(
    itemData.lastWatered || Timestamp.fromDate(subDays(new Date(), 1))
  );
  const [seedType, setSeedType] = useState(itemData.seedType || "sunflower");
  const [isWithered, setIsWithered] = useState(itemData.isWithered || false);
  const [timeUntilWatering, setTimeUntilWatering] = useState("");
  const [canWater, setCanWater] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const toast = useToastController();
  const pan = useRef(new Animated.ValueXY()).current;
  const [showWateringMessage, setShowWateringMessage] = useState(false);
  const wateringZoneRef = useRef<View | null>(null);
  const [wateringZone, setWateringZone] = useState<WateringZone | null>(null);
  const waterDropAnimation1 = useRef(new Animated.Value(0)).current;
  const waterDropAnimation2 = useRef(new Animated.Value(0)).current;
  const waterDropAnimation3 = useRef(new Animated.Value(0)).current;
  const waterDropAnimation4 = useRef(new Animated.Value(0)).current;
  const waterDropAnimation5 = useRef(new Animated.Value(0)).current;

  const isFullyGrown = growthStage >= 100;

  useEffect(() => {
    if (isActive) {
      if (!dialogOpen) {
        setDialogOpen(true);
      }
    }
  }, [isActive, itemData.id, dialogOpen]);

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
      setIsWithered(newIsWithered);
    };

    checkWithering();
    const interval = setInterval(checkWithering, 60000);

    return () => clearInterval(interval);
  }, [lastWatered]);

  useEffect(() => {
    setGrowthStage(itemData.growthStage || 0);
    setLastWatered(
      itemData.lastWatered instanceof Timestamp
        ? itemData.lastWatered
        : // @ts-ignore
        itemData.lastWatered instanceof Date
        ? Timestamp.fromDate(itemData.lastWatered)
        : Timestamp.fromDate(subDays(new Date(), 1))
    );
    setSeedType(itemData.seedType || "sunflower");
    setIsWithered(itemData.isWithered || false);
  }, [itemData]);

  const handleWateringZoneLayout = useCallback(() => {
    if (wateringZoneRef.current) {
      wateringZoneRef.current.measureInWindow((x, y, width, height) => {
        setWateringZone({
          top: y,
          left: x,
          right: x + width,
          bottom: y + height,
        });
      });
    }
  }, []);

  const isOverWateringZone = useCallback(
    (x: number, y: number) => {
      if (!wateringZone) {
        return false;
      }
      const { left, right, top, bottom } = wateringZone;
      const isOver = x >= left && x <= right && y >= top && y <= bottom;
      return isOver;
    },
    [wateringZone]
  );

  const handleWater = useCallback(() => {
    if (isFullyGrown && !isWithered) {
      return;
    }

    if (!canWater) {
      return;
    }

    let newGrowthStage = growthStage;
    if (!isFullyGrown) {
      const growthIncrement = Math.random() * (15 - 5) + 5;
      newGrowthStage = Math.min(growthStage + growthIncrement, 100);
    }

    const newLastWatered = Timestamp.now();
    setGrowthStage(newGrowthStage);
    setLastWatered(newLastWatered);
    setIsWithered(false);
    setCanWater(false);

    earnCoins(auth.currentUser?.uid, 10);
    toast.show("You earned 10 coins!", {
      backgroundColor: "$green9",
      color: "$green1",
    });

    const updatedData = {
      ...itemData,
      growthStage: newGrowthStage,
      lastWatered: newLastWatered,
      isWithered: false,
    };

    onDataUpdate(updatedData);
  }, [growthStage, lastWatered, isFullyGrown, isWithered, itemData, onDataUpdate, canWater]);

  const startWatering = useCallback(() => {
    setIsWatering(true);
    const animateDrop = (animation: Animated.Value, delay: number, duration: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
      ]);
    };

    Animated.parallel([
      animateDrop(waterDropAnimation1, 0, 1500),
      animateDrop(waterDropAnimation2, 200, 1700),
      animateDrop(waterDropAnimation3, 400, 1600),
      animateDrop(waterDropAnimation4, 600, 1800),
      animateDrop(waterDropAnimation5, 800, 1500),
    ]).start(() => {
      handleWater();
      setIsWatering(false);
      [
        waterDropAnimation1,
        waterDropAnimation2,
        waterDropAnimation3,
        waterDropAnimation4,
        waterDropAnimation5,
      ].forEach((anim) => anim.setValue(0));
    });
  }, [
    waterDropAnimation1,
    waterDropAnimation2,
    waterDropAnimation3,
    waterDropAnimation4,
    waterDropAnimation5,
    handleWater,
  ]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose();
  };

  const onPanResponderRelease = useCallback(
    (_, gesture) => {
      if (isOverWateringZone(gesture.moveX, gesture.moveY)) {
        if (canWater) {
          startWatering();
        } else {
          setShowWateringMessage(true);
          setTimeout(() => setShowWateringMessage(false), 2000);
        }
      } else {
        // Not over watering zone
      }
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
    [isOverWateringZone, canWater, pan, startWatering]
  );

  // Use useMemo to recreate panResponder when dependencies change
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: onPanResponderRelease,
      }),
    [onPanResponderRelease, pan]
  );

  const PlantComponent = plants[seedType] || plants["sunflower"];

  const plantDisplay = (
    <PlantItemView>
      <PlantComponent growth={growthStage} isWithered={isWithered} />
      {canWater && !isActive && (
        <NotificationBadge>
          <Droplet size={16} color="#8B4513" />
        </NotificationBadge>
      )}
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
          <DialogContainer>
            <ContentContainer>
              <YStack gap="$4" maxWidth={350}>
                <Dialog.Title>
                  <StyledText fontSize="$8" fontWeight="bold">
                    Your {seedType.charAt(0).toUpperCase() + seedType.slice(1)}
                  </StyledText>
                </Dialog.Title>
                <YStack alignItems="center" gap="$4">
                  <View style={styles.plantContainer}>
                    <View
                      ref={wateringZoneRef}
                      onLayout={handleWateringZoneLayout}
                      style={styles.wateringZone}
                    />
                    <PlantCircle size={200}>
                      <PlantComponent growth={growthStage} isWithered={isWithered} />
                    </PlantCircle>
                  </View>
                  <XStack alignItems="center" gap="$2">
                    <Sun color="#CD853F" size={24} />
                    <StyledProgressBar value={growthStage}>
                      <ProgressIndicator />
                    </StyledProgressBar>
                  </XStack>
                  <StyledText fontSize="$5" fontWeight="bold">
                    {isWithered
                      ? "Withered"
                      : isFullyGrown
                      ? "Fully Grown"
                      : `${Math.round(growthStage)}% Grown`}
                  </StyledText>
                  <XStack alignItems="center" gap="$2">
                    <Droplet color="#8B4513" size={24} />
                    <StyledText fontSize="$4">Next watering: {timeUntilWatering}</StyledText>
                  </XStack>
                  {growthStage > 0 && (
                    <StyledText fontSize="$3">
                      Last watered: {format(lastWatered.toDate(), "MMM d, yyyy 'at' h:mm a")}
                    </StyledText>
                  )}
                </YStack>

                <YStack alignItems="center" gap="$2">
                  <StyledText fontSize="$3">Drag cloud over plant to water</StyledText>
                  <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.wateringCan, { transform: pan.getTranslateTransform() }]}
                  >
                    <Cloud size={50} color="#8B4513" />
                  </Animated.View>
                </YStack>

                {isWatering && (
                  <>
                    <Animated.View
                      style={[
                        styles.waterDrop,
                        styles.waterDrop1,
                        {
                          opacity: waterDropAnimation1,
                          transform: [
                            {
                              translateY: waterDropAnimation1.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 100],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Droplet size={12} color="$blue9" />
                    </Animated.View>
                    <Animated.View
                      style={[
                        styles.waterDrop,
                        styles.waterDrop2,
                        {
                          opacity: waterDropAnimation2,
                          transform: [
                            {
                              translateY: waterDropAnimation2.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 120],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Droplet size={10} color="$blue9" />
                    </Animated.View>
                    <Animated.View
                      style={[
                        styles.waterDrop,
                        styles.waterDrop3,
                        {
                          opacity: waterDropAnimation3,
                          transform: [
                            {
                              translateY: waterDropAnimation3.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 110],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Droplet size={11} color="$blue9" />
                    </Animated.View>
                    <Animated.View
                      style={[
                        styles.waterDrop,
                        styles.waterDrop4,
                        {
                          opacity: waterDropAnimation4,
                          transform: [
                            {
                              translateY: waterDropAnimation4.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 130],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Droplet size={9} color="$blue9" />
                    </Animated.View>
                    <Animated.View
                      style={[
                        styles.waterDrop,
                        styles.waterDrop5,
                        {
                          opacity: waterDropAnimation5,
                          transform: [
                            {
                              translateY: waterDropAnimation5.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 115],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Droplet size={10} color="$blue9" />
                    </Animated.View>
                    <View style={styles.cloudContainer}>
                      <Cloud size={60} color="$blue9" />
                    </View>
                  </>
                )}

                {showWateringMessage && (
                  <StyledText style={styles.wateringMessage}>
                    Not ready for watering yet!
                  </StyledText>
                )}

                <Dialog.Close asChild>
                  <ActionButton variant="close" onPress={handleDialogClose}>
                    <StyledText color="white">Close</StyledText>
                  </ActionButton>
                </Dialog.Close>
              </YStack>
            </ContentContainer>
            <BottomBar />
          </DialogContainer>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
};

const styles = StyleSheet.create({
  plantContainer: {
    position: "relative",
    width: 220,
    height: 220,
  },
  wateringZone: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 110,
    zIndex: 1,
  },
  wateringCan: {
    alignSelf: "center",
    zIndex: 10,
  },
  waterDrop: {
    position: "absolute",
    zIndex: 5,
  },
  waterDrop1: {
    top: 70,
    left: "43%",
  },
  waterDrop2: {
    top: 70,
    left: "48%",
  },
  waterDrop3: {
    top: 70,
    left: "53%",
  },
  waterDrop4: {
    top: 70,
    left: "58%",
  },
  waterDrop5: {
    top: 70,
    left: "38%",
  },
  cloudContainer: {
    position: "absolute",
    top: 20,
    left: "50%",
    marginLeft: -30,
    zIndex: 6,
  },
  wateringMessage: {
    position: "absolute",
    top: 260,
    left: 50,
    right: 50,
    textAlign: "center",
    color: "#A0522D",
    zIndex: 15,
  },
});

PlantItem.getInitialData = () => ({
  growthStage: 0,
  lastWatered: Timestamp.fromDate(subDays(new Date(), 1)),
  seedType: "sunflower",
});

export default PlantItem;
