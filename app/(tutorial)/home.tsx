// app/tutorial/home.tsx
import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { View, ScrollView, styled, YStack, Dialog, Button, Text } from "tamagui";
import { useRouter, useLocalSearchParams } from "expo-router";
import HomeTile from "../../components/HomeTile";
import CreateHomeTile from "../../components/CreateHomeTile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "firebaseConfig";

const HomePageContainer = styled(View, {
  backgroundColor: "#fff2cf",
  flex: 1,
});

const getTutorialKey = (userId: string) => `@tutorial_${userId}`;
const getRoomKey = (userId: string) => `@tutorial_room_${userId}`;

export default function TutorialHome() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from: string }>();
  const [room, setRoom] = useState<{ id: string; name: string } | null>(null);
  const [dialogConfig, setDialogConfig] = useState<{
    show: boolean;
    title: string;
    description: string;
    action: string;
    onAction: () => void;
  } | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          router.replace("/(auth)/login");
          return;
        }

        // Clear any old tutorial data not associated with a user
        await AsyncStorage.removeItem('@tutorial_room');
        await AsyncStorage.removeItem('@tutorial_progress');

        const savedRoom = await AsyncStorage.getItem(getRoomKey(userId));
        if (savedRoom) {
          setRoom(JSON.parse(savedRoom));
        }
        
        // Only show welcome dialog if no room exists
        if (!savedRoom) {
          showWelcomeDialog();
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };

    loadSavedState();

    // Cleanup function to remove tutorial data when component unmounts
    return () => {
      const cleanup = async () => {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await AsyncStorage.removeItem(getTutorialKey(userId));
          await AsyncStorage.removeItem(getRoomKey(userId));
        }
      };
      cleanup();
    };
  }, []);

  const showWelcomeDialog = () => {
    setDialogConfig({
      show: true,
      title: "Welcome to OurShelves!",
      description: "Let's walk through how to use the app. First, you'll need to create a room to store your items.",
      action: "Got it!",
      onAction: () => showCreateRoomDialog(),
    });
  };

  const showCreateRoomDialog = () => {
    setDialogConfig({
      show: true,
      title: "Create a Room",
      description: "Tap the '+' tile to create your first room!",
      action: "OK",
      onAction: () => setDialogConfig(prev => prev ? { ...prev, show: false } : null),
    });
  };

  const showNavigateShopDialog = () => {
    setDialogConfig({
      show: true,
      title: "Visit the Shop",
      description: "Great! Now let's visit the shop to get some items for your room.",
      action: "Go to Shop",
      onAction: async () => {
        const userId = auth.currentUser?.uid;
        if (userId) {
          setDialogConfig(null);
          await AsyncStorage.setItem(getTutorialKey(userId), 'SHOP');
          router.push("/(tutorial)/shop");
        }
      },
    });
  };

  const showEnterRoomDialog = () => {
    setDialogConfig({
      show: true,
      title: "Enter Your Room",
      description: "Now that you have some items, let's enter your room!",
      action: "Enter Room",
      onAction: async () => {
        const userId = auth.currentUser?.uid;
        if (userId) {
          setDialogConfig(null);
          await AsyncStorage.setItem(getTutorialKey(userId), 'ROOM');
          router.push("/(tutorial)/room");
        }
      },
    });
  };

  const handleCreateRoom = async (roomName: string, roomDescription: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const newRoom = { id: 'tutorial-room', name: roomName };
    setRoom(newRoom);
    await AsyncStorage.setItem(getRoomKey(userId), JSON.stringify(newRoom));
    await AsyncStorage.setItem(getTutorialKey(userId), 'CREATED');
    setTimeout(() => showNavigateShopDialog(), 100);
  };

  // Handle returning from shop
  useEffect(() => {
    const checkProgress = async () => {
      const userId = auth.currentUser?.uid;
      if (from === 'shop' && room && userId) {
        const progress = await AsyncStorage.getItem(getTutorialKey(userId));
        if (progress === 'SHOP') {
          showEnterRoomDialog();
        }
      }
    };

    checkProgress();
  }, [from, room]);

  return (
    <HomePageContainer>
      <ScrollView contentContainerStyle={styles.homeContainer}>
        {room && (
          <HomeTile
            id={room.id}
            name={room.name}
            isAdmin={true}
            tags={[]}
            tagsList={[]}
            tagIdsList={[]}
            enterRoom={() => router.push("/(tutorial)/room")}
            homeLeaveRoom={() => {}}
            homeAddTag={() => {}}
            homeDeleteRoom={() => {}}
          />
        )}
        {!room && (
          <CreateHomeTile handleCreateRoom={handleCreateRoom} />
        )}
      </ScrollView>

      {dialogConfig && dialogConfig.show && (
        <Dialog modal open={dialogConfig.show} onOpenChange={(open) => {
          if (!open) setDialogConfig(null);
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
    </HomePageContainer>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
});