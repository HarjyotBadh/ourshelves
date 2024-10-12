import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import {
  Dialog,
  Button,
  Text,
  YStack,
  XStack,
  ScrollView,
  Spinner,
  styled,
  useTheme,
  Input,
  Card,
} from "tamagui";
import { X, UserPlus, Search } from "@tamagui/lucide-icons";
import { getAdminRooms } from "../project-functions/profileFunctions";
import { auth, db } from "firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

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

const StyledDialogContent = styled(Dialog.Content, {
  width: "90%",
  maxWidth: 500,
  height: "80%",
  maxHeight: 600,
  padding: "$4",
  backgroundColor: "$background",
  borderRadius: "$4",
});

const DialogTitle = styled(Text, {
  fontSize: "$6",
  fontWeight: "bold",
  color: "$color",
});

const StyledButton = styled(Button, {
  animation: "quick",
  pressStyle: { scale: 0.97 },
});

const RoomCard = styled(Card, {
  marginBottom: "$2",
  padding: "$3",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
});

const CancelButton = styled(StyledButton, {
  backgroundColor: "$gray5",
  color: "$gray11",
});

const CloseButton = styled(StyledButton, {
  position: "absolute",
  top: "$3",
  right: "$3",
  size: "$3",
  circular: true,
  icon: X,
  backgroundColor: "transparent",
  color: "$gray11",
});

const LoadingContainer = styled(YStack, {
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
});

const NoRoomsText = styled(Text, {
  fontSize: "$4",
  textAlign: "center",
  color: "$gray11",
});

const SearchInput = styled(Input, {
  marginBottom: "$3",
});

const AddUserToRoomDialog: React.FC<AddUserToRoomDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName,
}) => {
  const theme = useTheme();
  const [adminRooms, setAdminRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleAddUserToRoom = async (roomId: string, roomName: string) => {
    try {
      const userRef = doc(db, "Users", userId);
      const roomRef = doc(db, "Rooms", roomId);

      await updateDoc(userRef, {
        rooms: arrayUnion(roomRef),
      });

      await updateDoc(roomRef, {
        users: arrayUnion(userRef),
      });

      Alert.alert("Success", `${userName} has been added to ${roomName}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding user to room:", error);
      Alert.alert("Error", "Failed to add user to room. Please try again.");
    }
  };

  return (
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
                <YStack space="$2">
                  {filteredRooms.map((room) => (
                    <RoomCard key={room.id} elevate>
                      <Text fontSize="$4" color="$color">
                        {room.name}
                      </Text>
                      <StyledButton
                        onPress={() => handleAddUserToRoom(room.id, room.name)}
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
  );
};

export default AddUserToRoomDialog;
