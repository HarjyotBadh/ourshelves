import React, { useState, useEffect } from "react";
import { db } from "firebaseConfig";
import { Avatar, Text, YStack } from "tamagui";
import { TouchableOpacity, ScrollView } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { updateProfileIcon } from "project-functions/profileFunctions";
import { useRouter, Stack } from "expo-router";

export default function IconGallery() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const profileId = "profileIcons"; // Placeholder ProfilePage doc id
  const [icons, setIconArray] = useState([]);
  const router = useRouter();

  // Grabbing the data about profile page from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch icon data
        if (profileId) {
          const profileIconDocRef = doc(db, "GlobalSettings", profileId);
          const profileIconDoc = await getDoc(profileIconDocRef);
          if (profileIconDoc.exists()) {
            const profileIconData = profileIconDoc.data();
            setIconArray(profileIconData.icons);
          } else {
            throw new Error("User not found");
          }
        } else {
          throw new Error("User not authenticated");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // For when an icon is selected
  const iconSelect = async (iconUri) => {
    const result = await updateProfileIcon(iconUri);
    if (!result) {
      console.log("ERROR - Update to profile failed");
    } else {
      alert("Profile Icon Updated");
      router.push(`/profile_page?iconId=${iconUri}`);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Profile Icons",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView>
        <YStack ai="center" gap="$4" px="$4" py="$4">
          {icons.map((iconUri, index) => (
            <TouchableOpacity key={index} onPress={() => iconSelect(iconUri)}>
              <Avatar circular size="$15">
                <Avatar.Image accessibilityLabel="ProfilePic" src={iconUri} />
                <Avatar.Fallback backgroundColor="$blue10" />
              </Avatar>
            </TouchableOpacity>
          ))}
        </YStack>
      </ScrollView>
    </>
  );
}
