import React, { useState, useEffect } from 'react';
import { db } from "firebaseConfig";
import { ExternalLink } from '@tamagui/lucide-icons'
import { Link, Tabs } from 'expo-router'
import { Anchor, ScrollView, Text, XStack, YStack, SizableText, Image } from 'tamagui'
import { ToastControl } from 'app/CurrentToast'
import { FlatList, ImageBackground, Pressable } from 'react-native'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

// TODO - figure out how to change the header names and (tabs) back button

// Data for profile page to be queried from db
interface ProfileIcons {
  profileIcons: string[];
}

export default function TabTwoScreen() {
  const [loading, setLoading] = useState(true);
  const [ProfileIcons, setProfileIcons] = useState<ProfileIcons | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profileId = "UserIcons"; // Placeholder ProfilePage doc id


  // Greabbing the data about profile page from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch icon data
        if (profileId) {
          const profileIconDocRef = doc(db, 'ProfileIcons', profileId);
          const profileIconDoc = await getDoc(profileIconDocRef);
          if (profileIconDoc.exists()) {
            const profileIconData = profileIconDoc.data();
            setProfileIcons({
              profileIcons: profileIconData.Icons
            });
          } else {
            throw new Error('User not found');
          }
          console.log(ProfileIcons?.profileIcons[0])
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
    
  // For when an icon is selected
  const iconSelect = () => {

  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    
    <SafeAreaView>
      <Pressable onPress={() => alert("this works!")}>
          <Image
              // Eventually make this a set number of predefined icons
              source={{ width: 100, height: 100, uri: ProfileIcons?.profileIcons[0] }}
              width="53%"
              height="22%"
          />
        </Pressable>
      <ScrollView
      maxHeight={700}
      width="100%"
      backgroundColor="$background"
      padding="$"
      borderRadius="$4"
    >
      <XStack flexWrap="wrap" alignItems="center" justifyContent="center">
        {/* TODO 
        - Ask how to implement this so we go back a page 
        */}
        <Pressable onPress={() => alert("this works!")}>
          <Image
              // Eventually make this a set number of predefined icons
              source={{ width: 100, height: 100, uri: ProfileIcons?.profileIcons[0] }}
              width="53%"
              height="22%"
          />
        </Pressable>
        {/*<Circle margin="$4" size={120} backgroundColor="$orange9" />
        <Square margin="$4" size={120} backgroundColor="$yellow9" />
        <Circle margin="$4" size={120} backgroundColor="$green9" />
        <Square margin="$4" size={120} backgroundColor="$blue9" />
        <Circle margin="$4" size={120} backgroundColor="$purple9" />
        <Square margin="$4" size={120} backgroundColor="$pink9" />
        <Circle margin="$4" size={120} backgroundColor="$red9" />*/}
      </XStack>
    </ScrollView>
  </SafeAreaView>
  )
}
