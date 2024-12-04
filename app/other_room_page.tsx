import React, { useState, useEffect } from "react";
import { db } from "firebaseConfig";
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
} from "tamagui";
import { doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Tag } from "@tamagui/lucide-icons";
import AddUserToRoomDialog from "../components/AddUserToRoomDialog";
import TagsModal from './TagsModal'; // Import the TagsModal

// Data for profile page to be queried from db
interface RoomPage {
    roomName: string;
    description: string;
    tags: string[];
    users: string[];
}

const LoadingContainer = styled(YStack, {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "BACKGROUND_COLOR",
  padding: 20,
});

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [roomPage, setRoomPage] = useState<RoomPage | null>(null);
  const [description, setDescription] = useState("");
  const [profileIcon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const [isAddToRoomDialogOpen, setIsAddToRoomDialogOpen] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false); // State for showing tags modal

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
                tags: roomPageData.tags || [],
            });
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
          <TextArea height={170} width={300} value={description} editable={false} borderWidth={2} />


          <XStack gap={10}>
            <Button
              size="$7"
              circular
              onPress={() => setIsAddToRoomDialogOpen(true)}
              color="$white"
              justifyContent="center"
              alignItems="center"
              display="flex"
              icon={<Plus size="$4" />}
            />

            <Button
              size="$7"
              circular
              onPress={viewTags} // Show tags modal
              color="$white"
              justifyContent="center"
              alignItems="center"
              display="flex"
              icon={<Tag size="$4" />}
            />
          </XStack>

        </YStack>
      </SafeAreaView>

      {/* Tags Modal */}
      <TagsModal
        visible={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        tags={roomPage?.tags || []}
      />
    </>
  );
}
