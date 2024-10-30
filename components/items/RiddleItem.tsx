import React, { useState, useEffect } from "react";
import { View, styled, YStack, XStack, Label, Dialog, Button, H2, Input, TextArea, Popover, Adapt, Image, ScrollView, PopoverProps } from "tamagui";
import {Keyboard, Platform, StatusBar, TouchableWithoutFeedback, Alert} from 'react-native'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from '@tamagui/lucide-icons'
import { ColorSelectionDialog } from "../ColorSelectionDialog";
import { auth } from "firebaseConfig";

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

  // Custom properties (remove these)
  const [riddleAnswer, setRiddleAnswer] =  useState('');
  const [inputText, setInputText] = useState("");
  const [solvedUsers, setSolvedUsers] = useState<string[]>(itemData.usersSolved || []); // All the users who solved the riddle
  const profileId = auth.currentUser?.uid; // Current user's profile id
  const riddleImage = itemData.imageUri;

  const [shouldAdapt, setShouldAdapt] = useState(true)

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

  const handleButtonPress = () => {
    //setRiddleAnswer(inputText); // Update display text with input text
    //setInputText(""); // Clear input field
  };

  // Renders item when not active/clicked
  // (default state of item on shelf)
  if (!isActive) {
    return (
      <Image
            source={{ uri: riddleImage }} // Replace with a valid camel image URL or local file path
            width={100}
            height={100}
            resizeMode="contain"
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
          <Dialog.Description>
            Enter a riddle you'd like those in the room to solve:
          </Dialog.Description>

          {/* Button to print grid values */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space="$4">
              {/* Displayed Text at the Top */}
              <ScrollView
              maxHeight={300}
              width={250}
              backgroundColor="#474747"
              padding="$4"
              borderRadius="$4"
              ><H2>{riddleAnswer}</H2></ScrollView>

              {/* Input and Button */}
              <YStack space="$3" width="80%" alignItems="center">
              
              <Button onPress={handleButtonPress} backgroundColor="blue" color="white">
                  Create Riddle
              </Button>
              <Demo
                shouldAdapt={shouldAdapt}
                placement="top"
                Icon={ChevronUp}
                Name="top-popover"
                riddleAnswer={riddleAnswer}
                onRiddleChange={setRiddleAnswer}
              />
              </YStack>
          </YStack>
        </TouchableWithoutFeedback>

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

export function Demo({
  Icon,
  Name,
  shouldAdapt,
  riddleAnswer,
  onRiddleChange,
  ...props
}: PopoverProps & { Icon?: any; Name?: string; shouldAdapt?: boolean; riddleAnswer?: string; onRiddleChange?: ((text:string) => void)}) {
  return (
    <Popover size="$5" allowFlip {...props}>
      <Popover.Trigger asChild>
        <Button icon={Icon} />
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
            <Input f={1} size="$3" id={Name} onChangeText={onRiddleChange} placeholder={riddleAnswer} />
          </XStack>

          <XStack gap="$3">
            <Label size="$3" htmlFor={Name}>
              Change Riddle Answer:
            </Label>
            <Input f={1} size="$3" id={Name} onChangeText={onRiddleChange} placeholder={riddleAnswer}/>
          </XStack>

          <Popover.Close asChild>
            <Button
              size="$3"
              onPress={() => {
                onRiddleChange
              }}
            >
              Submit
            </Button>
          </Popover.Close>
        </YStack>
      </Popover.Content>
    </Popover>
  )
}


export default RiddleItem; // do not remove the export (but change the name of the Item to match the name of the file)
