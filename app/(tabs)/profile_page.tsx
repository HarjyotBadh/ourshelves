import React, { useState, useEffect } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import { db } from "firebaseConfig";
import { Link, useRouter } from "expo-router";
import { Avatar, TextArea, styled, Button, Text, H2, H4, Paragraph, XStack, YStack, SizableText, Image } from 'tamagui'
import {  doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateProfileAbtMe } from 'functions/profileFunctions';
import { Wrench } from '@tamagui/lucide-icons'


// Data for profile page to be queried from db
interface ProfilePage {
  aboutMe: string;
  profilePic: string;
  rooms: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profilePage, setProfilePage] = useState<ProfilePage | null>(null);
  const [aboutMeText, setAboutMe] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false); // Use state for edit mode
  const profileId = " dMxt0UarTkFUIHIa8gJC "; // Placeholder ProfilePage doc id

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
            
            // Ensuring the about me text isn't empty
            setAboutMe(profilePageData.AboutMe);
            if (aboutMeText.length == 0 || aboutMeText == "") {
              setAboutMe("N/A")
            }

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

  // The Loading Page
  if (loading) {
    return <Text>Loading...</Text>;
  }

  // Updating the User's About Me Section
  const aboutMeUpdate = async() => {
    // Ensuring the About Me section has a limit and there's no newline characters
    if (aboutMeText.length < 100 && !(/\n/.test(aboutMeText))) { 

      // Ensuring the about me text isn't empty
      if (aboutMeText.length == 0 || aboutMeText == "") {
        setAboutMe("N/A")
      }

      const result = await updateProfileAbtMe(aboutMeText)
      if (!result) {
        console.log("ERROR - Update to profile failed") 
      }
      alert("About Me Updated");
    } else {
      alert("ERROR - Update cannot exceeded 100 characters or contain a newline")
    }
  }

  return (
    <SafeAreaView>
    {!isEditMode ? 
    (
    <YStack ai="center" gap="$4" px="$10" pt="$1">
        <H2>User Profile</H2>
        
        <Avatar circular size="$12">
          <Avatar.Image
            accessibilityLabel="ProfilePic"
            src={profilePage?.profilePic}/>
          <Avatar.Fallback backgroundColor="$blue10" />
        </Avatar>

        <H4>About Me:</H4>
        <TextArea height={170} width={300} value={aboutMeText} 
            editable={false}
            borderWidth={2}/>

        <XStack gap="$2" px="$2" pt="$5">
        <H4>Number Of Rooms I'm In:</H4>
        <SizableText theme="alt2" size="$8" fontWeight="800">
          {profilePage?.rooms.length}
        </SizableText>
        </XStack>

        <Button
          size="$7" // Adjust size as needed
          circular
          onPress={() => {
            setIsEditMode(true);
          }}
          color="$white"
          borderRadius="50%" // Ensure the button is circular
          justifyContent="center"
          alignItems="center"
          display="flex" // Use flex to ensure alignment works
          icon={<Wrench size="$4" />}>
        </Button>
    </YStack> ) : 
    (  
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <YStack ai="center" gap="$4" px="$10" pt="$1">
          <H2>User Profile</H2>
            <Avatar circular size="$12">
            <Avatar.Image
              accessibilityLabel="ProfilePic"
              src={profilePage?.profilePic}/>
            <Avatar.Fallback backgroundColor="$blue10" />
          </Avatar>

          {/* Button for Changing Profile Picture */}
          <Link href="/profile-icons" asChild>
              <Button mr="$2" bg="$yellow8" color="$yellow12">
                  Select Picture Icon
              </Button>
          </Link>
          
          <TextArea height={170} width={300} value={aboutMeText} 
            onChangeText={setAboutMe}
            borderWidth={2}/>
          <Button mr="$2" bg="$yellow8" color="$yellow12" onPress={aboutMeUpdate}>
            Update About Me        
          </Button>

          <Button
            size="$7" // Adjust size as needed
            circular
            onPress={() => {
              setIsEditMode(false);
            }}
            bg="$yellow8"
            color="$white"
            borderRadius="50%" // Ensure the button is circular
            justifyContent="center"
            alignItems="center"
            display="flex" // Use flex to ensure alignment works
            icon={<Wrench size="$4" />}>
          </Button>

      </YStack>
    </TouchableWithoutFeedback>
    )}
    </SafeAreaView>
  )
}
