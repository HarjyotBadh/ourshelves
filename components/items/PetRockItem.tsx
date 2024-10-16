import React, { useState, useEffect } from "react";
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Text,
} from "react-native";
import { View, Button, XStack, YStack } from "tamagui";
import { ChevronLeft, ChevronRight, ShoppingBag } from "@tamagui/lucide-icons";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { RockShopModal } from "../RockShopModal";
import { BOTTOM_BAR_HEIGHT, BottomBar } from "styles/WhiteboardStyles";
import { ToastViewport, useToastController } from "@tamagui/toast";

interface PetRockItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    outfits?: RockOutfit[];
    currentOutfitIndex?: number;
    [key: string]: any;
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
}

interface PetRockItemComponent extends React.FC<PetRockItemProps> {
  getInitialData: () => { outfits: string[]; currentOutfitIndex: number };
}

interface RockOutfit {
  id: string;
  name: string;
  cost: number;
  imageUri: string;
}

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

//   const handlePurchase = async (outfit: RockOutfit) => {
//     const userRef = doc(db, "Users", auth.currentUser!.uid);
//     const userDoc = await getDoc(userRef);
//     const userCoins = userDoc.exists() ? userDoc.data()?.coins : 0;
//     if (userCoins < outfit.cost) {
//       toast.show("Insufficent Coins", {
//         duration: 2000,
//         viewportName: "petrock",
//       });
//       return;
//     }
//     // Deduct coins from user
//     await updateDoc(userRef, {
//       coins: userCoins - outfit.cost,
//     });
//     toast.show(outfit.name + " obtained!", {
//       duration: 2000,
//       viewportName: "petrock",
//     });
//     setOutfits([...outfits, outfit]);
//     onDataUpdate({ ...itemData, outfits: [...outfits, outfit] });
//   };

  const renderRockWithOutfit = () => (
    <ImageBackground
      source={{ uri: itemData.imageUri }}
      style={styles.rockImage}
      resizeMode="contain"
    >
      {outfits.length > 0 && currentOutfitIndex !== -1 && (
        <Image
          source={{ uri: outfits[currentOutfitIndex].imageUri }}
          style={styles.outfitImage}
          resizeMode="contain"
        />
      )}
    </ImageBackground>
  );

  if (!isActive) {
    return (
      <View style={styles.inactiveContainer}>{renderRockWithOutfit()}</View>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
                <View style={styles.imageContainer}>
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
        <RockShopModal
          onClose={() => setIsShopModalVisible(false)}
          ownedOutfits={outfits.map((outfit) => outfit.id)}
          isVisible={isShopModalVisible}
          onOutfitPurchased={(newOutfit) => {
            setOutfits((prevOutfits) => [...prevOutfits, newOutfit]);
            onDataUpdate({ ...itemData, outfits: [...outfits, newOutfit] }); // Update PetRockItem data
          }}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#DEB887",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  rockImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  outfitImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  inactiveContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  inactiveRockImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  inactiveOutfitImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
});

PetRockItem.getInitialData = () => ({
  outfits: [],
  currentOutfitIndex: -1,
});

export default PetRockItem;
