import React, { useState, useEffect } from "react";
import { View, styled, YStack, XStack, Label, Dialog, Button, H3, H4, Input, Text, Popover, Adapt, Image, ScrollView, PopoverProps } from "tamagui";
import {Keyboard, Platform, StatusBar, TouchableWithoutFeedback, Alert} from 'react-native'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from '@tamagui/lucide-icons'
import { ColorSelectionDialog } from "../ColorSelectionDialog";
import { auth } from "firebaseConfig";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { earnCoins } from "project-functions/shopFunctions";

interface RiddleItemProps {
  itemData: {
    id: string; // unique id of the placed item (do not change)
    itemId: string; // id of the item (do not change)
    name: string; // name of the item (do not change)
    imageUri: string; // picture uri of the item (do not change)
    placedUserId: string; // user who placed the item (do not change)
    [key: string]: any; // any other properties (do not change)

    // add custom properties below ------
    riddleAnswer: string;
    riddlePrompt: string;
    usersSolved: string[];
    // ---------------------------------
  };
  onDataUpdate: (newItemData: Record<string, any>) => void; // updates item data when called (do not change)
  isActive: boolean; // whether item is active/clicked (do not change)
  onClose: () => void; // called when dialog is closed (important, as it will unlock the item) (do not change)
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  }; // various room info (do not change)
}

interface RiddleItemComponent extends React.FC<RiddleItemProps> {
  getInitialData: () => {usersSolved: string[]};
}

// Styling for placeholder item (remove this)
const PlaceholderItemView = styled(View, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
});

const RiddleItem: RiddleItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userListOpen, setUserListOpen] = useState(false);
  const toast = useToastController();

  // Custom properties (remove these)
  const [shouldAdapt, setShouldAdapt] = useState(true)
  const [riddleAnswer, setRiddleAnswer] =  useState(itemData.riddleAnswer || '');
  const [riddlePrompt, setRiddlePrompt] = useState(itemData.riddlePrompt || '');
  const [riddleAttempt, setRiddleAttempt] = useState('');
  const [solvedUsers, setSolvedUsers] = useState<string[]>(itemData.usersSolved || []); // All the users who solved the riddle
  const profileId = auth.currentUser?.uid; // Current user's profile id
  const riddleImage = itemData.imageUri;



  // Opens dialog when item is active/clicked
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose(); // ensure you call onClose when dialog is closed (important, as it will unlock the item)
  };

  const handleRiddleAttempt = () => {
    if (riddleAttempt == riddleAnswer) {
        if (!solvedUsers.includes(profileId)) {
          setSolvedUsers((prevSolvedUsers) => [...prevSolvedUsers, profileId]);
          console.log(solvedUsers)
          console.log(itemData.usersSolved)
          onDataUpdate({...itemData, usersSolved: solvedUsers})
          toast.show("YOU SOLVED THE RIDDLE!\n--AWARDED 150 COINS--", {
            duration: 3000,
          });
          earnCoins(auth.currentUser.uid, 150);
      } else {
        toast.show("You already solved this riddle, no coins rewarded", {
          duration: 3000,
        });
      }
    } 
    else {
      toast.show("Solve Attempt Unsuccessful", {
        duration: 3000,
      });
    }
  };

  // What happens when the user edits a riddle
  const handleRiddleMade = () => {
    setSolvedUsers([]); // Resetting what users solved the riddles since the list was changed
    onDataUpdate({...itemData, riddleAnswer: riddleAnswer, riddlePrompt: riddlePrompt, usersSolved: solvedUsers})
  };
 
  // What the user sees if they are making the riddle
  const riddleMakerPreview = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$1" gap="$4">
            <H4>Craft a Riddle for the Room:</H4>
              {/* Displayed Text at the Top */}
              <ScrollView
              maxHeight={350}
              width={250}
              backgroundColor="#474747"
              padding="$4"
              borderRadius="$4"
              ><H3>{riddlePrompt}</H3></ScrollView>

              {/* Input and Button */}

                <XStack gap="$3">
                  {/*<Demo2
                    shouldAdapt={shouldAdapt}
                    placement="top"
                    Icon={ChevronUp}
                    Name="top-popover"
                  />*/}
                  <Demo1
                    shouldAdapt={shouldAdapt}
                    placement="top"
                    Icon={ChevronUp}
                    Name="top-popover"
                    riddleAnswer={riddleAnswer}
                    setAnsChange={setRiddleAnswer}
                    riddlePrompt={riddlePrompt}
                    setRiddleChange={setRiddlePrompt}
                    handleChange={handleRiddleMade}
                  />
                </XStack>
          </YStack>
      </TouchableWithoutFeedback>
  );

  const riddleSolverPreview = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$1" gap="$3">
            <ToastViewport width={500}/>
            <H4>Solve the Following Riddle:</H4>
              {/* Displayed Text at the Top */}
              <ScrollView
              maxHeight={350}
              width={250}
              backgroundColor="#474747"
              padding="$4"
              borderRadius="$4"
              ><H3>{riddlePrompt}</H3></ScrollView>

              {/* Input and Button */}

              <XStack gap="$2">
                <Label size="$3">
                  Change Riddle Answer:
                </Label>
                <Input f={1} size="$3" onChangeText={setRiddleAttempt}/>
              </XStack>
                <Button
                  onPress={handleRiddleAttempt}
                > Submit Answer </Button>
          </YStack>
      </TouchableWithoutFeedback>
  );

  // Renders item when not active/clicked
  // (default state of item on shelf)
  if (!isActive) {
    return (
      <Image
            source={{ uri: riddleImage }} // Replace with a valid camel image URL or local file path
            width={100}
            height={100}
      />
    );
  }

  // Renders item when active/clicked
  // (item is clicked and dialog is open, feel free to change this return)
  return (
    <Dialog modal open={isActive} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay key="overlay" />
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
          width={300}
          height={650}
        >
          <Dialog.Title>Riddle Item:</Dialog.Title>
          {profileId != itemData.placedUserId ? (riddleMakerPreview()) : (riddleSolverPreview())}


          <Dialog.Close displayWhenAdapted asChild>
            <Button onPress={handleDialogClose} theme="alt1" aria-label="Close">
              Exit
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

// Initializes item data (default values)
RiddleItem.getInitialData = () => ({ usersSolved: [] });

export function Demo1({
  Icon,
  Name,
  shouldAdapt,
  riddleAnswer,
  setAnsChange,
  riddlePrompt,
  setRiddleChange,
  handleChange,
  ...props
}: PopoverProps & { Icon?: any; Name?: string; shouldAdapt?: boolean; riddleAnswer?: string; riddlePrompt?: string;
  setRiddleChange?: ((text:string) => void); 
  setAnsChange?: ((text:string) => void)
  handleChange?: (() => void)
}) {
  return (
    <Popover size="$5" allowFlip {...props}>
      <Popover.Trigger asChild>
        <Button> Edit Riddle </Button>
      </Popover.Trigger>

      {shouldAdapt && (
        <Adapt when="sm" platform="touch">
          <Popover.Sheet modal dismissOnSnapToBottom>
            <Popover.Sheet.Frame padding="$4">
              <Adapt.Contents />
            </Popover.Sheet.Frame>
            <Popover.Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Popover.Sheet>
        </Adapt>
      )}

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

        <YStack gap="$3">
          <XStack gap="$3">
            <Label size="$3" htmlFor={Name}>
              Change Riddle:
            </Label>
            {/* <TextArea 
            height={170} 
            width={300} 
            value={riddleAnswer} 
            onChangeText={onRiddleChange}
            borderWidth={2}/> */}
            <Input f={1} size="$3" id={Name} onChangeText={setRiddleChange} placeholder={riddlePrompt} />
          </XStack>

          <XStack gap="$3">
            <Label size="$3" htmlFor={Name}>
              Change Riddle Answer:
            </Label>
            <Input f={1} size="$3" id={Name} onChangeText={setAnsChange} placeholder={riddleAnswer}/>
          </XStack>

          <Popover.Close asChild>
            <Button
              size="$3"
              onPress={handleChange}
            >
              Submit New Changes
            </Button>
          </Popover.Close>
        </YStack>
      </Popover.Content>
    </Popover>
  )
}

export function Demo2({
  Icon,
  Name,
  shouldAdapt,
  Users,
  ...props
}: PopoverProps & { Icon?: any; Name?: string; shouldAdapt?: boolean; Users?: string[]}) {
  return (
    <Popover size="$5" allowFlip {...props}>
      <Popover.Trigger asChild>
        <Button> User Progress </Button>
      </Popover.Trigger>

      {shouldAdapt && (
        <Adapt when="sm" platform="touch">
          <Popover.Sheet modal dismissOnSnapToBottom>
            <Popover.Sheet.Frame padding="$4">
              <Adapt.Contents />
            </Popover.Sheet.Frame>
            <Popover.Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Popover.Sheet>
        </Adapt>
      )}

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

        <YStack gap="$3">
         
        <ScrollView
          flex={1}
          backgroundColor="white" // You can set a background color here
          padding="$4"
          >
          <YStack space="$2"> {/* Adds spacing between user items */}
            {Users?.map((user, index) => (
              <Text key={index} fontSize="$5" color="black"> {/* Customize font size and color */}
                {user}
              </Text>
            ))}
          </YStack>
        </ScrollView>

          <Popover.Close asChild>
            <Button
              size="$3"
              onPress={() => {

              }}
            >
              Submit New Changes
            </Button>
          </Popover.Close>
        </YStack>
      </Popover.Content>
    </Popover>
  )
}

export default RiddleItem; // do not remove the export (but change the name of the Item to match the name of the file)
