import React, { useState, useEffect } from 'react';
import { db } from "firebaseConfig";
import { ExternalLink } from '@tamagui/lucide-icons'
import { Link, Tabs } from 'expo-router'
import { Anchor, ScrollView, TextArea, Button, Square, Circle, H2, H4, Paragraph, XStack, YStack, SizableText, Image } from 'tamagui'
import { ToastControl } from 'app/CurrentToast'
import { ImageBackground, Pressable } from 'react-native'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from 'firebase/firestore';

// TODO - figure out how to change the header names and (tabs) back button



// Data for profile page to be queried from db
interface ProfilePage {
  aboutMe: string;
  profilePic: string;
}

export default function TabTwoScreen() {
  const [ProfilePage, setProfilePage] = useState<ProfilePage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profileId = "dMxt0UarTkFUIHIa8gJC"; // Placeholder ProfilePage doc id
  const [pictures, setPictures] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  var counter = 0

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);


        const picsCollectionRef = collection(db, 'profile-icons')
        const picSnapshot = await getDocs(picsCollectionRef)
        const fetchedPictures = picSnapshot.docs.map(doc => ({ 
          stringId: doc.id, 
          ...doc.data() 
        }));
        setPictures(fetchedPictures)

        console.log(fetchedPictures.values())

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
        {/* TODO 
        - Ask how to implement this so we go back a page 
        - Ask how to implemement this so we can display x items
        - Ask how to make a function in react native so I can just call it
        */}
        <Pressable onPress={() => alert("this works!")}>
          <Square margin="$4" size={120} backgroundColor="$red9" />
        </Pressable>
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
