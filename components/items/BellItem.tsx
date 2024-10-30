import React, { useState, useEffect } from "react";
import { View, Image, YStack, Button } from "tamagui";
import { notifyRoomUsers } from "project-functions/roomFunctions";
import { useToastController } from "@tamagui/toast";
import { Audio } from 'expo-av';

const soundEffectUrl = "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/sound-effects%2Fbell-ring.wav?alt=media&token=81ceadc0-0102-4a80-9a1b-28d77051ec06";

interface BellItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
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
  const [soundEffect, setSoundEffect] = useState<Audio.Sound | null>(null);
  const toast = useToastController();

  // Load sound effect
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

  // When the bell is "rung"
  const handlePress = async () => {
    try {
      // Play sound effect
      if (soundEffect) {
        await soundEffect.replayAsync();
      }
      
      // Notify users
      await notifyRoomUsers(roomInfo.roomId);
      
      // Show toast
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

  // Opens dialog when item is active/clicked
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <Button 
        onPress={handlePress}     
        padding={0}
        height={100}
        backgroundColor="transparent"
        borderRadius="$3"
        pressStyle={{
          backgroundColor: 'transparent'
        }}>
        <Image
          source={{ uri: itemData.imageUri }}
          width={100}
          height={120}
        />
      </Button>
    </YStack>
  );
};

// Initializes item data (default values)
BellItem.getInitialData = () => ({});

export default BellItem;
