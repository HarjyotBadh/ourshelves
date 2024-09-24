import React, { useState, useEffect } from 'react';
import { db } from "firebaseConfig";
import { ExternalLink } from '@tamagui/lucide-icons'
import { Link, Tabs } from 'expo-router'
import { Anchor, TextArea, Button, useTheme, H2, H4, Paragraph, XStack, YStack, SizableText, Image } from 'tamagui'
import { ToastControl } from 'app/CurrentToast'
import { ImageBackground, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'functions/profileFunctions';

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
  const [aboutMeText, setAboutMe] = useState('');
  const [docId, setDocId] = useState('');
  const profileId = "dMxt0UarTkFUIHIa8gJC"; // Placeholder ProfilePage doc id

  // Array holding all the profile pics
  let profilePics = [];

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
  }, [profileId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Updating the User's About Me Section
  const aboutMeUpdate = async() => {
    console.log("Submitted Text: ", aboutMeText);
    alert("About Me Updated");
    const result = await updateProfile(aboutMeText)
    console.log("result:" + result)
  }



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <YStack f={1} ai="center" gap="$4" px="$10" pt="$5">
          <H2>User Profile</H2>
          <Image
              // Eventually make this a set number of predefined icons
              source={{ width: 100, height: 100, uri: ProfilePage?.profilePic }}
              width="57%"
              height="21%"
          />

          {/* Button for Changing Profile Picture */}
          <Link href="/profile-icons" asChild>
              <Button mr="$2" bg="$yellow8" color="$yellow12">
                  Select Picture Icon
              </Button>
          </Link>
          
          {/* TODO - Fix to allow editing and saving of "About Me" Info*/}
          <TextArea height={170} width={300} value={aboutMeText} 
            onChangeText={setAboutMe}
            borderWidth={2} placeholder={ProfilePage?.aboutMe}/>
          <Button mr="$2" bg="$yellow8" color="$yellow12" onPress={aboutMeUpdate}>
            Update About Me        
          </Button>

          <XStack gap="$2" px="$2" pt="$5">
          <H4>Number Rooms I'm In:</H4>
          <SizableText theme="alt2" size="$8" fontWeight="800">1</SizableText>
          </XStack>
      </YStack>
    </TouchableWithoutFeedback>
  )
}
