import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View as TamaguiView,
  styled,
  YStack,
  Dialog,
  Button,
  Text,
  XStack,
  Progress,
  Image,
} from "tamagui";
import { Animated, PanResponder, StyleSheet, View } from "react-native";
import { Heart, PlayCircle, Pizza } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { Timestamp } from "firebase/firestore";
import { earnCoins } from "project-functions/shopFunctions";
import { auth } from "firebaseConfig";

const styles = StyleSheet.create({
  petContainer: {
    position: "relative",
    width: 220,
    height: 220,
  },
  foodItem: {},
  containerView: {
    position: "relative",
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  feedingZone: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 110,
    zIndex: 1,
  },
  draggablePizza: {
    alignSelf: "center",
    zIndex: 10,
  },
  feedingMessage: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "$green9",
    zIndex: 15,
  },
});

interface PetItemProps {
  itemData: {
    id: string; // unique id of the placed item (do not change)
    itemId: string; // id of the item (do not change)
    name: string; // name of the item (do not change)
    imageUri: string; // picture uri of the item (do not change)
    placedUserId: string; // user who placed the item (do not change)
    [key: string]: any; // any other properties (do not change)

    // add custom properties below ------
    hungerLevel?: number;
    happinessLevel?: number;
    lastFed?: Timestamp;
    lastPlayed?: Timestamp;
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

const getTimeUntilNextInteraction = (lastTime: Timestamp, isPlaying: boolean = false) => {
  if (lastTime.toMillis() === 0) {
    return "Now!";
  }

  const now = Timestamp.now().toMillis();
  const cooldownTime = isPlaying ? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  const diff = Math.max(0, cooldownTime - (now - lastTime.toMillis()));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
};

interface PetItemComponent extends React.FC<PetItemProps> {
  getInitialData: () => {
    hungerLevel: number;
    happinessLevel: number;
    lastFed: Timestamp;
    lastPlayed: Timestamp;
  };
}

const StyledProgressBar = styled(Progress, {
  height: 20,
  backgroundColor: "$gray5",
  overflow: "hidden",
  width: 200,
});

const ProgressIndicator = styled(Progress.Indicator, {
  backgroundColor: "$green9",
});

const calculateDecayedLevels = (
  lastFed: Timestamp,
  lastPlayed: Timestamp,
  currentHunger: number,
  currentHappiness: number
) => {
  const now = Timestamp.now().toMillis();
  let newHunger = currentHunger;
  let newHappiness = currentHappiness;

  // Calculate hunger decay (after 72 hours)
  const hoursSinceLastFed = (now - lastFed.toMillis()) / (60 * 60 * 1000);
  if (hoursSinceLastFed > 72) {
    const decayPeriods = Math.floor((hoursSinceLastFed - 72) / 24);
    newHunger = Math.max(0, currentHunger - decayPeriods * 25);
  }

  // Calculate happiness decay (after 48 hours)
  const hoursSinceLastPlayed = (now - lastPlayed.toMillis()) / (60 * 60 * 1000);
  if (hoursSinceLastPlayed > 48) {
    const decayPeriods = Math.floor((hoursSinceLastPlayed - 48) / 24);
    newHappiness = Math.max(0, currentHappiness - decayPeriods * 15);
  }

  return { newHunger, newHappiness };
};

const PetItem: PetItemComponent = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hungerLevel, setHungerLevel] = useState(itemData.hungerLevel || 0);
  const [happinessLevel, setHappinessLevel] = useState(itemData.happinessLevel || 0);
  const [lastFed, setLastFed] = useState(itemData.lastFed || Timestamp.now());
  const [lastPlayed, setLastPlayed] = useState(itemData.lastPlayed || Timestamp.now());
  const [canFeed, setCanFeed] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const toast = useToastController();
  const pan = useRef(new Animated.ValueXY()).current;
  const feedingZoneRef = useRef<View | null>(null);
  const [showFeedingMessage, setShowFeedingMessage] = useState(false);
  const [feedingZone, setFeedingZone] = useState<{
    top: number;
    left: number;
    right: number;
    bottom: number;
  } | null>(null);

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  useEffect(() => {
    const updateInteractionAvailability = () => {
      const now = Timestamp.now();
      const feedingCooldown = 24 * 60 * 60 * 1000; // 24 hours
      const playingCooldown = 12 * 60 * 60 * 1000; // 12 hours

      setCanFeed(now.toMillis() - lastFed.toMillis() >= feedingCooldown);
      setCanPlay(now.toMillis() - lastPlayed.toMillis() >= playingCooldown);
    };

    updateInteractionAvailability();
    const interval = setInterval(updateInteractionAvailability, 60000);
    return () => clearInterval(interval);
  }, [lastFed, lastPlayed]);

  const handleFeedingZoneLayout = useCallback(() => {
    if (feedingZoneRef.current) {
      feedingZoneRef.current.measureInWindow((x, y, width, height) => {
        setFeedingZone({
          top: y,
          left: x,
          right: x + width,
          bottom: y + height,
        });
      });
    }
  }, []);

  // Check if food is over feeding zone
  const isOverFeedingZone = useCallback(
    (x: number, y: number) => {
      if (!feedingZone) {
        return false;
      }
      const { left, right, top, bottom } = feedingZone;
      return x >= left && x <= right && y >= top && y <= bottom;
    },
    [feedingZone]
  );

  // Handle feeding
  const handleFeed = useCallback(() => {
    console.log("Feeding...");
    if (!canFeed || hungerLevel >= 100) return;

    setIsFeeding(true);

    setTimeout(() => {
      const newHungerLevel = Math.min(hungerLevel + 9, 100); // Changed from 20 to 9
      setHungerLevel(newHungerLevel);
      setLastFed(Timestamp.now());
      setCanFeed(false);
      setIsFeeding(false);

      earnCoins(auth.currentUser?.uid, 5);
      toast.show("Pet fed! Earned 5 coins!", {
        backgroundColor: "$green9",
      });

      onDataUpdate({
        ...itemData,
        hungerLevel: newHungerLevel,
        lastFed: Timestamp.now().toDate(),
      });
    }, 1000);
  }, [hungerLevel, canFeed, itemData, onDataUpdate]);

  // Handle playing
  const handlePlay = useCallback(() => {
    if (!canPlay || happinessLevel >= 100) return;

    const newHappinessLevel = Math.min(happinessLevel + 5, 100); // Changed from 15 to 5
    setHappinessLevel(newHappinessLevel);
    setLastPlayed(Timestamp.now());
    setCanPlay(false);

    earnCoins(auth.currentUser?.uid, 5);
    toast.show("Played with pet! Earned 5 coins!", {
      backgroundColor: "$green9",
    });

    onDataUpdate({
      ...itemData,
      happinessLevel: newHappinessLevel,
      lastPlayed: Timestamp.now().toDate(),
    });
  }, [happinessLevel, canPlay, itemData, onDataUpdate]);

  const onPanResponderRelease = useCallback(
    (_, gesture) => {
      if (isOverFeedingZone(gesture.moveX, gesture.moveY)) {
        if (canFeed) {
          handleFeed();
          setShowFeedingMessage(true);
          setTimeout(() => setShowFeedingMessage(false), 2000);
        } else {
          toast.show("Not ready for feeding yet!", {
            backgroundColor: "$red9",
          });
        }
      }

      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
    [isOverFeedingZone, canFeed, handleFeed, pan]
  );

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

  useEffect(() => {
    if (!itemData.lastFed) {
      const now = Timestamp.now();
      const initialData = {
        ...itemData,
        hungerLevel: 50,
        happinessLevel: 50,
        lastFed: now,
        lastPlayed: now,
      };
      onDataUpdate(initialData);
    }
  }, []);

  useEffect(() => {
    const { newHunger, newHappiness } = calculateDecayedLevels(
      lastFed,
      lastPlayed,
      hungerLevel,
      happinessLevel
    );

    if (newHunger !== hungerLevel || newHappiness !== happinessLevel) {
      setHungerLevel(newHunger);
      setHappinessLevel(newHappiness);
      onDataUpdate({
        ...itemData,
        hungerLevel: newHunger,
        happinessLevel: newHappiness,
      });
    }
  }, [dialogOpen]);

  // Renders item when not active/clicked
  if (!isActive) {
    return (
      <YStack flex={1}>
        <TamaguiView position="relative" flex={1}>
          <Image
            source={{ uri: itemData.imageUri }}
            width="100%"
            height="100%"
            objectFit="contain"
          />
          <XStack position="absolute" top={5} left={5} gap="$2">
            {canFeed && (
              <TamaguiView borderRadius="$full" padding="$1">
                <Pizza size={16} color="$orange10" />
              </TamaguiView>
            )}
            {canPlay && (
              <TamaguiView borderRadius="$full" padding="$1">
                <PlayCircle size={16} color="$blue10" />
              </TamaguiView>
            )}
          </XStack>
        </TamaguiView>
      </YStack>
    );
  }

  // Renders item when active/clicked
  return (
    <YStack flex={1}>
      <TamaguiView position="relative" flex={1}>
        <Image
          source={{ uri: itemData.imageUri }}
          width="100%"
          height="100%"
          resizeMode="contain"
        />
      </TamaguiView>
      <Dialog
        modal
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) {
            onClose();
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
            <YStack gap="$4" maxWidth={350}>
              <Dialog.Title>
                <Text fontSize="$8" fontWeight="bold" color="$gray12">
                  Your Pet
                </Text>
              </Dialog.Title>

              <YStack alignItems="center" gap="$4">
                <View style={styles.petContainer}>
                  <View
                    ref={feedingZoneRef}
                    onLayout={handleFeedingZoneLayout}
                    style={styles.feedingZone}
                  />
                  <Image
                    source={{ uri: itemData.imageUri }}
                    width={200}
                    height={200}
                    objectFit="contain"
                  />
                </View>

                <YStack width="100%" gap="$3" paddingHorizontal="$4">
                  <XStack alignItems="center" gap="$2" justifyContent="space-between">
                    <Pizza color="$orange10" size={24} />
                    <StyledProgressBar value={hungerLevel}>
                      <ProgressIndicator backgroundColor="$orange9" />
                    </StyledProgressBar>
                  </XStack>

                  <XStack alignItems="center" gap="$2" justifyContent="space-between">
                    <Heart color="$red10" size={24} />
                    <StyledProgressBar value={happinessLevel}>
                      <ProgressIndicator backgroundColor="$red9" />
                    </StyledProgressBar>
                  </XStack>
                </YStack>

                <YStack gap="$2">
                  <Text fontSize="$3" color="$gray11">
                    Next feeding available:{" "}
                    {canFeed ? "Now!" : getTimeUntilNextInteraction(lastFed)}
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    Next play available:{" "}
                    {canPlay ? "Now!" : getTimeUntilNextInteraction(lastPlayed, true)}
                  </Text>
                </YStack>

                <YStack alignItems="center" gap="$4" width="100%">
                  <Text fontSize="$3" color="$gray10">
                    Drag pizza over pet to feed
                  </Text>
                  <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                      styles.draggablePizza,
                      {
                        transform: pan.getTranslateTransform(),
                      },
                    ]}
                  >
                    <Pizza size={50} color="$orange9" />
                  </Animated.View>
                </YStack>

                {showFeedingMessage && <Text style={styles.feedingMessage}>Pet has been fed!</Text>}

                <Button
                  onPress={handlePlay}
                  disabled={!canPlay || happinessLevel >= 100}
                  backgroundColor={canPlay && happinessLevel < 100 ? "$blue9" : "$gray8"}
                  color="white"
                  borderRadius="$4"
                  paddingHorizontal="$4"
                  paddingVertical="$2"
                >
                  <Text color="white">Play with Pet</Text>
                </Button>
              </YStack>

              <Dialog.Close asChild>
                <Button
                  onPress={() => {
                    setDialogOpen(false);
                    onClose();
                  }}
                  backgroundColor="$gray3"
                  color="$gray11"
                >
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

// Initializes item data (default values)
PetItem.getInitialData = () => ({
  hungerLevel: 50,
  happinessLevel: 50,
  lastFed: Timestamp.now(),
  lastPlayed: Timestamp.now(),
});

export default PetItem; // do not remove the export (but change the name of the Item to match the name of the file)
