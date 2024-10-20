import React, { useState, useEffect, useCallback } from "react";
import { Modal, View, Animated } from "react-native";
import { Button, Text, YStack, XStack, Image } from "tamagui";
import { Play, Pause, Music, FileAudio} from "@tamagui/lucide-icons";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "firebaseConfig";
import { TrackSelectionModal } from "components/TrackSelectionModal";
import { BoomboxItemProps, BoomboxItemComponent } from "models/BoomboxModel";
import { useToastController } from "@tamagui/toast";
import { useAudio } from "components/AudioContext";
import { AnimatedMusicNotes } from "components/AnimatedMusicNotes";
import { boomboxStyles } from "styles/BoomboxStyles";
import { BottomBar } from "styles/WhiteboardStyles";

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

  const bounceAnim = new Animated.Value(0);

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (isPlaying) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      bounceAnim.setValue(0);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isPlaying, bounceAnim]);

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

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    onClose();
  }, [onClose]);
  if (!isActive) {
    return (
      <View style={boomboxStyles.inactiveContainer}>
        <Image
          source={{ uri: itemData.imageUri }}
          style={boomboxStyles.inactiveImage}
        />
        {isPlaying && <AnimatedMusicNotes />}
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
      <View style={boomboxStyles.modalContainer}>
        <View style={boomboxStyles.modalWrapper}>
          <YStack style={boomboxStyles.modalContent}>
            <Animated.View
              style={[
                boomboxStyles.boomboxImageContainer,
                {
                  transform: [
                    {
                      translateY: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image
                source={{ uri: itemData.imageUri }}
                style={boomboxStyles.boomboxImage}
              />
              {isPlaying && <AnimatedMusicNotes />}
            </Animated.View>
            <XStack space justifyContent="center" marginVertical="$4">
              <Button
                icon={Play}
                onPress={handlePlay}
                disabled={isPlaying}
                backgroundColor={isPlaying ? "$green8" : "$green10"}
                borderColor={isPlaying ? "$green10" : "transparent"}
                borderWidth={2}
                style={boomboxStyles.controlButton}
              />
              <Button
                icon={Pause}
                onPress={handleStop}
                disabled={!isPlaying}
                backgroundColor={!isPlaying ? "$red8" : "$red10"}
                borderColor={!isPlaying ? "$red10" : "transparent"}
                borderWidth={2}
                style={boomboxStyles.controlButton}
              />
              <Button
                icon={FileAudio}
                onPress={() => setIsTrackSelectionVisible(true)}
                backgroundColor="$blue10"
                pressStyle={{ backgroundColor: "$blue8" }}
                style={boomboxStyles.controlButton}
              />
            </XStack>
            <Button
              theme="red"
              onPress={handleCloseModal}
              marginBottom="$4"
            >
              Close
            </Button>
          </YStack>
          <BottomBar />
        </View>
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
