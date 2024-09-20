import React, { useState, useEffect } from 'react';
import { db } from "firebaseConfig";
import { ExternalLink } from '@tamagui/lucide-icons'
import { Link, Tabs } from 'expo-router'
import { Anchor, ScrollView, TextArea, Button, Square, Circle, H2, H4, Paragraph, XStack, YStack, SizableText, Image } from 'tamagui'
import { ToastControl } from 'app/CurrentToast'
import { ImageBackground } from 'react-native'
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

// TODO - figure out how to change the header names and (tabs) back button


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

        // Fetch items from Firestore
        const itemsCollectionRef = collection(db, 'Items');
        const itemsSnapshot = await getDocs(itemsCollectionRef);

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
  }, [profileId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView>
      <ScrollView
      maxHeight={700}
      width="100%"
      backgroundColor="$background"
      padding="$"
      borderRadius="$4"
    >
      <XStack flexWrap="wrap" alignItems="center" justifyContent="center">
        <Square margin="$4" size={120} backgroundColor="$red9" />
        <Circle margin="$4" size={120} backgroundColor="$orange9" />
        <Square margin="$4" size={120} backgroundColor="$yellow9" />
        <Circle margin="$4" size={120} backgroundColor="$green9" />
        <Square margin="$4" size={120} backgroundColor="$blue9" />
        <Circle margin="$4" size={120} backgroundColor="$purple9" />
        <Square margin="$4" size={120} backgroundColor="$pink9" />
        <Circle margin="$4" size={120} backgroundColor="$red9" />
      </XStack>
    </ScrollView>
  </SafeAreaView>
  )
}
