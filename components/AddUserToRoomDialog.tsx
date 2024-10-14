import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { Dialog, Text, YStack, XStack, ScrollView, Spinner, AlertDialog } from "tamagui";
import { AlertTriangle, UserPlus } from "@tamagui/lucide-icons";
import { getAdminRooms } from "../project-functions/profileFunctions";
import { auth, db } from "firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import {
  StyledDialogContent,
  DialogTitle,
  StyledButton,
  RoomCard,
  CancelButton,
  CloseButton,
  LoadingContainer,
  NoRoomsText,
  SearchInput,
  StyledAlertDialogContent,
  StyledAlertDialogTitle,
  StyledAlertDialogDescription,
  AlertDialogIconContainer,
  AlertDialogButtonContainer,
  AlertDialogButton,
} from "../styles/AddUserToRoomDialogStyles";

interface Room {
  id: string;
  name: string;
}

interface AddUserToRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const AddUserToRoomDialog: React.FC<AddUserToRoomDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName,
}) => {
  const [adminRooms, setAdminRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [roomToAdd, setRoomToAdd] = useState<Room | null>(null);

  useEffect(() => {
    const fetchAdminRooms = async () => {
      if (auth.currentUser) {
        const rooms = await getAdminRooms(auth.currentUser.uid);
        setAdminRooms(rooms);
        setFilteredRooms(rooms);
        setLoading(false);
      }
    };

    fetchAdminRooms();
  }, []);

  useEffect(() => {
    const filtered = adminRooms.filter((room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRooms(filtered);
  }, [searchQuery, adminRooms]);

  const handleAddUserToRoom = async (room: Room) => {
    setRoomToAdd(room);
    setConfirmationOpen(true);
  };

  const confirmAddUserToRoom = async () => {
    if (!roomToAdd) return;

    try {
      const userRef = doc(db, "Users", userId);
      const roomRef = doc(db, "Rooms", roomToAdd.id);

      await updateDoc(userRef, {
        rooms: arrayUnion(roomRef),
      });

      await updateDoc(roomRef, {
        users: arrayUnion(userRef),
      });

      Alert.alert("Success", `${userName} has been added to ${roomToAdd.name}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding user to room:", error);
      Alert.alert("Error", "Failed to add user to room. Please try again.");
    } finally {
      setConfirmationOpen(false);
      setRoomToAdd(null);
    }
  };

  return (
    <>
      <Dialog modal open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <StyledDialogContent
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
            <YStack gap="$4">
              <Dialog.Title>
                <DialogTitle>Add {userName} to Room</DialogTitle>
              </Dialog.Title>
              <SearchInput
                placeholder="Search rooms..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {loading ? (
                <LoadingContainer>
                  <Spinner size="large" color="$blue10" />
                </LoadingContainer>
              ) : filteredRooms.length > 0 ? (
                <ScrollView>
                  <YStack gap="$2">
                    {filteredRooms.map((room) => (
                      <RoomCard key={room.id} elevate>
                        <Text fontSize="$4" color="$color">
                          {room.name}
                        </Text>
                        <StyledButton
                          onPress={() => handleAddUserToRoom(room)}
                          icon={UserPlus}
                          size="$3"
                          circular
                          theme="active"
                        />
                      </RoomCard>
                    ))}
                  </YStack>
                </ScrollView>
              ) : (
                <NoRoomsText>No rooms found.</NoRoomsText>
              )}
              <XStack gap="$2" justifyContent="flex-end">
                <Dialog.Close asChild>
                  <CancelButton>Cancel</CancelButton>
                </Dialog.Close>
              </XStack>
            </YStack>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </StyledDialogContent>
        </Dialog.Portal>
      </Dialog>

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <StyledAlertDialogContent
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
            <YStack gap="$4" alignItems="center">
              <AlertDialogIconContainer>
                <AlertTriangle color="$orange10" size={40} />
              </AlertDialogIconContainer>
              <StyledAlertDialogTitle>Confirm Add User to Room</StyledAlertDialogTitle>
              <StyledAlertDialogDescription>
                Are you sure you want to add {userName} to {roomToAdd?.name}?
              </StyledAlertDialogDescription>

              <AlertDialogButtonContainer>
                <AlertDialog.Cancel asChild>
                  <AlertDialogButton theme="alt1" aria-label="Cancel">
                    Cancel
                  </AlertDialogButton>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <AlertDialogButton
                    theme="active"
                    aria-label="Add User"
                    onPress={confirmAddUserToRoom}
                  >
                    Add User
                  </AlertDialogButton>
                </AlertDialog.Action>
              </AlertDialogButtonContainer>
            </YStack>
          </StyledAlertDialogContent>
        </AlertDialog.Portal>
      </AlertDialog>
    </>
  );
};

export default AddUserToRoomDialog;
