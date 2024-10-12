import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, styled, YStack, XStack, Button, Sheet, Image } from "tamagui";
import { Canvas, Path, useCanvasRef, Rect } from "@shopify/react-native-skia";
import { PanResponder, GestureResponderEvent, Dimensions, Modal } from "react-native";
import { ref, onValue, push, set, remove } from "firebase/database";
import { rtdb, auth } from "firebaseConfig";

interface WhiteboardItemProps {
  itemData: {
    name: string;
    imageUri: string;
    [key: string]: any;
    id: string;
    paths: string[];
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
  getInitialData: () => { paths: string[] };
}


const WhiteboardView = styled(View, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
});

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const WHITEBOARD_WIDTH = screenWidth - 40;
const WHITEBOARD_HEIGHT = WHITEBOARD_WIDTH * 0.6;

const WhiteboardItem: WhiteboardItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [paths, setPaths] = useState<string[]>(itemData.paths || []);
  const canvasRef = useCanvasRef();
  const isDrawing = useRef(false);
  const currentPathRef = useRef("");
  const whiteboardRef = useRef(ref(rtdb, `whiteboards/${itemData.id}`));

  useEffect(() => {
    const unsubscribe = onValue(whiteboardRef.current, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPaths(Object.values(data));
      } else {
        setPaths([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [itemData.id]);

  const addPathToRealtimeDB = useCallback((path: string) => {
    console.log("addPathToRealtimeDB", path);
    push(whiteboardRef.current, path);
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
              // setPaths([...paths]); // Force re-render
              setPaths((prevPaths) => [...prevPaths, currentPathRef.current]);
          }
      },
      onPanResponderRelease: () => {
          if (isDrawing.current) {
              // const newPaths = [...paths, currentPathRef.current];
              // setPaths(newPaths);
              // updateItemData(newPaths);
              addPathToRealtimeDB(currentPathRef.current);
              currentPathRef.current = "";
              isDrawing.current = false;
          }
      },
  });

  // const handleClear = useCallback(() => {
  //     setPaths([]);
  //     updateItemData([]);
  // }, [updateItemData]);
  const handleClear = useCallback(() => {
    set(whiteboardRef.current, null);
  }, []);

  const handleClose = useCallback(() => {
    onDataUpdate({ ...itemData, paths });
    remove(whiteboardRef.current);
    onClose();
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
                  height={WHITEBOARD_HEIGHT + 100}
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
                          {paths.map((path, index) => (
                              <Path
                                  key={index}
                                  path={path}
                                  color="black"
                                  style="stroke"
                                  strokeWidth={2}
                              />
                          ))}
                          {/* {currentPathRef.current && (
                              <Path
                                  path={currentPathRef.current}
                                  color="black"
                                  style="stroke"
                                  strokeWidth={2}
                              />
                          )} */}
                      </Canvas>
                  </View>
                  <XStack space="$4" marginTop="$4" justifyContent="center">
                      <Button onPress={handleClear} backgroundColor="$red10" color="white">
                          Clear
                      </Button>
                      <Button onPress={onClose} backgroundColor="$blue10" color="white">
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