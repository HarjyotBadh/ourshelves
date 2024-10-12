import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, styled, YStack, XStack, Button, Sheet, Image } from "tamagui";
import { Canvas, Path, useCanvasRef, Rect } from "@shopify/react-native-skia";
import { PanResponder, GestureResponderEvent, Dimensions, Modal } from "react-native";
import { ref, onValue, push, set, remove, off, onDisconnect } from "firebase/database";
import { rtdb, auth, db } from "firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

interface PathData {
  path: string;
  color: string;
}

interface WhiteboardItemProps {
  itemData: {
    name: string;
    imageUri: string;
    id: string;
    paths: PathData[];
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: {
      id: string;
      displayName: string;
      profilePicture?: string;
      isAdmin: boolean;
    }[];
    description: string;
  };
}

interface WhiteboardItemComponent extends React.FC<WhiteboardItemProps> {
  getInitialData: () => { paths: PathData[] };
}

const WhiteboardView = styled(View, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
});

const ColorButton = styled(Button, {
  width: 30,
  height: 30,
  borderRadius: 15,
  marginHorizontal: 5,
});

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const WHITEBOARD_WIDTH = screenWidth - 40;
const WHITEBOARD_HEIGHT = WHITEBOARD_WIDTH * 0.6;

const colors = ['black', 'red', 'blue', 'green', 'purple', 'yellow'];

const WhiteboardItem: WhiteboardItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [paths, setPaths] = useState<PathData[]>(itemData.paths || []);
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const canvasRef = useCanvasRef();
  const isDrawing = useRef(false);
  const currentPathRef = useRef("");
  const whiteboardRef = useRef(ref(rtdb, `whiteboards/${itemData.id}`));
  const disconnectRef = useRef<ReturnType<typeof onDisconnect>>();

  useEffect(() => {
    if (isActive) {
      const initializeWhiteboard = async () => {
        try {
          // Initialize the Realtime Database with the paths from itemData
          await set(whiteboardRef.current, itemData.paths || []);

          // Set up listener for Realtime Database updates
          const unsubscribe = onValue(whiteboardRef.current, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setPaths(Object.values(data));
            } else {
              setPaths([]);
            }
          });

          // Set up disconnect handler
          disconnectRef.current = onDisconnect(whiteboardRef.current);
          disconnectRef.current.remove();

          return () => {
            unsubscribe();
            off(whiteboardRef.current);
            if (disconnectRef.current) {
              disconnectRef.current.cancel();
            }
          };
        } catch (error) {
          console.error("Error initializing whiteboard:", error);
        }
      };

      initializeWhiteboard();
    }
  }, [isActive, itemData.id, itemData.paths]);

  const addPathToRealtimeDB = useCallback((pathData: PathData) => {
    push(whiteboardRef.current, pathData);
  }, []);

  const canvasPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      currentPathRef.current = `M${locationX} ${locationY}`;
      isDrawing.current = true;
    },
    onPanResponderMove: (event: GestureResponderEvent) => {
      if (isDrawing.current) {
        const { locationX, locationY } = event.nativeEvent;
        currentPathRef.current += ` L${locationX} ${locationY}`;
        addPathToRealtimeDB({ path: currentPathRef.current, color: currentColor });
      }
    },
    onPanResponderRelease: () => {
      if (isDrawing.current) {
        currentPathRef.current = "";
        isDrawing.current = false;
      }
    },
  });

  const handleClear = useCallback(async () => {
    await set(whiteboardRef.current, []);
  }, []);

  const handleClose = useCallback(async () => {
    try {
      // Call the onDataUpdate prop with the latest paths
      onDataUpdate({ ...itemData, paths });

      // Remove the disconnect handler
      if (disconnectRef.current) {
        await disconnectRef.current.cancel();
      }

      // Remove the Realtime Database node
      await remove(whiteboardRef.current);

      // Call the onClose prop
      onClose();
    } catch (error) {
      console.error("Error closing whiteboard:", error);
    }
  }, [itemData, paths, onDataUpdate, onClose]);

  if (!isActive) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Image
          source={{ uri: itemData.imageUri }}
          width="80%"
          height="80%"
          resizeMode="contain"
        />
      </YStack>
    );
  }

  return (
    <Modal
      visible={isActive}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <YStack 
        flex={1} 
        backgroundColor="rgba(0,0,0,0.5)" 
        justifyContent="center" 
        alignItems="center"
      >
        <WhiteboardView 
          backgroundColor="white"
          padding="$4"
          width={WHITEBOARD_WIDTH + 40}
          height={WHITEBOARD_HEIGHT + 150}
        >
          <View
            style={{
              width: WHITEBOARD_WIDTH,
              height: WHITEBOARD_HEIGHT,
              borderWidth: 2,
              borderColor: "#ccc",
              borderRadius: 8,
              overflow: "hidden",
            }}
            {...canvasPanResponder.panHandlers}
          >
            <Canvas style={{ flex: 1 }} ref={canvasRef}>
              <Rect x={0} y={0} width={WHITEBOARD_WIDTH} height={WHITEBOARD_HEIGHT} color="white" />
              {paths.map((pathData, index) => (
                <Path
                  key={index}
                  path={pathData.path}
                  color={pathData.color}
                  style="stroke"
                  strokeWidth={2}
                />
              ))}
            </Canvas>
          </View>
          <XStack space="$4" marginTop="$4" justifyContent="center">
            {colors.map((color) => (
              <ColorButton
                key={color}
                backgroundColor={color}
                onPress={() => setCurrentColor(color)}
                borderWidth={2}
                borderColor={color === currentColor ? "black" : "transparent"}
              />
            ))}
          </XStack>
          <XStack space="$4" marginTop="$4" justifyContent="center">
            <Button onPress={handleClear} backgroundColor="$red10" color="white">
              Clear
            </Button>
            <Button onPress={handleClose} backgroundColor="$blue10" color="white">
              Close
            </Button>
          </XStack>
        </WhiteboardView>
      </YStack>
    </Modal>
  );
};

WhiteboardItem.getInitialData = () => ({ paths: [] });

export default WhiteboardItem;