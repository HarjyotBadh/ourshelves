import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, styled, YStack, XStack, Button, Sheet, Image } from "tamagui";
import { Canvas, Path, useCanvasRef, Rect } from "@shopify/react-native-skia";
import { PanResponder, GestureResponderEvent, Dimensions } from "react-native";

interface WhiteboardItemProps {
  itemData: {
    name: string;
    imageUri: string;
    [key: string]: any;
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
  const [paths, setPaths] = useState<string[]>(itemData.paths || []);
  const canvasRef = useCanvasRef();
  const isDrawing = useRef(false);
  const currentPathRef = useRef("");

  const handleDialogClose = useCallback(() => {
      onClose();
  }, [onClose]);

  const updateItemData = useCallback((newPaths: string[]) => {
      onDataUpdate({ ...itemData, paths: newPaths });
  }, [itemData, onDataUpdate]);

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
              setPaths([...paths]); // Force re-render
          }
      },
      onPanResponderRelease: () => {
          if (isDrawing.current) {
              const newPaths = [...paths, currentPathRef.current];
              setPaths(newPaths);
              updateItemData(newPaths);
              currentPathRef.current = "";
              isDrawing.current = false;
              console.log("Paths updated:", newPaths);
          }
      },
  });

  const handleClear = useCallback(() => {
      setPaths([]);
      updateItemData([]);
  }, [updateItemData]);

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
      <YStack flex={1}>
          <WhiteboardView />
          <Sheet
              modal
              open={isActive}
              snapPoints={[90]}
              dismissOnSnapToBottom
              disableDrag={true}
          >
              <Sheet.Overlay />
              <Sheet.Frame padding="$4">
                  <Sheet.Handle />
                  <YStack f={1} jc="center" ai="center" space="$4">
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
                              {currentPathRef.current && (
                                  <Path
                                      path={currentPathRef.current}
                                      color="black"
                                      style="stroke"
                                      strokeWidth={2}
                                  />
                              )}
                          </Canvas>
                      </View>
                      <XStack space="$4">
                          <Button onPress={handleClear} backgroundColor="$red10" color="white">
                              Clear
                          </Button>
                          <Button onPress={handleDialogClose} backgroundColor="$blue10" color="white">
                              Close
                          </Button>
                      </XStack>
                  </YStack>
              </Sheet.Frame>
          </Sheet>
      </YStack>
  );
};

WhiteboardItem.getInitialData = () => ({ paths: [] });

export default WhiteboardItem;