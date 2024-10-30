import React, { useState, useEffect } from "react";
import { View, Dialog, YStack, XStack, Input, Button } from "tamagui";
import { earnCoins } from "project-functions/shopFunctions";
import { auth, db } from "firebaseConfig";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { set } from "date-fns";


interface LetterBoardProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    [key: string]: any;
    gridData: string[];
    numColumns: number;
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  };
}

interface LetterBoardComponent extends React.FC<LetterBoardProps> {
  getInitialData: () => {gridData: string[]};
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
  const [gridValues, setGridValues] = useState(Array(8).fill('').map(() => Array(3).fill('')))
  const [storedGridVals, setStoredGrid] = useState<string[]>([]);
  const [boardChanged, setBoardChanged] = useState(false);
  const [boardInit, setBoardinit] = useState(true); // TODO this might need to be changed to make it truly asynchronous
  const toast = useToastController();

  // Opens dialog when item is active/clicked
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }

    // TODO 
    if (itemData.gridData !== undefined && boardInit) {
      convertTo2DArray(itemData.gridData, itemData.numColumns);
      setBoardinit(false);
    }
  }, [isActive]);


  const handleDialogClose = () => {
    setDialogOpen(false);
    onDataUpdate({...itemData, gridData: storedGridVals, numColumns: gridValues[0].length})
    if (boardChanged) {
      earnCoins(auth.currentUser.uid, 10);
      toast.show("You earned 10 coins for interacting with the letterboard!", {
        duration: 3000,
      });
      setBoardChanged(false)
    }
    onClose(); // ensure you call onClose when dialog is closed (important, as it will unlock the item)
  };

   // Convert 2D array to 1D array
   const convertTo1DArray = () => {
    const flatArray = gridValues.flat(); // Flatten the 2D array
    setStoredGrid(flatArray);
  };

  // Convert 1D array back to 2D array (with given number of columns)
  const convertTo2DArray = (array1D: string[], numColumns: number) => {
    const array2D: string[][] = [];
    for (let i = 0; i < array1D.length; i += numColumns) {
      array2D.push(array1D.slice(i, i + numColumns)); // Slice the array into chunks
    }
    setGridValues(array2D);
  };

  // Handler for input changes
  const handleInputChange = (text, rowIndex, colIndex) => {
    if (text.length > 1) return
    const newGridValues = [...gridValues]
    newGridValues[rowIndex][colIndex] = text
    setGridValues(newGridValues)
    convertTo1DArray()
    renderLetterBoardPreview()
    setBoardChanged(true) // Checking for board interaction so we could reward coins
  }

  // What the letterboard looks like when sitting on the shelf
  const renderLetterBoardPreview = () => (
    <YStack flex={1} alignItems="center" justifyContent="center" padding={5} backgroundColor="#ddd">
      <YStack 
        position="absolute" 
        backgroundColor="black" 
        height={120} 
        width={120}
        borderRadius="$1" 
        alignItems="center"
        justifyContent="center"
      />
      <YStack padding={5} space="$1">
        {gridValues.map((row, rowIndex) => (
          <XStack key={rowIndex} space="$1">
            {row.map((value, colIndex) => (
              <Input
                key={`${rowIndex}-${colIndex}`}
                editable={false}
                value={value}
                onChangeText={(text) => handleInputChange(text, rowIndex, colIndex)}
                maxLength={1}
                width={38} 
                height={12}
                textAlign="center"
                fontSize={10}
                fontWeight="bold"
                backgroundColor="#000"
                color="#fff"
                borderWidth={0.25}
                borderRadius="$1"
              />
            ))}
          </XStack>
        ))}
      </YStack>
    </YStack>
  );

  // Renders item when not active/clicked
  if (!isActive) {
    return (
      <YStack flex={1}>
        {renderLetterBoardPreview()}
      </YStack>
    );
  }

  // Renders item when active/clicked
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
          <Dialog.Title>Letterboard</Dialog.Title>
          <Dialog.Description>
            Edit what letters you want displayed:
          </Dialog.Description>

          {/* Grid of text inputs */}
          <YStack flex={1} alignItems="center" justifyContent="center" padding={2} backgroundColor="#ddd">
            <YStack 
              position="absolute" 
              backgroundColor="black" 
              height={460}
              width={200}
              borderRadius="$4"
              alignItems="center"
              justifyContent="center"
            />
            <YStack padding={2} gap="$2">
              {gridValues.map((row, rowIndex) => (
                <XStack key={rowIndex} gap="$2">
                  {row.map((value, colIndex) => (
                    <Input
                      key={`${rowIndex}-${colIndex}`}
                      value={value}
                      onChangeText={(text) => handleInputChange(text, rowIndex, colIndex)}
                      maxLength={1}
                      width={50}
                      height={50}
                      textAlign="center"
                      fontSize={25}
                      fontWeight="bold"
                      backgroundColor="#000"
                      color="#fff"
                      borderWidth={1}
                      borderRadius="$2"
                    />
                  ))}
                </XStack>
              ))}
            </YStack>
          </YStack>

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
LetterBoard.getInitialData = () => ({ gridData: [] });

export default LetterBoard;
