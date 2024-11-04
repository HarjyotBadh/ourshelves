import React, { useState, useEffect } from "react";
import { Image, YStack, Button, Text } from "tamagui";
import { notifyRoomUsers } from "project-functions/roomFunctions";
import { useToastController } from "@tamagui/toast";
import { Audio } from "expo-av";
import { Timestamp } from "firebase/firestore";
import { AnimatePresence } from "tamagui";
import { Svg, Circle } from "react-native-svg";

const soundEffectUrl =
  "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/sound-effects%2Fbell-ring.wav?alt=media&token=81ceadc0-0102-4a80-9a1b-28d77051ec06";

interface BellItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    lastRung?: Timestamp;
    [key: string]: any;
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

interface BellItemComponent extends React.FC<BellItemProps> {
  getInitialData: () => {
    lastRung: Timestamp;
  };
}

const getTimeUntilNextRing = (lastRung: Timestamp) => {
  if (!lastRung || lastRung.toMillis() === 0) {
    return "Ready!";
  }

  const now = Timestamp.now().toMillis();
  const cooldownTime = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  const diff = Math.max(0, cooldownTime - (now - lastRung.toMillis()));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
};

const CooldownIndicator = ({ lastRung }: { lastRung: Timestamp }) => {
  const [progress, setProgress] = useState(0);
  const size = 100;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const updateProgress = () => {
      const now = Timestamp.now().toMillis();
      const cooldownTime = 3 * 60 * 60 * 1000; // 3 hours
      const elapsed = now - lastRung.toMillis();
      const newProgress = Math.min(1, elapsed / cooldownTime);
      setProgress(newProgress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [lastRung]);

  const strokeDashoffset = circumference * (1 - progress);

  return (
    <YStack position="absolute" top={0} left={0} right={0} bottom={0}>
      <Svg width={size} height={size}>
        <Circle
          stroke="rgba(0, 0, 0, 0.1)"
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={progress === 1 ? "#FFB800" : "#666"}
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <AnimatePresence>
        {progress < 1 && (
          <Text
            position="absolute"
            bottom={-20}
            width="100%"
            textAlign="center"
            fontSize={12}
            color="$gray11"
            animation="quick"
            enterStyle={{ opacity: 0, scale: 0.9 }}
            exitStyle={{ opacity: 0, scale: 0.9 }}
          >
            {getTimeUntilNextRing(lastRung)}
          </Text>
        )}
      </AnimatePresence>
    </YStack>
  );
};

const BellItem: BellItemComponent = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [soundEffect, setSoundEffect] = useState<Audio.Sound | null>(null);
  const [canRing, setCanRing] = useState(false);
  const [lastRung, setLastRung] = useState(itemData.lastRung || Timestamp.now());
  const toast = useToastController();

  useEffect(() => {
    if (!itemData.lastRung) {
      const initialData = BellItem.getInitialData();
      onDataUpdate({
        ...itemData,
        ...initialData,
      });
      setLastRung(initialData.lastRung);
    }
  }, []);

  useEffect(() => {
    const loadSoundEffect = async () => {
      if (soundEffectUrl) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: soundEffectUrl },
            { shouldPlay: false }
          );
          setSoundEffect(sound);
        } catch (error) {
          console.error("Error loading sound effect:", error);
        }
      }
    };

    loadSoundEffect();

    return () => {
      if (soundEffect) {
        soundEffect.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const updateRingAvailability = () => {
      const now = Timestamp.now();
      const ringCooldown = 3 * 60 * 60 * 1000; // 3 hours
      setCanRing(now.toMillis() - lastRung.toMillis() >= ringCooldown);
    };

    updateRingAvailability();
    const interval = setInterval(updateRingAvailability, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lastRung]);

  const handlePress = async () => {
    if (!canRing) {
      toast.show("Bell is on cooldown!", {
        message: `Next ring available in: ${getTimeUntilNextRing(lastRung)}`,
      });
      return;
    }

    try {
      if (soundEffect) {
        await soundEffect.replayAsync();
      }

      await notifyRoomUsers(roomInfo.roomId);

      const now = Timestamp.now();
      setLastRung(now);
      setCanRing(false);
      onDataUpdate({
        ...itemData,
        lastRung: now.toDate(),
      });

      toast.show("Bell rung!", {
        message: "Other users in the room have been notified",
      });
    } catch (error) {
      console.error("Error ringing bell:", error);
      toast.show("Error", {
        message: "Failed to ring the bell",
      });
    }
  };

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  if (!isActive) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Button
          onPress={handlePress}
          padding={0}
          height={100}
          backgroundColor="transparent"
          borderRadius="$3"
          pressStyle={{
            backgroundColor: "transparent",
            opacity: 0.8,
          }}
        >
          <YStack position="relative" width={100} height={100}>
            <Image source={{ uri: itemData.imageUri }} width={100} height={100} borderRadius={50} />
            <CooldownIndicator lastRung={lastRung} />
          </YStack>
        </Button>
      </YStack>
    );
  }
};

BellItem.getInitialData = () => {
  const now = Timestamp.now();
  const threeHoursAgo = new Timestamp(now.seconds - 3 * 60 * 60, now.nanoseconds);
  return {
    lastRung: threeHoursAgo,
  };
};

export default BellItem;
