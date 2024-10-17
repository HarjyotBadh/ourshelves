import React, { useState, useEffect, useCallback } from "react";
import { Modal, TouchableOpacity, Image, Dimensions } from "react-native";
import { View, Button, XStack, YStack, Text } from "tamagui";
import { ChevronLeft, ChevronRight, ShoppingBag, Edit3, X } from "@tamagui/lucide-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  cancelAnimation,
  useAnimatedReaction,
} from "react-native-reanimated";

import { RockShopModal } from "../RockShopModal";
import { BottomBar } from "styles/WhiteboardStyles";
import { PetRockItemComponent, RockOutfit } from 'models/PetRockModel';
import { petRockStyles } from 'styles/PetRockStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ROCK_SIZE = 120;
const CANVAS_PADDING = 20;
const GRAVITY = 2000;

const PetRockItem: PetRockItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isShopModalVisible, setIsShopModalVisible] = useState(false);
  const [outfits, setOutfits] = useState<RockOutfit[]>(itemData.outfits || []);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(
    itemData.currentOutfitIndex || -1
  );
  const [isEditMode, setIsEditMode] = useState(false);

  const canvasWidth = SCREEN_WIDTH * 0.8 + CANVAS_PADDING;
  const canvasHeight = SCREEN_HEIGHT * 0.6 - CANVAS_PADDING / 2;

  const translateX = useSharedValue(canvasWidth / 2 - ROCK_SIZE / 2);
  const translateY = useSharedValue(canvasHeight / 2 - ROCK_SIZE / 2);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const isBeingDragged = useSharedValue(false);



  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

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
    setIsModalVisible(false);
    setIsShopModalVisible(false);
    onDataUpdate({ ...itemData, outfits, currentOutfitIndex });
    onClose();
  }, [itemData, outfits, currentOutfitIndex, onDataUpdate, onClose]);

  const handleOutfitChange = useCallback((direction: "prev" | "next") => {
    setCurrentOutfitIndex((prevIndex) => {
      const newIndex = direction === "prev"
        ? (prevIndex - 1 + outfits.length) % outfits.length
        : (prevIndex + 1) % outfits.length;
      return newIndex;
    });
  }, [outfits]);

  const renderRockWithOutfit = useCallback(() => (
    <View style={petRockStyles.rock}>
      <Image
        source={{ uri: itemData.imageUri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
      {outfits.length > 0 && currentOutfitIndex !== -1 && (
        <Image
          source={{ uri: outfits[currentOutfitIndex].imageUri }}
          style={{ ...petRockStyles.outfitImage, width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      )}
    </View>
  ), [itemData.imageUri, outfits, currentOutfitIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const clamp = (value: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
  };

  useAnimatedReaction(
    () => ({ x: translateX.value, y: translateY.value, vx: velocityX.value, vy: velocityY.value }),
    (current, previous) => {
      if (!previous || isBeingDragged.value) return;

      const dt = 1 / 60;
      velocityY.value += GRAVITY * dt;
      
      translateX.value = clamp(translateX.value + velocityX.value * dt, 0, canvasWidth - ROCK_SIZE);
      translateY.value = clamp(translateY.value + velocityY.value * dt, 0, canvasHeight - ROCK_SIZE);

      if (translateX.value <= 0 || translateX.value >= canvasWidth - ROCK_SIZE) {
        velocityX.value *= -0.5;
      }

      if (translateY.value <= 0 || translateY.value >= canvasHeight - ROCK_SIZE) {
        translateY.value = translateY.value <= 0 ? 0 : canvasHeight - ROCK_SIZE;
        velocityY.value *= -0.5;
        velocityX.value *= 0.98;
      }

      if (Math.abs(velocityY.value) < 1 && Math.abs(velocityX.value) < 1 && 
         translateY.value === canvasHeight - ROCK_SIZE / 2) {
        velocityY.value = 0;
        velocityX.value = 0;
      }
    },
    [translateX, translateY, velocityX, velocityY]
  );

  const gesture = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      isBeingDragged.value = true;
      velocityX.value = 0;
      velocityY.value = 0;
    })
    .onUpdate((event) => {
      if (!isEditMode) {
        translateX.value = clamp(event.absoluteX - ROCK_SIZE, 0, canvasWidth - ROCK_SIZE);
        translateY.value = clamp(event.absoluteY - ROCK_SIZE, 0, canvasHeight - ROCK_SIZE);
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
      <View style={petRockStyles.inactiveContainer}>{renderRockWithOutfit()}</View>
    );
  }

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View style={petRockStyles.modalContainer}>
        <View style={petRockStyles.modalWrapper}>
          <View style={petRockStyles.modalContent}>
            <View style={petRockStyles.canvas}>
              <GestureDetector gesture={gesture}>
                <Animated.View style={[petRockStyles.rock, animatedStyle]}>
                  {renderRockWithOutfit()}
                </Animated.View>
              </GestureDetector>
            </View>
            
            <YStack space padding="$4">
              {isEditMode ? (
                <XStack space justifyContent="center" alignItems="center">
                  <TouchableOpacity onPress={() => handleOutfitChange("prev")} disabled={outfits.length === 0}>
                    <ChevronLeft size={24} color={outfits.length === 0 ? "gray" : "black"} />
                  </TouchableOpacity>
                  <Text>{outfits[currentOutfitIndex]?.name || "No outfit"}</Text>
                  <TouchableOpacity onPress={() => handleOutfitChange("next")} disabled={outfits.length === 0}>
                    <ChevronRight size={24} color={outfits.length === 0 ? "gray" : "black"} />
                  </TouchableOpacity>
                  <Button backgroundColor="$pink6" icon={X} onPress={() => setIsEditMode(false)}>
                    Done
                  </Button>
                </XStack>
              ) : (
                <XStack space justifyContent="center">
                  <Button backgroundColor="$pink6" icon={Edit3} onPress={() => setIsEditMode(true)}>
                    Edit
                  </Button>
                  <Button backgroundColor="$pink6" icon={ShoppingBag} onPress={() => setIsShopModalVisible(true)}>
                    Rock Shop
                  </Button>
                  <Button theme="red" onPress={handleCloseModal}>Close</Button>
                </XStack>
              )}
            </YStack>
          </View>
          <BottomBar />
        </View>
      </View>
      <RockShopModal
        onClose={() => setIsShopModalVisible(false)}
        ownedOutfits={outfits.map((outfit) => outfit.id)}
        isVisible={isShopModalVisible}
        onOutfitPurchased={(newOutfit) => {
          setOutfits((prevOutfits) => [...prevOutfits, newOutfit]);
          onDataUpdate({ ...itemData, outfits: [...outfits, newOutfit] });
        }}
      />
    </Modal>
  );
};

PetRockItem.getInitialData = () => ({
  outfits: [],
  currentOutfitIndex: -1,
});

export default PetRockItem;