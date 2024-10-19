import React, { useState, useEffect, useCallback } from "react";
import { Modal, View } from "react-native";
import { Button, Text, YStack, XStack, Image } from "tamagui";
import { Play, Pause, Music } from "@tamagui/lucide-icons";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "firebaseConfig";
import { TrackSelectionModal } from "components/TrackSelectionModal";
import { BoomboxItemProps, BoomboxItemComponent } from "models/BoomboxModel";
import { useToastController } from "@tamagui/toast";
import { useAudio } from "components/AudioContext";

const BoomboxItem: BoomboxItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTrackSelectionVisible, setIsTrackSelectionVisible] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const roomId = "ue5COlxMW6Mmj5ccb3Ee";
  const toast = useToastController();
  const { isPlaying, currentTrackId, play, stop } = useAudio();

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

  const handleAudioChange = useCallback(async (roomData: any) => {
    const bgMusic = roomData.backgroundMusic;
    if (bgMusic?.isPlaying && bgMusic?.trackUrl) {
      if (currentTrackId !== bgMusic.trackId || !isPlaying) {
        await play(bgMusic.trackUrl, bgMusic.trackId);
      }
    } else if (isPlaying) {
      await stop();
    }
  }, [currentTrackId, isPlaying, play, stop]);

  useEffect(() => {
    const roomRef = doc(db, "Rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const roomData = docSnapshot.data();
        setCurrentTrack(roomData.backgroundMusic?.trackId || null);
        handleAudioChange(roomData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, handleAudioChange]);

  const handlePlay = async () => {
    if (!currentTrack || !itemData.trackUrl) return;

    try {
      await play(itemData.trackUrl, currentTrack);
      await updateRoomBackgroundMusic(true, currentTrack);
    } catch (error) {
      console.error('Error playing sound:', error);
      toast.show('Failed to play audio', { type: 'error' });
    }
  };

  const handleStop = async () => {
    try {
      await stop();
      if (currentTrack) {
        await updateRoomBackgroundMusic(false, currentTrack);
      }
    } catch (error) {
      console.error("Error stopping sound:", error);
      toast.show("Failed to stop audio", { type: "error" });
    }
  };

  const updateRoomBackgroundMusic = async (
    isPlaying: boolean,
    trackId: string
  ) => {
    const roomRef = doc(db, "Rooms", roomId);
    await updateDoc(roomRef, {
      backgroundMusic: {
        isPlaying,
        trackId,
        trackUrl: itemData.trackUrl,
      },
    });
  };

  const handleTrackSelect = async (trackId: string, trackUrl: string) => {
    setCurrentTrack(trackId);
    setIsTrackSelectionVisible(false);
    await onDataUpdate({ ...itemData, trackId, trackUrl });
  };

  const handleCloseModal = async () => {
    setIsModalVisible(false);
    onClose();
  };
  if (!isActive) {
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
                    source={{ uri: itemData.imageUri }}
                    width="80%"
                    height="80%"
                />
      </View>
    );
  }

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <YStack
          space
          backgroundColor="$background"
          padding="$4"
          borderRadius="$4"
        >
          <Text fontSize="$6" fontWeight="bold">
            Boombox
          </Text>
          <XStack space>
            <Button
              icon={isPlaying ? Pause : Play}
              onPress={isPlaying ? handleStop : handlePlay}
              disabled={!currentTrack}
            >
              {isPlaying ? "Stop" : "Play"}
            </Button>
            <Button
              icon={Music}
              onPress={() => setIsTrackSelectionVisible(true)}
            >
              Select Track
            </Button>
          </XStack>
          <Button theme="red" onPress={handleCloseModal}>
            Close
          </Button>
        </YStack>
      </View>
      <TrackSelectionModal
        isVisible={isTrackSelectionVisible}
        onClose={() => setIsTrackSelectionVisible(false)}
        onTrackSelect={handleTrackSelect}
      />
    </Modal>
  );
};

BoomboxItem.getInitialData = () => ({
  trackId: "",
  trackUrl: "",
});

export default BoomboxItem;
