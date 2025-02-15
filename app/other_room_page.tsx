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
  H3,
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
import { ArrowLeftToLine, DoorOpen, Tag } from "@tamagui/lucide-icons";
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
  const [tagsList, setTagsList] = useState<string[]>([])
  const [userList, setUserList] = useState<
    {
      id: string;
      displayName: string;
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const [showTagsModal, setShowTagsModal] = useState(false); // State for showing tags modal

  const userMap = new Map<
  string,
  {
    id: string;
    displayName: string;
  }
>();
  const currentUserId = auth.currentUser?.uid;


var tags: string[]  = []

const showAlert = (messages) => {
  // Convert the array of strings into a single string separated by commas, newlines, or any other separator
  const messageString = messages.join('\n'); // Joining with newlines for better readability

  Alert.alert(
    roomPage!.roomName + ": Tags" || "Room Tags", // Title of the alert
    messageString, // The stringified message
    [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ]
  );
};

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

          // Fetch tags
          const tagNames: string[] = [];
          for (const ref of roomPageData?.tags) {
            const tagDoc = await getDoc(ref);
            if (tagDoc.exists()) {
              const tagData = tagDoc.data();
              // Assuming tagData has a `name` property
              // @ts-ignore
              tagNames.push(tagData.name || "Unknown Tag");
            }
          }

          // Set tagsList state
          setTagsList(tagNames);

            // Grabbing the users of the room
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
    showAlert(tagsList)
    // if (roomPage) {
    //   setShowTagsModal(true); // Show the modal
    // }
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
    if (currentUserId == userId) {
      router.push(`/(tabs)/profile_page`);
    } else {
      router.push(`/other_user_page?profileId=${userId}`);
    }
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

          <H3>Room Description:</H3>
          <Text style={{
              height:100,
              width: "100%",
              borderWidth: 3, // Adds a border
              borderColor: "gray", // Border color (black in this case)
              borderRadius: 10, // Optional: adds rounded corners
              padding: 10, // Optional: space inside the border
            }}>
                    {description}
          </Text>

          <H3>Users:</H3>
          <ScrollView
            style={{
              height:250,
              width: "100%",
              borderWidth: 3, // Adds a border
              borderColor: "gray", // Border color (black in this case)
              borderRadius: 10, // Optional: adds rounded corners
              padding: 10, // Optional: space inside the border
            }}
          >
            {userList.map((user) => (
              <TouchableOpacity onPress={() => handleUserClick(user.id)}>
                <Text fontSize="$9" textAlign="center" color="$color" marginBottom="$2">
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
