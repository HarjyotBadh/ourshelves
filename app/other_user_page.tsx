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
import { Plus } from "@tamagui/lucide-icons";
import AddUserToRoomDialog from "../components/AddUserToRoomDialog";

// Data for profile page to be queried from db
interface ProfilePage {
  aboutMe: string;
  profilePicture: string;
  rooms: string;
  displayName: string;
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
  const [profilePage, setProfilePage] = useState<ProfilePage | null>(null);
  const [aboutMeText, setAboutMe] = useState("");
  const [profileIcon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const [isAddToRoomDialogOpen, setIsAddToRoomDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (profileId) {
          // Ensure profileId is defined
          const profilePageDocRef = doc(db, "Users", profileId);
          const profilePageDoc = await getDoc(profilePageDocRef);

          if (profilePageDoc.exists()) {
            const profilePageData = profilePageDoc.data();
            setProfilePage({
              aboutMe: profilePageData?.aboutMe || "N/A", // Handle empty aboutMe
              profilePicture: profilePageData?.profilePicture || "",
              rooms: profilePageData?.rooms || [],
              displayName: profilePageData?.displayName || "Unknown User",
            });
            setAboutMe(profilePageData?.aboutMe || "N/A");
            setIcon(profilePageData?.profilePicture || "");
          } else {
            throw new Error("User not found");
          }
        } else {
          throw new Error("Profile ID is missing");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profileId]);

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

  return (
    <>
      <Stack.Screen
        options={{
          title: `${profilePage?.displayName}'s page`,
          headerBackTitle: "Search",
        }}
      />

      <SafeAreaView>
        <YStack ai="center" gap="$4" px="$10" pt="$1">
          <H2>{profilePage?.displayName}</H2>

          <Avatar circular size="$12">
            <Avatar.Image accessibilityLabel="ProfilePic" src={profileIcon} />
            <Avatar.Fallback backgroundColor="$blue10" />
          </Avatar>

          <H4>About Me:</H4>
          <TextArea height={170} width={300} value={aboutMeText} editable={false} borderWidth={2} />

          <XStack gap="$2" px="$2" pt="$5">
            <H4>Number Of Rooms I'm In:</H4>
            <SizableText theme="alt2" size="$8" fontWeight="800">
              {profilePage?.rooms.length}
            </SizableText>
          </XStack>

          <Button
            size="$7"
            circular
            onPress={() => setIsAddToRoomDialogOpen(true)}
            color="$white"
            borderRadius="50%"
            justifyContent="center"
            alignItems="center"
            display="flex"
            icon={<Plus size="$4" />}
          />
          <AddUserToRoomDialog
            open={isAddToRoomDialogOpen}
            onOpenChange={setIsAddToRoomDialogOpen}
            userId={profileId}
            userName={profilePage?.displayName || ""}
          />
        </YStack>
      </SafeAreaView>
    </>
  );
}
