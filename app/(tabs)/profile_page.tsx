import React, { useState, useEffect } from 'react';
import { db } from "firebaseConfig";
import { ExternalLink } from '@tamagui/lucide-icons'
import { Anchor, H2, H4, Paragraph, XStack, YStack, SizableText, Image } from 'tamagui'
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Data for profile page to be queried from db
interface ProfilePage {
  aboutMe: string;
  profilePic: string;
}

export default function TabTwoScreen() {
  const [loading, setLoading] = useState(true);
  const [ProfilePage, setProfilePage] = useState<ProfilePage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState(0);
  const profileId = "dMxt0UarTkFUIHIa8gJC"; // Placeholder ProfilePage doc id


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        if (profileId) {
          const profilePageDocRef = doc(db, 'ProfilePage', profileId);
          const profilePageDoc = await getDoc(profilePageDocRef);
          if (profilePageDoc.exists()) {
            const profilePageData = profilePageDoc.data();
            setProfilePage({
              aboutMe: profilePageData.AboutMe,
              profilePic: profilePageData.ProfilePic
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
  }, [profileId, ProfilePage]);

  return (
    <YStack f={1} ai="center" gap="$4" px="$10" pt="$5">
        <H2>User Profile</H2>
        <Image
            // Eventually make this a set number of predefined icons
            source={{ width: 100, height: 100, uri: ProfilePage?.profilePic }}
            width="53%"
            height="22%"
        />

        <H4>About Me:</H4>
        <Paragraph fos="$5" ta="center">
        {ProfilePage?.aboutMe}
        </Paragraph>

        <XStack gap="$2" px="$2" pt="$5">
        <H4>Number Rooms I'm In:</H4>
        <SizableText theme="alt2" size="$8" fontWeight="800">1</SizableText>
        </XStack>
    </YStack>
  )
}
