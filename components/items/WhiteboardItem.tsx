import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, YStack, XStack, Button, Image, Text } from "tamagui";
import {
  Canvas,
  Path,
  useCanvasRef,
  Rect,
  Circle,
  useImage,
  Image as SkiaImage,
  Group,
  Skia,
} from "@shopify/react-native-skia";
import {
  PanResponder,
  GestureResponderEvent,
  Dimensions,
  Modal,
  StyleSheet,
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
import {
  WhiteboardItemComponent,
  PathData,
  EraserIcon,
} from "models/WhiteboardModel";
import {
  colors,
  ColorButton,
  WhiteboardView,
  ButtonContainer,
  CanvasContainer,
  BOTTOM_BAR_HEIGHT,
  BottomBar,
  styles,
} from "styles/WhiteboardStyles";
import { auth, db } from "firebaseConfig";
import { doc, increment, updateDoc } from "firebase/firestore";
import { ToastViewport, useToastController } from "@tamagui/toast";
import ColorPicker, {
  Preview,
  OpacitySlider,
  BrightnessSlider,
  HueSlider,
  SaturationSlider,
  Panel1,
  Panel3,
  Panel4,
  HueCircular,
} from "reanimated-color-picker";

const { width: screenWidth } = Dimensions.get("window");
const WHITEBOARD_WIDTH = screenWidth - 40;
const WHITEBOARD_HEIGHT = WHITEBOARD_WIDTH * 0.6;
const NORMAL_STROKE_WIDTH = 2;
const ERASER_STROKE_WIDTH = 20;
const ERASER_COLOR = "white";

const PREVIEW_WIDTH = 120;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * (WHITEBOARD_HEIGHT / WHITEBOARD_WIDTH);
const SCALE_FACTOR = PREVIEW_WIDTH / WHITEBOARD_WIDTH;
const PREVIEW_PADDING = 5; // Adding padding to prevent overlap

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
  const [isErasing, setIsErasing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const canvasRef = useCanvasRef();
  const isDrawing = useRef(false);
  const currentPathRef = useRef("");
  const whiteboardRef = useRef(ref(rtdb, `whiteboards/${itemData.id}`));
  const disconnectRef = useRef<ReturnType<typeof onDisconnect>>();

  const toast = useToastController();

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

  const toggleEraser = useCallback(() => {
    setIsErasing((prev) => !prev);
    setCurrentColor(isErasing ? colors[0] : ERASER_COLOR);
  }, [isErasing]);

  const handleClose = useCallback(async () => {
    try {
      if (hasChanges) {
        const userDocRef = doc(db, "Users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          coins: increment(10),
        });
        toast.show("You earned 10 coins for your drawing!", {
          duration: 3000,
        });
        setHasChanges(false);
      }
      //if (hasChanges) {
      onDataUpdate({ ...itemData, paths });
      //}
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
        setCurrentPosition({ x: locationX, y: locationY });
        addPathToRealtimeDB({
          path: currentPathRef.current,
          color: currentColor,
          strokeWidth: isErasing ? ERASER_STROKE_WIDTH : NORMAL_STROKE_WIDTH,
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

  const scalePath = (path: string, scale: number): string => {
    const skPath = Skia.Path.MakeFromSVGString(path);
    if (!skPath) return path;

    const matrix = Skia.Matrix();
    matrix.scale(scale, scale);
    skPath.transform(matrix);
    return skPath.toSVGString() || path;
  };

  const renderWhiteboardPreview = () => (
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

  const onSelectColor = ({ hex }) => {
    setCurrentColor(hex);
    setIsErasing(false);
    //setIsColorPickerVisible(false);
  };

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  if (!isActive) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        {renderWhiteboardPreview()}
      </YStack>
    );
  }

  // Removed incorrect Slider declaration

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
          padding="$4"
          width={WHITEBOARD_WIDTH + 40}
          height={WHITEBOARD_HEIGHT + 150 + BOTTOM_BAR_HEIGHT}
          position="relative"
        >
          <CanvasContainer
            width={WHITEBOARD_WIDTH}
            height={WHITEBOARD_HEIGHT}
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
                  strokeWidth={pathData.strokeWidth || NORMAL_STROKE_WIDTH}
                />
              ))}
              {isErasing && (
                <Circle
                  cx={currentPosition.x}
                  cy={currentPosition.y}
                  r={ERASER_STROKE_WIDTH / 2}
                  color="rgba(0, 0, 0, 0.1)"
                />
              )}
            </Canvas>
          </CanvasContainer>
          <ButtonContainer>
            {colors.map((color) => (
              <ColorButton
                key={color}
                backgroundColor={color}
                onPress={() => {
                  setCurrentColor(color);
                  setIsErasing(false);
                }}
                selected={color === currentColor && !isErasing}
              />
            ))}
            <ColorButton
              backgroundColor="white"
              onPress={toggleEraser}
              selected={isErasing}
            >
              <EraserIcon />
            </ColorButton>
            <ColorButton
              backgroundColor={currentColor}
              onPress={toggleColorPicker}
              selected={false}
            >
              <Text
                style={{
                  color: currentColor === "white" ? "black" : "white",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                +
              </Text>
            </ColorButton>
          </ButtonContainer>
          <ButtonContainer>
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
              marginLeft="$4"
            >
              Close
            </Button>
          </ButtonContainer>
          <BottomBar />
        </WhiteboardView>
        <Modal
          visible={isColorPickerVisible}
          onRequestClose={() => setIsColorPickerVisible(false)}
          animationType="slide"
          transparent={true} // Make the modal not take up the entire screen
        >
          <YStack
            flex={1}
            justifyContent="center" // Center the modal vertically
            alignItems="center" // Center the modal horizontally
            // backgroundColor="rgba(0,0,0,0.5)" // Add a semi-transparent background for overlay effect
          >
            <YStack
              width="90%" // Control the modal width
              padding="$4"
              backgroundColor="#e8e8e8"
              borderRadius={15} // Rounded corners for the modal
            >
              <ColorPicker
                style={{ width: "100%" }}
                value={currentColor}
                onComplete={onSelectColor}
                sliderThickness={30}
                thumbSize={40}
                thumbShape="pill"
                
              >
                <Preview
                  style={[styles.previewStyle, styles.shadow]}
                  textStyle={{ fontSize: 18 }}
                />
                <HueSlider adaptSpectrum={true} style={[styles.sliderStyle]} />
                <BrightnessSlider style={[styles.sliderStyle, styles.shadow]} />
                <SaturationSlider style={[styles.sliderStyle, styles.shadow]} />
                <OpacitySlider style={[styles.sliderStyle, styles.shadow]} />
              </ColorPicker>
              <Button
                onPress={() => setIsColorPickerVisible(false)}
                backgroundColor="$blue10"
                color="white"
                marginTop="$4"
              >
                Done
              </Button>
            </YStack>
          </YStack>
        </Modal>

        <ToastViewport name="whiteboard" />
      </YStack>
    </Modal>
  );
};

WhiteboardItem.getInitialData = () => ({ paths: [] });

export default WhiteboardItem;
