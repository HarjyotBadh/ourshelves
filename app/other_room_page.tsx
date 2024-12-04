import React, { useState, useEffect } from "react";
import { db } from "firebaseConfig";
import { UserData } from "../models/UserData";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Avatar,
  styled,
  TextArea,
  Button,
  Text,
  H2,
  H4,
  Spinner,
  XStack,
  YStack,
  SizableText,
  ScrollView,
} from "tamagui";
import { getTags, getTagById, getUserById } from "project-functions/homeFunctions";
import { doc, DocumentReference, DocumentData, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DoorOpen, Tag } from "@tamagui/lucide-icons";
import AddUserToRoomDialog from "../components/AddUserToRoomDialog";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "firebaseConfig"; // Ensure this is correctly configured in your project
import TagsModal from './TagsModal'; // Import the TagsModal

// Data for profile page to be queried from db
interface RoomPage extends DocumentData {
    roomName: string;
    description: string;
    tags: DocumentReference[];
    users: DocumentReference[];
}

const LoadingContainer = styled(YStack, {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "BACKGROUND_COLOR",
  padding: 20,
});

export default function RoomPage() {
  const [loading, setLoading] = useState(true);
  const [roomPage, setRoomPage] = useState<RoomPage | null>(null);
  const [description, setDescription] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [userList, setUserList] = useState<
    {
      id: string;
      displayName: string;
    }[]
  >([]);
  const [profileIcon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const [isAddToRoomDialogOpen, setIsAddToRoomDialogOpen] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false); // State for showing tags modal
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string | null } | null>(null);

  const userMap = new Map<
  string,
  {
    id: string;
    displayName: string;
  }
>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (roomId) {
          // Ensure profileId is defined
          const roomDocRef = doc(db, "Rooms", roomId);
          const roomDoc = await getDoc(roomDocRef);

          if (roomDoc.exists()) {
            const roomPageData = roomDoc.data();
            setRoomPage({
                users: roomPageData?.users || [],
                description: roomPageData?.description || [],
                roomName: roomPageData?.name || "unknown room",
                tags: roomPageData?.tags || [],
            });
            

            // TODO, somehow get the users and tags from the list of ids
            console.log(roomPageData?.users)
            for (const ref of roomPageData?.users) {
                const userDoc = await getDoc(ref);
                if (userDoc.exists()) {
                  const userData = userDoc.data() as UserData;
                  userMap.set(userDoc.id, {
                    id: userDoc.id,
                    displayName: userData.displayName || "Unknown User",
                  });
                }
            }

            
            console.log(userMap)

            const userNames = Array.from(userMap.values());
            setUserList(userNames)
    
            setDescription(roomPageData?.description || "N/A");
          } else {
            throw new Error("Room not found");
          }
        } else {
          throw new Error("Room ID is missing");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId]);


  // The Loading Page
  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size="large" color="$blue10" />
        <Text fontSize={18} color="$blue10" marginTop={20} marginBottom={10}>
          Profile is loading...
        </Text>
      </LoadingContainer>
    );
  }

  // Function to handle viewing tags
  const viewTags = () => {
    if (roomPage) {
      setShowTagsModal(true); // Show the modal
    }
  };

  const confirmAddUserToRoom = async () => {

    try {
      const userRef = doc(db, "Users", auth.currentUser?.uid);
      const roomRef = doc(db, "Rooms", roomId);

      await updateDoc(userRef, {
        rooms: arrayUnion(roomRef),
      });

      await updateDoc(roomRef, {
        users: arrayUnion(userRef),
      });

      Alert.alert("Success", `You joined ${roomPage?.roomName}`);
    } catch (error) {
      console.error("Error adding user to room:", error);
      Alert.alert("Error", "Failed to add user to room. Please try again.");
    } 
  };

  const handleUserClick = (userId: string) => {
    // Define the action when a user is clicked. For example:
    router.push(`/other_user_page?profileId=${userId}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `${roomPage?.roomName}`,
          headerBackTitle: "Search",
        }}
      />

      <SafeAreaView>
        <YStack ai="center" gap="$4" px="$10" pt="$1">
          <H2>{roomPage?.roomName}</H2>

          <H4>Room Description:</H4>
          <TextArea
            height={50}
            width={300}
            textAlign="center"
            value={description}
            editable={false}
            borderWidth={2}
          />

          <H4>Users:</H4>
          <ScrollView style={{ maxHeight: 200, width: "100%" }}>
            {userList.map((user) => (
              <TouchableOpacity
                onPress={() => handleUserClick(user.id)}
              >
                <Text fontSize="$9" color="$color" marginBottom="$2">
                    {user.displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <XStack gap={10}>
            <Button
              size="$7"
              circular
              onPress={() => confirmAddUserToRoom()}
              color="$white"
              justifyContent="center"
              alignItems="center"
              display="flex"
              icon={<DoorOpen size="$4" />}
            />

            <Button
              size="$7"
              circular
              onPress={viewTags}
              color="$white"
              justifyContent="center"
              alignItems="center"
              display="flex"
              icon={<Tag size="$4" />}
            />
          </XStack>
        </YStack>
      </SafeAreaView>

      <TagsModal
        visible={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        tags={tagsList || []}
      />
    </>
  );
}
