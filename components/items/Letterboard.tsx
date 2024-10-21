import React, { useState, useEffect } from "react";
import { Dimensions} from "react-native";
import { View, styled, YStack } from "tamagui";
import { ColorSelectionDialog } from "../ColorSelectionDialog";

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

  // Custom properties (remove these)
  const [clickCount, setClickCount] = useState(itemData.clickCount || 0);
  const [color, setColor] = useState(itemData.color || "red");

  // Opens dialog when item is active/clicked
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  const handleColorSelect = (newColor: string) => {
    setClickCount(clickCount + 1);
    setColor(newColor);
    onDataUpdate({ ...itemData, color: newColor, clickCount: clickCount }); // updates item data when called
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose(); // ensure you call onClose when dialog is closed (important, as it will unlock the item)
  };

  // What the letterboard looks like when sitting on the shelf
  const renderLetterBoardPreview = () => (
    <View style={{ padding: PREVIEW_PADDING }}>
      <Canvas style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}>
        <Rect
          x={0}
          y={0}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
          color="white"
        />
        {itemData.paths &&
          itemData.paths.map((pathData: PathData, index: number) => {
            const scaledPath = scalePath(pathData.path, SCALE_FACTOR);
            return (
              <Path
                key={index}
                path={scaledPath}
                color={pathData.color}
                style="stroke"
                strokeWidth={
                  pathData.color === ERASER_COLOR
                    ? ERASER_STROKE_WIDTH * SCALE_FACTOR
                    : (pathData.strokeWidth || NORMAL_STROKE_WIDTH) *
                      SCALE_FACTOR
                }
              />
            );
          })}
      </Canvas>
    </View>
  );

  // Renders item when not active/clicked
  // (default state of item on shelf)
  if (!isActive) {
    return (
      <YStack flex={1}>
      </YStack>
    );
  }

  // Renders item when active/clicked
  // (item is clicked and dialog is open, feel free to change this return)
  return (
    <YStack flex={1}>
      <ColorSelectionDialog
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) {
            handleDialogClose();
          }
        }}
        onColorSelect={handleColorSelect}
      />
    </YStack>
  );
};

// Initializes item data (default values)
LetterBoard.getInitialData = () => ({ color: "red", clickCount: 0 });

export default LetterBoard; // do not remove the export (but change the name of the Item to match the name of the file)
