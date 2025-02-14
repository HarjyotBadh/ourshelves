import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, TouchableOpacity, Image, Dimensions, SafeAreaView } from "react-native";
import { View, Button, XStack, YStack, Text, Dialog } from "tamagui";
import { ChevronLeft, ChevronRight, ShoppingBag, Edit3, X } from "@tamagui/lucide-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  cancelAnimation,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";

import { RockShopModal } from "../RockShopModal";
import { BottomBar } from "styles/WhiteboardStyles";
import { PetRockItemComponent, RockOutfit } from "models/PetRockModel";
import { petRockStyles } from "styles/PetRockStyles";
import { earnCoins } from "project-functions/shopFunctions";
import { auth, db } from "firebaseConfig";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { doc, getDoc } from "firebase/firestore";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ROCK_SIZE = 120;
const CANVAS_PADDING = 30;
const EXTRA_RIGHT_PADDING = 40;
const HEIGHT_PADDING = 45;
const GRAVITY = 2000;
const COIN_SIZE = 40;
const SPAWN_DELAY = 1000; // 1 second cooldown

const PetRockItem: PetRockItemComponent = ({ itemData, onDataUpdate, isActive, onClose }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isShopModalVisible, setIsShopModalVisible] = useState(false);
  const [outfits, setOutfits] = useState<RockOutfit[]>(itemData.outfits || []);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(itemData.currentOutfitIndex || -1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [coinPosition, setCoinPosition] = useState({ x: 0, y: 0 });
  const [isCoinVisible, setIsCoinVisible] = useState(true);
  const [lastCollisionTime, setLastCollisionTime] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const isCollecting = useRef(false);
  const isMoving = useSharedValue(false);

  const canvasWidth = SCREEN_WIDTH * 0.8 + CANVAS_PADDING * 2 + EXTRA_RIGHT_PADDING;
  const canvasHeight = SCREEN_HEIGHT * 0.6 + CANVAS_PADDING;

  const playAreaWidth = canvasWidth - 4 * CANVAS_PADDING;
  const playAreaHeight = canvasHeight - 4 * CANVAS_PADDING;

  const translateX = useSharedValue(canvasWidth / 2 - ROCK_SIZE / 2);
  const translateY = useSharedValue(canvasHeight / 2 - ROCK_SIZE / 2);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const isBeingDragged = useSharedValue(false);

  const toast = useToastController();

  useEffect(() => {
    const fetchUserCoins = async () => {
      const userRef = doc(db, "Users", auth.currentUser!.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const coins = userDoc.data().coins || 0;
        setUserCoins(coins);
      }
    };
    fetchUserCoins();
  }, []);

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  useEffect(() => {
    // Update outfits if they exist in itemData
    if (itemData.outfits) {
      setOutfits(itemData.outfits);
    }
    // Update currentOutfitIndex if it exists in itemData
    if (itemData.currentOutfitIndex !== undefined) {
      setCurrentOutfitIndex(itemData.currentOutfitIndex);
    }
  }, [itemData]);

  useEffect(() => {
    if (outfits.length > 0 && currentOutfitIndex === -1) {
      setCurrentOutfitIndex(0);
      onDataUpdate({ ...itemData, currentOutfitIndex: 0 });
    } else if (outfits.length === 0 && currentOutfitIndex !== -1) {
      setCurrentOutfitIndex(-1);
      onDataUpdate({ ...itemData, currentOutfitIndex: -1 });
    }
  }, [outfits]);

  const handleCloseModal = useCallback(() => {
    setDialogOpen(false);
    setIsShopModalVisible(false);
    onDataUpdate({ ...itemData, outfits, currentOutfitIndex });
    onClose();
  }, [itemData, outfits, currentOutfitIndex, onDataUpdate, onClose]);

  const handleOutfitChange = useCallback(
    (direction: "prev" | "next") => {
      setCurrentOutfitIndex((prevIndex) => {
        const newIndex =
          direction === "prev"
            ? (prevIndex - 1 + outfits.length) % outfits.length
            : (prevIndex + 1) % outfits.length;
        return newIndex;
      });
    },
    [outfits]
  );

  const renderRockWithOutfit = useCallback(
    () => (
      <View style={petRockStyles.rock}>
        <Image
          source={{ uri: itemData.imageUri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
        {outfits.length > 0 && currentOutfitIndex !== -1 && (
          <Image
            source={{ uri: outfits[currentOutfitIndex].imageUri }}
            style={{
              ...petRockStyles.outfitImage,
              width: "100%",
              height: "100%",
            }}
            resizeMode="contain"
          />
        )}
      </View>
    ),
    [itemData.imageUri, outfits, currentOutfitIndex]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const clamp = (value: number, min: number, max: number) => {
    "worklet";
    return Math.min(Math.max(value, min), max);
  };

  const spawnCoin = useCallback(() => {
    let newX, newY;
    do {
      newX = Math.random() * (playAreaWidth - COIN_SIZE) + CANVAS_PADDING;
      newY = Math.random() * (playAreaHeight - COIN_SIZE) + CANVAS_PADDING;
    } while (
      Math.abs(newX - translateX.value) < ROCK_SIZE &&
      Math.abs(newY - translateY.value) < ROCK_SIZE
    );
    setCoinPosition({ x: newX, y: newY });
    setIsCoinVisible(true);
  }, [playAreaWidth, playAreaHeight, translateX, translateY]);

  useEffect(() => {
    if (dialogOpen) {
      // Reset rock position
      translateX.value = playAreaWidth / 2 - ROCK_SIZE / 2 + CANVAS_PADDING;
      translateY.value = playAreaHeight / 2 - ROCK_SIZE / 2 + CANVAS_PADDING;

      // Spawn initial coin
      spawnCoin();
    }
  }, [dialogOpen, spawnCoin, playAreaWidth, playAreaHeight]);

  const checkCoinCollision = useCallback(() => {
    if (!isCoinVisible || isCollecting.current || !isMoving.value) return;
    const rockCenterX = translateX.value + ROCK_SIZE / 2;
    const rockCenterY = translateY.value + ROCK_SIZE / 2;
    const coinCenterX = coinPosition.x + COIN_SIZE / 2;
    const coinCenterY = coinPosition.y + COIN_SIZE / 2;

    const distance = Math.sqrt(
      Math.pow(rockCenterX - coinCenterX, 2) + Math.pow(rockCenterY - coinCenterY, 2)
    );

    if (distance < ROCK_SIZE / 2 + COIN_SIZE / 2) {
      isCollecting.current = true;
      setIsCoinVisible(false);
      toast.show("+1 coin", {
        duration: 1000,
        viewportName: "pet-rock-viewport",
      });
      earnCoins(auth.currentUser!.uid, 1).then((result) => {
        if (result.success && result.newCoins !== null) {
          setUserCoins(result.newCoins);
        }
        setTimeout(() => {
          spawnCoin();
          isCollecting.current = false;
        }, SPAWN_DELAY);
      });
    }
  }, [coinPosition, translateX, translateY, spawnCoin, toast, isCoinVisible]);

  useAnimatedReaction(
    () => ({
      x: translateX.value,
      y: translateY.value,
      vx: velocityX.value,
      vy: velocityY.value,
    }),
    (current, previous) => {
      if (!previous || isBeingDragged.value) return;

      const dt = 1 / 60;
      velocityY.value += GRAVITY * dt;

      const newX = clamp(
        translateX.value + velocityX.value * dt,
        CANVAS_PADDING - EXTRA_RIGHT_PADDING,
        canvasWidth - ROCK_SIZE - CANVAS_PADDING - EXTRA_RIGHT_PADDING
      );
      const newY = clamp(
        translateY.value + velocityY.value * dt,
        CANVAS_PADDING - HEIGHT_PADDING,
        canvasHeight - ROCK_SIZE - CANVAS_PADDING
      );

      const hasMovedX = Math.abs(newX - translateX.value) > 0.1;
      const hasMovedY = Math.abs(newY - translateY.value) > 0.1;
      isMoving.value = hasMovedX || hasMovedY;

      if (isMoving.value) {
        translateX.value = newX;
        translateY.value = newY;
        runOnJS(checkCoinCollision)();
      }

      if (
        translateX.value <= CANVAS_PADDING - EXTRA_RIGHT_PADDING ||
        translateX.value >= canvasWidth - ROCK_SIZE - CANVAS_PADDING - EXTRA_RIGHT_PADDING
      ) {
        velocityX.value *= -0.5;
      }

      if (
        translateY.value <= CANVAS_PADDING - HEIGHT_PADDING ||
        translateY.value >= canvasHeight - ROCK_SIZE - CANVAS_PADDING
      ) {
        velocityY.value *= -0.5;
        velocityX.value *= 0.98;
      }

      if (
        Math.abs(velocityY.value) < 1 &&
        Math.abs(velocityX.value) < 1 &&
        translateY.value === canvasHeight - ROCK_SIZE - CANVAS_PADDING
      ) {
        velocityY.value = 0;
        velocityX.value = 0;
        isMoving.value = false;
      }
    },
    [translateX, translateY, velocityX, velocityY, checkCoinCollision]
  );

  const gesture = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      isBeingDragged.value = true;
      isMoving.value = true;
      velocityX.value = 0;
      velocityY.value = 0;
    })
    .onUpdate((event) => {
      console.log(event.absoluteX, event.absoluteY);
      if (!isEditMode) {
        translateX.value = clamp(
          event.absoluteX - ROCK_SIZE / 2,
          CANVAS_PADDING - EXTRA_RIGHT_PADDING,
          canvasWidth - ROCK_SIZE - CANVAS_PADDING - EXTRA_RIGHT_PADDING
        );
        translateY.value = clamp(
          event.absoluteY - ROCK_SIZE / 2,
          CANVAS_PADDING - HEIGHT_PADDING,
          canvasHeight - ROCK_SIZE - CANVAS_PADDING
        );
        runOnJS(checkCoinCollision)();
      }
    })
    .onEnd((event) => {
      if (!isEditMode) {
        isBeingDragged.value = false;
        velocityX.value = event.velocityX;
        velocityY.value = event.velocityY;
      }
    });

  if (!isActive) {
    return (
      <YStack flex={1}>
        <View style={petRockStyles.inactiveContainer}>{renderRockWithOutfit()}</View>
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      <View style={petRockStyles.inactiveContainer}>{renderRockWithOutfit()}</View>
      <Dialog
        modal
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) {
            onClose();
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="content"
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            y={0}
            opacity={1}
            scale={1}
            style={petRockStyles.modalWrapper}
          >
            <View style={petRockStyles.modalContent}>
              <View style={petRockStyles.canvas}>
                <GestureDetector gesture={gesture}>
                  <Animated.View style={[petRockStyles.rock, animatedStyle]}>
                    {renderRockWithOutfit()}
                  </Animated.View>
                </GestureDetector>
                {isCoinVisible && (
                  <Image
                    source={{
                      uri: "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/coin.png?alt=media&token=756280c2-4c34-47b3-9d64-2652fafb97d3",
                    }}
                    style={{
                      position: "absolute",
                      left: coinPosition.x,
                      top: coinPosition.y,
                      width: COIN_SIZE,
                      height: COIN_SIZE,
                    }}
                  />
                )}
              </View>

              <YStack space padding="$4" style={{ position: "relative", zIndex: 1 }}>
                {isEditMode ? (
                  <XStack space justifyContent="center" alignItems="center">
                    <TouchableOpacity
                      onPress={() => handleOutfitChange("prev")}
                      disabled={outfits.length === 0}
                    >
                      <ChevronLeft size={24} color={outfits.length === 0 ? "gray" : "black"} />
                    </TouchableOpacity>
                    <Text>{outfits[currentOutfitIndex]?.name || "No outfit"}</Text>
                    <TouchableOpacity
                      onPress={() => handleOutfitChange("next")}
                      disabled={outfits.length === 0}
                    >
                      <ChevronRight size={24} color={outfits.length === 0 ? "gray" : "black"} />
                    </TouchableOpacity>
                    <Button backgroundColor="$pink6" icon={X} onPress={() => setIsEditMode(false)}>
                      Done
                    </Button>
                  </XStack>
                ) : (
                  <XStack space justifyContent="center">
                    <Button
                      backgroundColor="$pink6"
                      icon={Edit3}
                      onPress={() => setIsEditMode(true)}
                    >
                      Edit
                    </Button>
                    <Button
                      backgroundColor="$pink6"
                      icon={ShoppingBag}
                      onPress={() => setIsShopModalVisible(true)}
                    >
                      Rock Shop
                    </Button>
                    <Button backgroundColor="$red10" onPress={handleCloseModal}>
                      Close
                    </Button>
                  </XStack>
                )}
              </YStack>
            </View>
            <BottomBar />
            <ToastViewport
              name="pet-rock-viewport"
              style={{
                position: "absolute",
                top: 40,
                left: 0,
                right: 0,
                alignItems: "center",
                zIndex: 2,
              }}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <RockShopModal
        onClose={() => setIsShopModalVisible(false)}
        ownedOutfits={outfits.map((outfit) => outfit.id)}
        isVisible={isShopModalVisible}
        onOutfitPurchased={(newOutfit) => {
          setOutfits((prevOutfits) => [...prevOutfits, newOutfit]);
          onDataUpdate({ ...itemData, outfits: [...outfits, newOutfit] });
        }}
        userCoins={userCoins}
        onCoinUpdate={setUserCoins}
      />
    </YStack>
  );
};

PetRockItem.getInitialData = () => ({
  outfits: [],
  currentOutfitIndex: -1,
});

export default PetRockItem;
