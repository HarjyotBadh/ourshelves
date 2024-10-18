import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  styled,
  YStack,
  Image,
  Paragraph,
  Dialog,
  Button,
  XStack,
} from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  withRepeat,
} from "react-native-reanimated";
import { Timestamp } from "firebase/firestore";

const ProgressIndicator = styled(View, {
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: "#FFDE00",
  variants: {
    filled: {
      true: {
        backgroundColor: "#FFDE00",
      },
      false: {
        backgroundColor: "transparent",
      },
    },
  },
});

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PokeItemProps {
  itemData: {
    id: string; // unique id of the placed item (do not change)
    itemId: string; // id of the item (do not change)
    name: string; // name of the item (do not change)
    imageUri: string; // picture uri of the item (do not change)
    placedUserId: string; // user who placed the item (do not change)
    [key: string]: any; // any other properties (do not change)

    // add custom properties below ------
    hatched: boolean; // whether the item has been hatched
    interactionCount: number; // number of interactions
    nextInteractionTime: Timestamp | Date; // next interaction time
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

interface PokeItemComponent extends React.FC<PokeItemProps> {
  getInitialData: () => {
    hatched: boolean;
    interactionCount: number;
    nextInteractionTime: Timestamp | Date;
  };
}

const PokeItem: PokeItemComponent = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (
      !itemData.hasOwnProperty("hatched") ||
      !itemData.hasOwnProperty("interactionCount") ||
      !itemData.hasOwnProperty("nextInteractionTime")
    ) {
      console.log("Initializing data");
      const initialData = PokeItem.getInitialData();
      onDataUpdate({
        ...itemData,
        ...initialData,
      });
    }
  }, []);

  // Opens dialog when item is active/clicked
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose();
  };

  const handleInteraction = () => {
    const currentDate = Timestamp.now();
    const nextInteraction =
      itemData.nextInteractionTime instanceof Date
        ? Timestamp.fromDate(itemData.nextInteractionTime)
        : itemData.nextInteractionTime;

    if (currentDate.toMillis() >= nextInteraction.toMillis()) {
      const newInteractionCount = (itemData.interactionCount || 0) + 1;
      const newNextInteractionTime = Timestamp.fromMillis(
        currentDate.toMillis() + 24 * 60 * 60 * 1000
      );
      const newData = {
        ...itemData,
        interactionCount: newInteractionCount,
        nextInteractionTime: newNextInteractionTime.toDate(),
      };
      if (newInteractionCount >= 7) {
        newData.hatched = true;
      }
      onDataUpdate(newData);

      rotation.value = withSequence(
        withTiming(-10, { duration: 100, easing: Easing.linear }),
        withTiming(10, { duration: 100, easing: Easing.linear }),
        withTiming(-10, { duration: 100, easing: Easing.linear }),
        withTiming(10, { duration: 100, easing: Easing.linear }),
        withTiming(0, { duration: 100, easing: Easing.linear })
      );
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    };
  });

  const isInteractionAvailable = () => {
    const currentDate = Timestamp.now();
    const nextInteraction =
      itemData.nextInteractionTime instanceof Date
        ? Timestamp.fromDate(itemData.nextInteractionTime)
        : itemData.nextInteractionTime;
    return currentDate.toMillis() >= nextInteraction.toMillis();
  };

  const getTimeUntilNextInteraction = () => {
    const nextInteraction =
      itemData.nextInteractionTime instanceof Date
        ? Timestamp.fromDate(itemData.nextInteractionTime)
        : itemData.nextInteractionTime;
    const now = Timestamp.now();
    const timeLeft = nextInteraction.toMillis() - now.toMillis();

    if (timeLeft <= 0) return "Ready!";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, []);

  // Renders item when not active/clicked
  // (default state of item on shelf)
  if (!isActive) {
    return (
      <YStack width={90} height={90} justifyContent="flex-end" alignItems="center">
        <View position="relative">
          <Image source={{ uri: itemData.imageUri }} width={80} height={80} objectFit="contain" />
          {isInteractionAvailable() && !itemData.hatched && (
            <View
              position="absolute"
              top={0}
              left={0}
              width={20}
              height={20}
              borderRadius={10}
              backgroundColor="#FFDE00"
              borderColor="#3B4CCA"
              borderWidth={2}
              justifyContent="center"
              alignItems="center"
            >
              <Text color="#3B4CCA" fontSize={12} fontWeight="bold">
                !
              </Text>
            </View>
          )}
        </View>
      </YStack>
    );
  }

  // Renders item when active/clicked
  // (item is clicked and dialog is open, feel free to change this return)
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
          scale={1}
          opacity={1}
          y={0}
        >
          <LinearGradient
            colors={["#4F94CD", "#87CEFA"]}
            start={[0, 0]}
            end={[1, 1]}
            borderRadius={10}
            padding={20}
          >
            <YStack gap="$4" maxWidth={500} alignItems="center">
              <Dialog.Title>
                <Text
                  fontSize={28}
                  fontWeight="bold"
                  color="#FFDE00"
                  style={{
                    textShadowColor: "#3B4CCA",
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Mysterious Egg
                </Text>
              </Dialog.Title>
              {!itemData.hatched && (
                <XStack gap="$2" justifyContent="center">
                  {[...Array(7)].map((_, index) => (
                    <ProgressIndicator
                      key={index}
                      filled={index < itemData.interactionCount}
                      animation="quick"
                      enterStyle={{ opacity: 0, scale: 0.8 }}
                      exitStyle={{ opacity: 0, scale: 0.8 }}
                      pressStyle={{ scale: 0.9 }}
                      hoverStyle={{ scale: 1.1 }}
                      focusStyle={{ scale: 1.1 }}
                    />
                  ))}
                </XStack>
              )}
              <Paragraph textAlign="center" color="#FFFFFF" fontSize={20} fontWeight="bold">
                {itemData.hatched
                  ? "Congratulations! Your egg has hatched!"
                  : `Day ${itemData.interactionCount + 1} of 7`}
              </Paragraph>
              <AnimatedImage
                source={{ uri: itemData.imageUri }}
                style={[{ width: 220, height: 220 }, animatedStyle]}
                objectFit="contain"
              />
              {!itemData.hatched && (
                <Button
                  onPress={handleInteraction}
                  disabled={!isInteractionAvailable()}
                  backgroundColor={isInteractionAvailable() ? "#FFDE00" : "#A9A9A9"}
                  color={isInteractionAvailable() ? "#3B4CCA" : "#FFFFFF"}
                  borderRadius="$4"
                  fontSize={20}
                  fontWeight="bold"
                  paddingHorizontal="$5"
                  hoverStyle={isInteractionAvailable() ? { backgroundColor: "#FFE769" } : {}}
                  pressStyle={isInteractionAvailable() ? { scale: 0.95 } : {}}
                >
                  <YStack alignItems="center">
                    <Text
                      color={isInteractionAvailable() ? "#3B4CCA" : "#FFFFFF"}
                      fontSize={20}
                      fontWeight="bold"
                    >
                      Take care of the egg
                    </Text>
                    <Text color={isInteractionAvailable() ? "#3B4CCA" : "#FFFFFF"} fontSize={14}>
                      {isInteractionAvailable() ? "Ready!" : getTimeUntilNextInteraction()}
                    </Text>
                  </YStack>
                </Button>
              )}
              <Dialog.Close asChild>
                <Button
                  onPress={handleDialogClose}
                  backgroundColor="#FF0000"
                  color="#FFFFFF"
                  borderRadius="$4"
                  fontSize={18}
                  fontWeight="bold"
                  paddingVertical="$2"
                  paddingHorizontal="$4"
                  hoverStyle={{ backgroundColor: "#FF3333" }}
                  pressStyle={{ scale: 0.95 }}
                >
                  Close
                </Button>
              </Dialog.Close>
            </YStack>
          </LinearGradient>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

PokeItem.getInitialData = () => ({
  hatched: false,
  interactionCount: 0,
  nextInteractionTime: Timestamp.now().toDate(),
});

export default PokeItem;
