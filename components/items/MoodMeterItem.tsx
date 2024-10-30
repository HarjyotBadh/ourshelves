import React, { useState, useCallback, useEffect } from "react";
import { Modal, TouchableOpacity, Dimensions } from "react-native";
import { View, YStack, Button, Image, Text } from "tamagui";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { MoodMeterItemComponent } from "components/items/MoodMeterModel";
import {
  MoodMeterView,
  MoodContainer,
  MoodOption,
  BOTTOM_BAR_HEIGHT,
  BottomBar,
  styles,
} from "components/items/MoodMeterStyles";
import { auth } from "firebaseConfig";
import { earnCoins } from "project-functions/shopFunctions";

const { width: screenWidth } = Dimensions.get("window");
const PREVIEW_WIDTH = 100;
const PREVIEW_HEIGHT = PREVIEW_WIDTH;
const PREVIEW_PADDING = 5;

const MOODS = [
  { id: 'happy', emoji: '😊', text: 'Happy', imageUri: 'path/to/happy/emoji' },
  { id: 'sad', emoji: '😢', text: 'Sad', imageUri: 'path/to/sad/emoji' },
  { id: 'angry', emoji: '😠', text: 'Angry' },
  { id: 'excited', emoji: '🤩', text: 'Excited' },
  { id: 'tired', emoji: '😴', text: 'Tired' }
];

const defaultItemData = {
  currentMood: 'happy',
  imageUri: MOODS[0].imageUri || ''
};

const MoodMeterItem: MoodMeterItemComponent = ({
  itemData = defaultItemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentMood, setCurrentMood] = useState(itemData.currentMood || 'happy');
  const [hasChanges, setHasChanges] = useState(false);
  const toast = useToastController();

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);


  const handleClose = useCallback(async () => {
    try {
      if (hasChanges) {
        await earnCoins(auth.currentUser.uid, 10);
        toast.show("You earned 10 coins for updating your mood!", {
          duration: 3000,
        });
        setHasChanges(false); // Reset the state
      }
      setIsModalVisible(false); // Explicitly close the modal
      onClose();
    } catch (error) {
      console.error("Error closing mood meter:", error);
    }
  }, [hasChanges, onClose, toast]);

  const handleMoodChange = (moodId: string) => {
    const selectedMood = MOODS.find(mood => mood.id === moodId);
    if (selectedMood) {
      setCurrentMood(moodId);
      setHasChanges(true);
      onDataUpdate({ 
        ...itemData, 
        currentMood: moodId,
        emoji: selectedMood.emoji  // Store emoji instead of imageUri
      });
    }
  };
  
  const renderMoodPreview = () => (
    <View style={{ padding: PREVIEW_PADDING }}>
      <Text style={{ 
        fontSize: PREVIEW_WIDTH * 0.8,
        textAlign: 'center' 
      }}>
        {MOODS.find(mood => mood.id === currentMood)?.emoji || '😊'}
      </Text>
    </View>
  );

  if (!isActive) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        {renderMoodPreview()}
      </YStack>
    );
  }

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <YStack
        flex={1}
        backgroundColor="rgba(0,0,0,0.5)"
        justifyContent="center"
        alignItems="center"
      >
        <MoodMeterView style={styles.modalContent}>
          <Text style={[styles.moodText, { fontSize: 18, marginBottom: 15 }]}>
            How are you feeling?
          </Text>
          <MoodContainer>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                onPress={() => handleMoodChange(mood.id)}
              >
                <MoodOption
                  style={[
                    currentMood === mood.id && styles.selectedMood
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{mood.emoji}</Text>
                  <Text style={styles.moodText}>{mood.text}</Text>
                </MoodOption>
              </TouchableOpacity>
            ))}
          </MoodContainer>
          
          <Button
            onPress={handleClose}
            backgroundColor="$blue10"
            color="white"
            size="$3"
            marginTop="$4"
          >
            Close
          </Button>
          <BottomBar />
        </MoodMeterView>
        <ToastViewport name="moodmeter" />
      </YStack>
    </Modal>
  );
};

MoodMeterItem.getInitialData = () => defaultItemData;

export default MoodMeterItem;