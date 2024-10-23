import React, { useState, useEffect, useCallback } from "react";
import { Modal, View, Animated } from "react-native";
import { Button, Text, YStack, XStack, Image } from "tamagui";
import { Play, Pause, Music, FileAudio} from "@tamagui/lucide-icons";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "firebaseConfig";
import { TrackSelectionModal } from "components/TrackSelectionModal";
import { BoomboxItemProps, BoomboxItemComponent, soundEffectUrl } from "models/BoomboxModel";
import { useToastController } from "@tamagui/toast";
import { useAudio } from "components/AudioContext";
import { AnimatedMusicNotes } from "components/AnimatedMusicNotes";
import { boomboxStyles } from "styles/BoomboxStyles";
import { BottomBar } from "styles/WhiteboardStyles";
import { Audio } from 'expo-av';

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
  const [soundEffect, setSoundEffect] = useState<Audio.Sound | null>(null);
  const roomId = roomInfo.roomId;
  // const roomId = "ue5COlxMW6Mmj5ccb3Ee";
  const toast = useToastController();
  const { play, stop, isPlaying } = useAudio();

  const bounceAnim = new Animated.Value(0);

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (isPlaying(itemData.id)) {
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
  }, [isPlaying, itemData.id, bounceAnim]);

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

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
          toast.show("Failed to load sound effect", { type: "error" });
        }
      }
    };
  
    loadSoundEffect();
  
    return () => {
      if (soundEffect) {
        soundEffect.unloadAsync();
      }
    };
  }, [itemData.soundEffectUrl, toast]);

  const handleAudioChange = useCallback(async (roomData: any) => {
    const bgMusic = roomData.backgroundMusic;
    if (bgMusic?.isPlaying && bgMusic?.trackUrl && bgMusic?.itemId === itemData.id) {
      if (!isPlaying(itemData.id)) {
        await play(bgMusic.trackUrl, bgMusic.trackId, itemData.id);
      }
    } else if (isPlaying(itemData.id)) {
      await stop(itemData.id);
    }
  }, [isPlaying, play, stop, itemData.id]);

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

  const playSoundEffect = async () => {
    if (soundEffect) {
      try {
        await soundEffect.replayAsync();
      } catch (error) {
        console.error("Error playing sound effect:", error);
        toast.show("Failed to play sound effect", { type: "error" });
      }
    }
  };

  const handlePlay = async () => {
    if (!currentTrack || !itemData.trackUrl) return;
    try {
      await playSoundEffect();
      await play(itemData.trackUrl, currentTrack, itemData.id);
      await updateRoomBackgroundMusic(true, currentTrack);
    } catch (error) {
      console.error('Error playing sound:', error);
      toast.show('Failed to play audio', { type: 'error' });
    }
  };

  const handleStop = async () => {
    try {
      await playSoundEffect();
      await stop(itemData.id);
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
        itemId: itemData.id,
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
        {isPlaying(itemData.id) && <AnimatedMusicNotes />}
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
              {isPlaying(itemData.id) && <AnimatedMusicNotes />}
            </Animated.View>
            <XStack space justifyContent="center" marginVertical="$4">
              <Button
                icon={Play}
                onPress={handlePlay}
                disabled={isPlaying(itemData.id)}
                backgroundColor={isPlaying(itemData.id) ? "$green8" : "$green10"}
                borderColor={isPlaying(itemData.id) ? "$green10" : "transparent"}
                borderWidth={2}
                style={boomboxStyles.controlButton}
              />
              <Button
                icon={Pause}
                onPress={handleStop}
                disabled={!isPlaying(itemData.id)}
                backgroundColor={!isPlaying(itemData.id) ? "$red8" : "$red10"}
                borderColor={!isPlaying(itemData.id) ? "$red10" : "transparent"}
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