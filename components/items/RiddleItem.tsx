import React, { useState, useEffect } from "react";
import { View, Modal, TouchableWithoutFeedback, Keyboard } from "react-native";
import { 
  YStack, 
  XStack, 
  Button, 
  Text,
  H4,
  Input,
  ScrollView,
} from "tamagui";
import { auth } from "firebaseConfig";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { earnCoins } from "project-functions/shopFunctions";
import {
  RiddleView,
  ContentContainer,
  BottomBar,
  RiddleTextContainer,
  riddleStyles
} from "styles/RiddleStyles";
import { HelpCircle, X } from "@tamagui/lucide-icons";

interface RiddleItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    riddleAnswer: string;
    riddlePrompt: string;
    usersSolved: string[];
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
  };
}

interface RiddleItemComponent extends React.FC<RiddleItemProps> {
  getInitialData: () => { 
    riddleAnswer: string;
    riddlePrompt: string;
    usersSolved: string[];
  };
}

const RiddleItem: RiddleItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [riddleAnswer, setRiddleAnswer] = useState(itemData.riddleAnswer || "");
  const [riddlePrompt, setRiddlePrompt] = useState(itemData.riddlePrompt || "");
  const [riddleAttempt, setRiddleAttempt] = useState("");
  const [solvedUsers, setSolvedUsers] = useState<string[]>(itemData.usersSolved || []);
  const isOwner = itemData.placedUserId === auth.currentUser?.uid;
  
  const toast = useToastController();

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

  useEffect(() => {
    setRiddlePrompt(itemData.riddlePrompt || "");
    setRiddleAnswer(itemData.riddleAnswer || "");
    setSolvedUsers(itemData.usersSolved || []);
  }, [itemData]);

  const handleClose = () => {
    setIsModalVisible(false);
    onClose();
  };

  const handleRiddleAttempt = () => {
    const normalizedAttempt = riddleAttempt.trim().toLowerCase();
    const normalizedAnswer = riddleAnswer.trim().toLowerCase();
    
    if (normalizedAttempt === normalizedAnswer) {
      const currentUserId = auth.currentUser?.uid;
      if (!solvedUsers.includes(currentUserId)) {
        const updatedSolvedUsers = [...solvedUsers, currentUserId];
        setSolvedUsers(updatedSolvedUsers);
        onDataUpdate({ ...itemData, usersSolved: updatedSolvedUsers });
        earnCoins(auth.currentUser?.uid, 150);
        toast.show("Congratulations! You solved the riddle! (+150 coins)", {
          duration: 3000,
        });
      } else {
        toast.show("You've already solved this riddle!", {
          duration: 3000,
        });
      }
    } else {
      toast.show("Incorrect answer. Try again!", {
        duration: 3000,
      });
    }
    setRiddleAttempt("");
  };

  const handleRiddleUpdate = () => {
    if (!riddlePrompt.trim() || !riddleAnswer.trim()) {
      toast.show("Please fill in both the riddle and its answer", {
        duration: 3000,
      });
      return;
    }
    onDataUpdate({
      ...itemData,
      riddleAnswer: riddleAnswer.trim(),
      riddlePrompt: riddlePrompt.trim(),
      usersSolved: []
    });
    toast.show("Riddle updated successfully!", {
      duration: 3000,
    });
  };

  if (!isActive) {
    return (
      <View style={riddleStyles.inactiveContainer}>
        <HelpCircle
          color={isOwner ? "#FFD700" : "#64b5f6"}
          size={70}
        />
        <View style={riddleStyles.ownerNameContainer}>
          {isOwner ? (
            <Text style={riddleStyles.ownerNameText}>My Riddle</Text>
          ) : (
            <Text style={[
              riddleStyles.ownerNameText,
              solvedUsers.includes(auth.currentUser?.uid) && { color: '#4CAF50' }
            ]}>
              {solvedUsers.includes(auth.currentUser?.uid) ? "Solved!" : "Unsolved"}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={riddleStyles.modalContainer}>
        <RiddleView>
          <ContentContainer>
            <XStack width="100%" justifyContent="space-between" alignItems="center">
              <H4 textAlign="center" color="#8B4513">
                {isOwner ? "Edit Your Riddle" : "Solve The Riddle"}
              </H4>
              <Button
                unstyled
                circular
                onPress={handleClose}
                icon={<X color="#8B4513" size={24} />}
              />
            </XStack>

            <RiddleTextContainer>
              <Text style={riddleStyles.riddlePrompt}>
                {riddlePrompt || "No riddle set yet"}
              </Text>
            </RiddleTextContainer>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <YStack flex={1}>
                {isOwner ? (
                  <YStack gap="$4">
                    <Input
                      value={riddlePrompt}
                      onChangeText={setRiddlePrompt}
                      placeholder="Enter your riddle"
                      multiline
                    />
                    <Input
                      value={riddleAnswer}
                      onChangeText={setRiddleAnswer}
                      placeholder="Enter the answer"
                    />
                    <XStack style={riddleStyles.buttonContainer}>
                      <Button flex={1} onPress={handleRiddleUpdate} backgroundColor="$green10">
                        Update Riddle
                      </Button>
                    </XStack>
                  </YStack>
                ) : (
                  <YStack gap="$4">
                    <Input
                      value={riddleAttempt}
                      onChangeText={setRiddleAttempt}
                      placeholder="Enter your answer"
                    />
                    <XStack style={riddleStyles.buttonContainer}>
                      <Button flex={1} onPress={handleRiddleAttempt} backgroundColor="$blue10">
                        Submit Answer
                      </Button>
                    </XStack>
                  </YStack>
                )}

                <Button
                  onPress={handleClose}
                  theme="red"
                  marginTop="$4"
                >
                  Close
                </Button>
              </YStack>
            </TouchableWithoutFeedback>
          </ContentContainer>
          <BottomBar />
        </RiddleView>
        <ToastViewport name="riddle" />
      </View>
    </Modal>
  );
};

RiddleItem.getInitialData = () => ({ 
  riddleAnswer: "",
  riddlePrompt: "",
  usersSolved: [] 
});

export default RiddleItem;