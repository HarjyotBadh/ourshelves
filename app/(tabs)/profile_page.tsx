import React, { useState, useEffect } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import { db } from "firebaseConfig";
import {Link, useLocalSearchParams, Stack} from "expo-router";
import { Avatar, styled, TextArea, Button, Text, H2, H4, Spinner, XStack, YStack, SizableText, Dialog } from 'tamagui'
import {  doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateProfileAbtMe } from 'functions/profileFunctions';
import { Wrench, LogOut } from '@tamagui/lucide-icons'
import { auth } from "firebaseConfig";
import { signOut } from "firebase/auth";

// Data for profile page to be queried from db
interface ProfilePage {
  aboutMe: string;
  profilePic: string;
  rooms: string;
  displayName: string
}

const LoadingContainer = styled(YStack, {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'BACKGROUND_COLOR',
  padding: 20,
});

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profilePage, setProfilePage] = useState<ProfilePage | null>(null);
  const [aboutMeText, setAboutMe] = useState('');
  const [profileIcon, setIcon] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false); // Use state for edit mode
  const profileId = auth.currentUser?.uid; // Placeholder ProfilePage doc id
  const { iconId } = useLocalSearchParams(); // Getting Local Query Data
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);


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
              aboutMe: profilePageData.aboutMe,
              profilePic: profilePageData.profilePic,
              rooms: profilePageData.rooms,
              displayName: profilePageData.displayName
            });
            
            // Ensuring the about me text isn't empty
            if (profilePageData.aboutMe.length == 0 || profilePageData.aboutMe == "") {
              setAboutMe("N/A");
            } else {
              setAboutMe(profilePageData.aboutMe);
            }
            setIcon(profilePageData.profilePic)
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
  }, [iconId]);

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

  // Updating the User's About Me Section
  const aboutMeUpdate = async() => {
    // Ensuring the About Me section has a limit and there's no newline characters
    if (aboutMeText.length < 100 && !(/\n/.test(aboutMeText))) { 

      var result;

      // Ensuring the about me text isn't empty
      if (aboutMeText.length == 0 || aboutMeText == "") {
        result =  await updateProfileAbtMe("N/A")
      } else {
        result =  await updateProfileAbtMe(aboutMeText)
      }
      if (!result) {
        console.log("ERROR - Update to profile failed") 
      } else {
        alert("About Me Updated");
      }
    } else {
      alert("ERROR - Update cannot exceeded 100 characters or contain a newline")
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);

    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const HeaderRight = () => (
      <Button
          size="$4"
          icon={<LogOut size={18} />}
          onPress={() => setShowSignOutDialog(true)}
          theme="red"
          marginRight={10}
          animation="bouncy"
          pressStyle={{ scale: 0.9 }}
      >
        Sign Out
      </Button>
  );


  return (
  <>
      <Stack.Screen
          options={{
            headerRight: () => <HeaderRight />,
            title: "Profile",
          }}
      />

    <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
      <Dialog.Portal>
        <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
            bordered
            elevate
            key="content"
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap="$4"
        >
          <Dialog.Title>Confirm Sign Out</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to sign out?
          </Dialog.Description>
          <XStack gap="$3" justifyContent="flex-end">
            <Dialog.Close asChild>
              <Button theme="alt1">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button theme="red" onPress={handleSignOut}>Sign Out</Button>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>

    <SafeAreaView>
    {!isEditMode ? 
    (
    <YStack ai="center" gap="$4" px="$10" pt="$1">
        <H2>{profilePage?.displayName}</H2>
        
        <Avatar circular size="$12">
          <Avatar.Image
            accessibilityLabel="ProfilePic"
            src={profileIcon}/>
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
          borderRadius="50%"
          justifyContent="center"
          alignItems="center"
          display="flex"
          icon={<Wrench size="$4" />}>
        </Button>
    </YStack> ) : 
    (  
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <YStack ai="center" gap="$4" px="$10" pt="$1">
          <H2>{profilePage?.displayName}</H2>
            <Avatar circular size="$12">
            <Avatar.Image
              accessibilityLabel="ProfilePic"
              src={profileIcon}/>
            <Avatar.Fallback backgroundColor="$blue10" />
          </Avatar>

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
            size="$7"
            circular
            onPress={() => {
              setIsEditMode(false);
            }}
            bg="$yellow8"
            color="$white"
            borderRadius="50%"
            justifyContent="center"
            alignItems="center"
            display="flex"
            icon={<Wrench size="$4" />}>
          </Button>

      </YStack>
    </TouchableWithoutFeedback>
    )}
    </SafeAreaView>
  </>
  )
}
