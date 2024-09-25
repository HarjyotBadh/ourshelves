import React, { useState, useEffect } from 'react';
import { db } from "firebaseConfig";
import { useRouter } from "expo-router";
import { styled, Button, Text, H2, H4, Paragraph, XStack, YStack, SizableText, Image } from 'tamagui'
import {  doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

// Data for profile page to be queried from db
interface ProfilePage {
  aboutMe: string;
  profilePic: string;
  rooms: string;
}

const Header = styled(XStack, {
  height: 60,
  width: "150%",
  backgroundColor: "$accentColor",
  alignItems: 'center',
  paddingHorizontal: '$5',
});

const HeaderButton = styled(Button, {
  width: 50,
  height: 50,
  justifyContent: 'center',
  alignItems: 'center',
});

export default function TabTwoScreen() {
  const [loading, setLoading] = useState(true);
  const [ProfilePage, setProfilePage] = useState<ProfilePage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profileId = " dMxt0UarTkFUIHIa8gJC "; // Placeholder ProfilePage doc id
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        if (profileId) {
          const profilePageDocRef = doc(db, 'Users', profileId);
          const profilePageDoc = await getDoc(profilePageDocRef);
          if (profilePageDoc.exists()) {
            const profilePageData = profilePageDoc.data();
            setProfilePage({
              aboutMe: profilePageData.AboutMe,
              profilePic: profilePageData.ProfilePic,
              rooms: profilePageData.Rooms
            });
          } else {
            throw new Error('User not found');
          }
        } else {
          throw new Error('User not authenticated');
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigating to the "Edit Profile" Page
  const handlePress = () => {
    router.push({
        pathname: "profile-page-edit",
        params: {
            roomId: "zQOz0TCXM8qJSMXigI6k"
        },
    });

};

  return (
    <SafeAreaView>
    <YStack ai="center" gap="$4" px="$10" pt="$5">
        <Header>
          <Text fontSize={18} fontWeight="bold" flex={1} textAlign="center" color="white">
              {"Room name"}
          </Text>  
          <HeaderButton onPress={handlePress}>
          </HeaderButton>      
        </Header>
        <H2>User Profile</H2>
        <Image
            // TODO make this an avatar
            // Eventually make this a set number of predefined icons
            source={{ width: 100, height: 100, uri: ProfilePage?.profilePic }}
            width="51%"
            height="32%"
        />
        <H4>About Me:</H4>
        <Paragraph fos="$5" ta="center">
        {ProfilePage?.aboutMe}
        </Paragraph>

        <XStack gap="$2" px="$2" pt="$5">
        <H4>Number Rooms I'm In:</H4>
        <SizableText theme="alt2" size="$8" fontWeight="800">
          {ProfilePage?.rooms.length}
        </SizableText>
        </XStack>
    </YStack>
    </SafeAreaView>
  )
}
