import React, { useState, useEffect } from "react";
import { Dimensions} from "react-native";
import { View, styled, YStack, XStack, Input, Button, Circle, Image } from "tamagui";
import { ColorSelectionDialog } from "../ColorSelectionDialog";
import { Shape } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");
const LETTERBOARD_WIDTH = screenWidth - 40;
const LETTERBOARD_HEIGHT = LETTERBOARD_WIDTH * 0.6;

const PREVIEW_WIDTH = 120;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * (LETTERBOARD_HEIGHT / LETTERBOARD_WIDTH);
const SCALE_FACTOR = PREVIEW_WIDTH / LETTERBOARD_WIDTH;
const PREVIEW_PADDING = 5; // Adding padding to prevent overlap

interface LetterBoardProps {
  itemData: {
    id: string; // unique id of the placed item (do not change)
    itemId: string; // id of the item (do not change)
    name: string; // name of the item (do not change)
    imageUri: string; // picture uri of the item (do not change)
    placedUserId: string; // user who placed the item (do not change)
    [key: string]: any; // any other properties (do not change)

    // add custom properties below ------
    clickCount?: number;
    color: string;

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

interface LetterBoardComponent extends React.FC<LetterBoardProps> {
  getInitialData: () => {};
}

const LetterBoard: LetterBoardComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Grid of letters to be used for letterboard
  const [gridValues, setGridValues] = useState(Array(4).fill('').map(() => Array(6).fill('')))


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

  // Handler for input changes
  const handleInputChange = (text, rowIndex, colIndex) => {
    if (text.length > 1) return
    const newGridValues = [...gridValues]
    newGridValues[rowIndex][colIndex] = text
    setGridValues(newGridValues)
  }

  const handlePress = () => {
  }

  // What the letterboard looks like when sitting on the shelf
  const renderLetterBoardPreview = () => (
    <Image
      source={{ uri: itemData.imageUri ? itemData.imageUri : itemData.imageUri }}
      width = { 100 }
      height = { 100 }
      objectFit="contain"
    />
  );

  // Renders item when not active/clicked
  // (default state of item on shelf)
  if (!isActive) {
    return (
      <YStack flex={1}>
        {renderLetterBoardPreview()}
      </YStack>
    );
  }

  // Renders item when active/clicked
  // (item is clicked and dialog is open, feel free to change this return)
  return (
    <YStack padding={20} space="$2">
      {gridValues.map((row, rowIndex) => (
        <XStack key={rowIndex} space="$2">
          {row.map((value, colIndex) => (
            <Input
              key={`${rowIndex}-${colIndex}`}
              value={value}
              onChangeText={(text) => handleInputChange(text, rowIndex, colIndex)}
              maxLength={1} // Ensures only one letter can be entered
              width={50}
              height={50}
              textAlign="center"
              fontSize={20}
              backgroundColor="#000" // Set background to black
              color="#fff" // Set text color to white
              borderColor="#fff" // Optional: white border to make the boxes stand out
              borderWidth={1}
              borderRadius="$4"
            />
          ))}
        </XStack>
      ))}
    </YStack>
    );
};

// Initializes item data (default values)
LetterBoard.getInitialData = () => ({ color: "red", clickCount: 0 });

export default LetterBoard; // do not remove the export (but change the name of the Item to match the name of the file)
