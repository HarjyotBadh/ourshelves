import React, { useState, useEffect } from "react";
import { Modal, View, Dimensions } from "react-native";
import { YStack, XStack, Input, Button, Text } from "tamagui";
import { earnCoins } from "project-functions/shopFunctions";
import { auth } from "firebaseConfig";
import { useToastController } from "@tamagui/toast";

const NUM_ROWS = 4;
const NUM_COLS = 4;

interface LetterBoardProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
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
  getInitialData: () => { gridData: string[]; numColumns: number };
}

const PreviewCell = ({ value }: { value: string }) => (
  <View style={{
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#8B4513',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <Text 
      fontSize={10}
      fontWeight="bold"
      color="#8B4513"
    >
      {value}
    </Text>
  </View>
);

const PreviewGrid = ({ gridValues }: { gridValues: string[][] }) => (
  <YStack 
    padding={2}
    backgroundColor="#DEB887" 
    borderRadius={4}
    gap={2}
  >
    {gridValues.map((row, rowIndex) => (
      <XStack key={rowIndex} gap={2}>
        {row.map((value, colIndex) => (
          <PreviewCell 
            key={`${rowIndex}-${colIndex}`}
            value={value}
          />
        ))}
      </XStack>
    ))}
  </YStack>
);

const ActiveGrid = ({ 
  gridValues,
  onInputChange,
}: { 
  gridValues: string[][],
  onInputChange: (text: string, rowIndex: number, colIndex: number) => void,
}) => (
  <YStack 
    padding="$4"
    backgroundColor="#DEB887" 
    borderRadius={8}
    gap="$2"
  >
    {gridValues.map((row, rowIndex) => (
      <XStack key={rowIndex} gap="$2">
        {row.map((value, colIndex) => (
          <Input
            key={`${rowIndex}-${colIndex}`}
            value={value}
            onChangeText={(text) => onInputChange(text, rowIndex, colIndex)}
            width={45}
            height={45}
            textAlign="center"
            fontSize={20}
            fontWeight="bold"
            backgroundColor="white"
            color="#8B4513"
            borderWidth={1}
            borderColor="#8B4513"
            borderRadius={4}
            padding={0}
          />
        ))}
      </XStack>
    ))}
  </YStack>
);

const LetterBoard: LetterBoardComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [gridValues, setGridValues] = useState<string[][]>(
    Array(NUM_ROWS).fill("").map(() => Array(NUM_COLS).fill(""))
  );
  const [boardChanged, setBoardChanged] = useState(false);
  const toast = useToastController();
  const { width: screenWidth } = Dimensions.get("window");

  useEffect(() => {
    if (itemData.gridData && Array.isArray(itemData.gridData)) {
      const array2D: string[][] = []; 
      for (let i = 0; i < NUM_ROWS; i++) {
        array2D.push(itemData.gridData.slice(i * NUM_COLS, (i + 1) * NUM_COLS));
      }
      setGridValues(array2D);
    }
  }, [itemData.gridData]);

  const handleModalClose = async () => {
    try {
      if (boardChanged) {
        await earnCoins(auth.currentUser?.uid, 10);
        toast.show("You earned 10 coins for your letterboard message!", {
          duration: 3000,
        });
        setBoardChanged(false);
      }
      
      const flatArray = gridValues.flat();
      onDataUpdate({
        ...itemData,
        gridData: flatArray,
        numColumns: NUM_COLS
      });
      onClose();
    } catch (error) {
      console.error("Error closing letterboard:", error);
    }
  };

  const handleInputChange = (text: string, rowIndex: number, colIndex: number) => {
    if (text.length > 1) return;
    
    const newGridValues = gridValues.map((row, i) =>
      row.map((cell, j) => (i === rowIndex && j === colIndex ? text.toUpperCase() : cell))
    );
    
    setGridValues(newGridValues);
    setBoardChanged(true);
  };

  if (!isActive) {
    return (
      <View 
        style={{ 
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PreviewGrid gridValues={gridValues} />
      </View>
    );
  }

  return (
    <Modal visible={isActive} transparent animationType="fade" onRequestClose={handleModalClose}>
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "rgba(0,0,0,0.5)" 
      }}>
        <View style={{
          width: Math.min(screenWidth * 0.9, 400),
          backgroundColor: "#DEB887",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: "hidden",
          padding: 20,
        }}>
          <Text 
            fontSize={24}
            fontWeight="bold"
            textAlign="center"
            marginBottom="$4"
            color="#8B4513"
          >
            Letterboard
          </Text>

          <YStack alignItems="center" justifyContent="center">
            <ActiveGrid 
              gridValues={gridValues}
              onInputChange={handleInputChange}
            />
          </YStack>

          <Button
            onPress={handleModalClose}
            backgroundColor="$red10"
            color="white"
            marginTop="$4"
            marginBottom="$4"
          >
            Close
          </Button>

          <View style={{
            position: "absolute",
            bottom: 0,
            left: -20,
            right: -20,
            height: 20,
            backgroundColor: "#8B4513"
          }} />
        </View>
      </View>
    </Modal>
  );
};

LetterBoard.getInitialData = () => ({ 
  gridData: Array(NUM_ROWS * NUM_COLS).fill(""), 
  numColumns: NUM_COLS 
});

export default LetterBoard;