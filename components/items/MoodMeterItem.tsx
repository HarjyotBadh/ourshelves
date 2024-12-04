import React, { useState, useCallback, useEffect } from "react";
import { Modal, Image } from "react-native";
import { YStack, Button, Text, View, Input, ScrollView, Avatar } from "tamagui";
import { Toast, ToastViewport, useToastController } from "@tamagui/toast";
import { auth } from "firebaseConfig";
import { earnCoins } from "project-functions/shopFunctions";

const MoodMeterView = ({ isModalVisible, handleClose, userMood, setUserMood, allUserMoods, roomUsers }) => {
  const [emojiInput, setEmojiInput] = useState('');
  const toast = useToastController();

  const validateEmoji = (text) => {
    // Check if the input contains anything other than emoji
    const nonEmojiRegex = /[A-Za-z0-9\s!@#$%^&*(),.?":{}|<>]/;
    return !nonEmojiRegex.test(text);
  };

  const handleEmojiSubmit = () => {
    if (emojiInput && validateEmoji(emojiInput)) {
      setUserMood(emojiInput);
      setEmojiInput('');
    } else {
      toast.show("Please enter a valid emoji", {
        duration: 3000,
      });
    }
  };

  const renderUserMood = (userId, mood) => {
    const user = roomUsers.find(user => user.id === userId);
    if (!user) return null;

    return (
      <View 
        key={userId} 
        backgroundColor="$blue2"
        padding="$2" 
        marginVertical="$1"
        borderRadius="$2"
        flexDirection="row"
        alignItems="center"
      >
        <Avatar circular size="$4" marginRight="$2">
          {user.profilePicture ? (
            <Avatar.Image src={user.profilePicture} />
          ) : (
            <Avatar.Fallback backgroundColor="$blue5">
              <Text color="$blue11" fontSize="$3">
                {user.displayName[0].toUpperCase()}
              </Text>
            </Avatar.Fallback>
          )}
        </Avatar>
        <Text flex={1} fontSize="$4">{user.displayName}</Text>
        <Text fontSize="$6">{mood}</Text>
      </View>
    );
  };

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
        <View
          width="90%"
          maxWidth={500}
          backgroundColor="#DEB887"
          borderTopLeftRadius={12}
          borderTopRightRadius={12}
          overflow="hidden"
          padding="$4"
        >
          <YStack gap="$4" paddingBottom="$8">
            <Text color="white" fontSize="$6" textAlign="center" marginBottom="$4">
              Set Your Mood
            </Text>

            {userMood && (
              <Text fontSize="$9" textAlign="center" marginVertical="$4">
                {userMood}
              </Text>
            )}

            <View flexDirection="row" gap="$2">
              <Input
                flex={1}
                value={emojiInput}
                onChangeText={(text) => {
                  // Only update if it's a single character or empty
                  if (text.length <= 2) {
                    setEmojiInput(text);
                  }
                }}
                placeholder="Enter an emoji"
                fontSize="$4"
                maxLength={2}
              />
              <Button onPress={handleEmojiSubmit} backgroundColor="$blue9">
                Set
              </Button>
            </View>

            <Text color="white" fontSize="$4" textAlign="center">
              Other Users' Moods
            </Text>

            <ScrollView maxHeight={200} marginVertical="$2">
              <YStack gap="$2">
                {Object.entries(allUserMoods)
                  .filter(([userId]) => userId !== auth.currentUser?.uid)
                  .map(([userId, mood]) => renderUserMood(userId, mood))}
              </YStack>
            </ScrollView>

            <Button onPress={handleClose} backgroundColor="$red9">
              Close
            </Button>
          </YStack>

          <View
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height={20}
            backgroundColor="#8B4513"
          />
        </View>
        <ToastViewport name="moodmeter" />
      </YStack>
    </Modal>
  );
};

const MoodMeterItem = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userMood, setUserMood] = useState('');
  const [allUserMoods, setAllUserMoods] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const toast = useToastController();

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

  useEffect(() => {
    // Load moods from itemData
    setAllUserMoods(itemData.userMoods || {});
    
    // If current user has a mood, set it
    if (itemData.userMoods?.[auth.currentUser?.uid]) {
      setUserMood(itemData.userMoods[auth.currentUser?.uid]);
    }
  }, [itemData]);

  const handleClose = useCallback(async () => {
    try {
      if (hasChanges) {
        await earnCoins(auth.currentUser?.uid, 10);
        toast.show("You earned 10 coins for updating your mood!", {
          duration: 3000,
        });
        setHasChanges(false);
      }
      setIsModalVisible(false);
      onClose();
    } catch (error) {
      console.error("Error closing mood meter:", error);
    }
  }, [hasChanges, onClose, toast]);

  const handleSetUserMood = (mood) => {
    const updatedMoods = {
      ...allUserMoods,
      [auth.currentUser?.uid]: mood
    };
    setUserMood(mood);
    setAllUserMoods(updatedMoods);
    setHasChanges(true);
    onDataUpdate({ ...itemData, userMoods: updatedMoods });
  };

  if (!isActive) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Image source={{ uri: itemData.imageUri }} style={{ width: 80, height: 80 }} />
      </YStack>
    );
  }

  return (
    <MoodMeterView
      isModalVisible={isModalVisible}
      handleClose={handleClose}
      userMood={userMood}
      setUserMood={handleSetUserMood}
      allUserMoods={allUserMoods}
      roomUsers={roomInfo.users}
    />
  );
};

MoodMeterItem.getInitialData = () => ({
  userMoods: {}
});

export default MoodMeterItem;