import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, YStack, XStack, Button, Image } from "tamagui";
import { Canvas, Path, useCanvasRef, Rect } from "@shopify/react-native-skia";
import {
  PanResponder,
  GestureResponderEvent,
  Dimensions,
  Modal,
} from "react-native";
import {
  ref,
  onValue,
  push,
  set,
  remove,
  off,
  onDisconnect,
} from "firebase/database";
import { rtdb } from "firebaseConfig";
import { WhiteboardItemComponent, PathData } from "models/WhiteboardModel";
import { colors, ColorButton, WhiteboardView } from "styles/WhiteboardStyles";

const { width: screenWidth } = Dimensions.get("window");
const WHITEBOARD_WIDTH = screenWidth - 40;
const WHITEBOARD_HEIGHT = WHITEBOARD_WIDTH * 0.6;

const WhiteboardItem: WhiteboardItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [paths, setPaths] = useState<PathData[]>(itemData.paths || []);
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [hasChanges, setHasChanges] = useState(false);
  const canvasRef = useCanvasRef();
  const isDrawing = useRef(false);
  const currentPathRef = useRef("");
  const whiteboardRef = useRef(ref(rtdb, `whiteboards/${itemData.id}`));
  const disconnectRef = useRef<ReturnType<typeof onDisconnect>>();

  useEffect(() => {
    if (isActive) {
      const initializeWhiteboard = async () => {
        try {
          await set(whiteboardRef.current, itemData.paths || []);

          const unsubscribe = onValue(whiteboardRef.current, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setPaths(Object.values(data));
            } else {
              setPaths([]);
            }
          });

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
    setHasChanges(true);
  }, []);

  const handleClear = useCallback(async () => {
    await set(whiteboardRef.current, []);
    setHasChanges(true);
  }, []);

  const handleClose = useCallback(async () => {
    try {
      if (hasChanges) {
        onDataUpdate({ ...itemData, paths });
      }
      onClose();

      if (disconnectRef.current) {
        await disconnectRef.current.cancel();
      }
      await remove(whiteboardRef.current);
    } catch (error) {
      console.error("Error closing whiteboard:", error);
    }
  }, [itemData, paths, onDataUpdate, onClose, hasChanges]);

  const panResponder = PanResponder.create({
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
        addPathToRealtimeDB({
          path: currentPathRef.current,
          color: currentColor,
        });
      }
    },
    onPanResponderRelease: () => {
      if (isDrawing.current) {
        currentPathRef.current = "";
        isDrawing.current = false;
      }
    },
  });

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
            {...panResponder.panHandlers}
          >
            <Canvas style={{ flex: 1 }} ref={canvasRef}>
              <Rect
                x={0}
                y={0}
                width={WHITEBOARD_WIDTH}
                height={WHITEBOARD_HEIGHT}
                color="white"
              />
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
            <Button
              onPress={handleClear}
              backgroundColor="$red10"
              color="white"
            >
              Clear
            </Button>
            <Button
              onPress={handleClose}
              backgroundColor="$blue10"
              color="white"
            >
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
