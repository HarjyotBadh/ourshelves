import React, { useState, useEffect } from "react";
import {
  Modal,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import { View, Button, XStack, YStack } from "tamagui";
import { ChevronLeft, ChevronRight, ShoppingBag } from "@tamagui/lucide-icons";

import { RockShopModal } from "../RockShopModal";
import { BOTTOM_BAR_HEIGHT, BottomBar } from "styles/WhiteboardStyles";
import { useToastController } from "@tamagui/toast";
import { PetRockItemProps, PetRockItemComponent, RockOutfit } from 'models/PetRockModel';
import { petRockStyles } from 'styles/PetRockStyles';

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

  const toast = useToastController();

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

  useEffect(() => {
    // Update currentOutfitIndex if outfits change
    if (outfits.length > 0 && currentOutfitIndex === -1) {
      setCurrentOutfitIndex(0);
      onDataUpdate({ ...itemData, currentOutfitIndex: 0 });
    } else if (outfits.length === 0 && currentOutfitIndex !== -1) {
      setCurrentOutfitIndex(-1);
      onDataUpdate({ ...itemData, currentOutfitIndex: -1 });
    }
  }, [outfits]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setIsShopModalVisible(false);
    onDataUpdate({ ...itemData, outfits, currentOutfitIndex });
    onClose();
  };

  const handleOutfitChange = (direction: "prev" | "next") => {
    let newIndex = currentOutfitIndex;
    if (direction === "prev") {
      newIndex = (currentOutfitIndex - 1 + outfits.length) % outfits.length;
    } else {
      newIndex = (currentOutfitIndex + 1) % outfits.length;
    }
    setCurrentOutfitIndex(newIndex);
    // onDataUpdate({ ...itemData, currentOutfitIndex: newIndex });
    console.log(outfits[newIndex]);
  };

  const renderRockWithOutfit = () => (
    <ImageBackground
      source={{ uri: itemData.imageUri }}
      style={petRockStyles.rockImage}
      resizeMode="contain"
    >
      {outfits.length > 0 && currentOutfitIndex !== -1 && (
        <Image
          source={{ uri: outfits[currentOutfitIndex].imageUri }}
          style={petRockStyles.outfitImage}
          resizeMode="contain"
        />
      )}
    </ImageBackground>
  );

  if (!isActive) {
    return (
      <View style={petRockStyles.inactiveContainer}>{renderRockWithOutfit()}</View>
    );
  }

  return (
    <>
    <Modal
      visible={isModalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View style={petRockStyles.modalContainer}>
        <View style={petRockStyles.modalWrapper}>
          <View style={petRockStyles.modalContent}>
            <YStack space>
              <XStack space justifyContent="center" alignItems="center">
                <TouchableOpacity
                  onPress={() => handleOutfitChange("prev")}
                  disabled={outfits.length === 0}
                >
                  <ChevronLeft
                    size={24}
                    color={outfits.length === 0 ? "gray" : "black"}
                  />
                </TouchableOpacity>
                <View style={petRockStyles.imageContainer}>
                  {renderRockWithOutfit()}
                </View>
                <TouchableOpacity
                  onPress={() => handleOutfitChange("next")}
                  disabled={outfits.length === 0}
                >
                  <ChevronRight
                    size={24}
                    color={outfits.length === 0 ? "gray" : "black"}
                  />
                </TouchableOpacity>
              </XStack>
              <Button
                icon={ShoppingBag}
                onPress={() => setIsShopModalVisible(true)}
              >
                Rock Shop
              </Button>
              <Button onPress={handleCloseModal}>Close</Button>
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
  </>
  );
};


PetRockItem.getInitialData = () => ({
  outfits: [],
  currentOutfitIndex: -1,
});

export default PetRockItem;
