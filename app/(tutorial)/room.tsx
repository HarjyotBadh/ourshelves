// app/tutorial/room.tsx
import React, { useState, useEffect } from "react";
import { Pressable } from "react-native";
import {
  YStack,
  Text,
  Button,
  ScrollView,
  Dialog,
} from "tamagui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { auth, db } from "firebaseConfig";
import {
  doc,
  updateDoc,
} from "firebase/firestore";
import Shelf from "../../components/Shelf";
import ItemSelectionSheet from "../../components/ItemSelectionSheet";
import {
  BACKGROUND_COLOR,
  HEADER_BACKGROUND,
  HeaderButton,
  Header,
  Content,
  SafeAreaWrapper,
  Container,
} from "../../styles/RoomStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  TUTORIAL_PROGRESS: '@tutorial_progress'
};

const TUTORIAL_ITEMS = [
  {
    itemId: "SoPRqkDt7BchhwihkqRN",
    name: "Test Item",
    imageUri: "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/items%2FTestSquare.png?alt=media&token=437e78d2-88e6-4f1e-979a-0d4b39f8e8bb",
    cost: 50,
    shouldLock: false,
    styleId: "defaultStyle",
    styleName: "Default Style",
  }
];

export default function TutorialRoom() {
  const router = useRouter();
  const [dialogConfig, setDialogConfig] = useState<{
    show: boolean;
    title: string;
    description: string;
    action: string;
    onAction: () => void;
  }>({
    show: true,
    title: "Welcome to Your Room!",
    description: "This is where you can place and interact with your items. Let's start by adding an item to the shelf.",
    action: "Next",
    onAction: () => showAddItemDialog(),
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<{ shelfId: string; position: number } | null>(null);
  const [placedItem, setPlacedItem] = useState<any>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Tutorial shelf setup
  const tutorialShelf = {
    id: "tutorial-shelf",
    name: "Tutorial Shelf",
    position: 0,
    placedItems: placedItem ? [placedItem] : [],
  };

  const showAddItemDialog = () => {
    setDialogConfig({
      show: true,
      title: "Add an Item",
      description: "Tap the '+' button on the shelf to place your item.",
      action: "Got it",
      onAction: () => {
        setDialogConfig(prev => ({ ...prev, show: false }));
        setIsEditMode(true);
      }
    });
  };

  const showInteractDialog = () => {
    setDialogConfig({
      show: true,
      title: "Interact with Items",
      description: "Great! Now tap your item to interact with it.",
      action: "Got it",
      onAction: () => setDialogConfig(prev => ({ ...prev, show: false }))
    });
  };

  const showRemoveDialog = () => {
    setDialogConfig({
      show: true,
      title: "Remove Items",
      description: "Finally, let's remove the item. Long press anywhere to enter edit mode, then tap the 'X' on the item.",
      action: "Got it",
      onAction: () => setDialogConfig(prev => ({ ...prev, show: false }))
    });
  };

  const showCompletedDialog = () => {
    setDialogConfig({
      show: true,
      title: "Tutorial Complete!",
      description: "Congratulations! You've learned the basics of OurShelves. Ready to start creating your own rooms?",
      action: "Let's Go!",
      onAction: handleCompleteTutorial
    });
  };

  const handleCompleteTutorial = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Update user document to mark tutorial as completed
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        hasCompletedTutorial: true,
      });

      await AsyncStorage.removeItem(STORAGE_KEYS.TUTORIAL_PROGRESS);
      
      // Redirect to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error completing tutorial:", error);
    }
  };

  const handleItemSelect = async (item: any) => {
    if (selectedSpot) {
      const newPlacedItem = {
        id: "tutorial-item",
        roomId: "tutorial-room",
        shelfId: selectedSpot.shelfId,
        itemId: item.itemId,
        position: selectedSpot.position,
        createdAt: new Date(),
        updatedAt: new Date(),
        shouldLock: false,
        itemData: {
          name: item.name,
          imageUri: item.imageUri,
        },
        placedUserId: auth.currentUser?.uid || "",
      };

      setPlacedItem(newPlacedItem);
      setIsSheetOpen(false);
      setSelectedSpot(null);
      setIsEditMode(false);
      showInteractDialog();
    }
  };

  const handleItemDataUpdate = async (position: number, newItemData: Record<string, any>) => {
    if (!hasInteracted) {
      setHasInteracted(true);
      showRemoveDialog();
    }
  };

  const handleItemRemove = async (position: number) => {
    setPlacedItem(null);
    setIsEditMode(false);
    showCompletedDialog();
  };

  return (
    <SafeAreaWrapper>
      <Container>
        <Header>
          <HeaderButton unstyled onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </HeaderButton>
          <Text fontSize={18} fontWeight="bold" flex={1} textAlign="center" color="white">
            Tutorial Room
          </Text>
        </Header>
        <Content>
          <ScrollView scrollEventThrottle={16}>
            <Pressable
              onLongPress={() => {
                if (placedItem) {
                  setIsEditMode(true);
                }
              }}
              delayLongPress={500}
            >
              <YStack backgroundColor={BACKGROUND_COLOR} padding="$4" gap="$6">
                <Shelf
                  key={tutorialShelf.id}
                  shelfId={tutorialShelf.id}
                  shelfNumber={1}
                  shelfName={tutorialShelf.name}
                  items={[placedItem, null, null]}
                  showPlusSigns={isEditMode}
                  onSpotPress={(position) => {
                    setSelectedSpot({ shelfId: tutorialShelf.id, position });
                    setIsSheetOpen(true);
                  }}
                  onItemRemove={handleItemRemove}
                  onItemDataUpdate={handleItemDataUpdate}
                  onShelfNameChange={() => {}}
                  users={[]}
                  roomInfo={{
                    name: "Tutorial Room",
                    users: [],
                    description: "",
                    roomId: "tutorial-room",
                  }}
                  availableItems={TUTORIAL_ITEMS}
                />
              </YStack>
            </Pressable>
          </ScrollView>
        </Content>

        <ItemSelectionSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onSelectItem={handleItemSelect}
          items={TUTORIAL_ITEMS}
        />

        {dialogConfig && dialogConfig.show && (
          <Dialog modal open={dialogConfig.show} onOpenChange={(open) => {
            setDialogConfig(prev => prev ? { ...prev, show: open } : { show: false, title: "", description: "", action: "", onAction: () => {} });
          }}>
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
              >
                <Dialog.Title>{dialogConfig.title}</Dialog.Title>
                <Dialog.Description>{dialogConfig.description}</Dialog.Description>
                <YStack ai="flex-end" mt="$4">
                  <Button 
                    theme="blue" 
                    onPress={dialogConfig.onAction}
                  >
                    {dialogConfig.action}
                  </Button>
                </YStack>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog>
        )}
      </Container>
    </SafeAreaWrapper>
  );
}