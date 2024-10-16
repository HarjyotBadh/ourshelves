import React, { useState, useEffect } from "react";
import { FlatList, Modal, ScrollView, StyleSheet } from "react-native";
import { View, Text, Button, Image, YStack, XStack } from "tamagui";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { ToastViewport, useToastController } from "@tamagui/toast";

interface RockOutfit {
  id: string;
  name: string;
  imageUri: string;
  cost: number;
}

interface RockShopModalProps {
  onClose: () => void;
  ownedOutfits: string[];
  isVisible: boolean;
  onOutfitPurchased: (outfit: RockOutfit) => void;
}

export const RockShopModal: React.FC<RockShopModalProps> = ({
  onClose,
  ownedOutfits,
  isVisible,
  onOutfitPurchased,
}) => {
  const [outfits, setOutfits] = useState<RockOutfit[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [userData, setUserData] = useState<any>({});

  const toast = useToastController();

  useEffect(() => {
    const fetchOutfits = async () => {
      const outfitsCollection = collection(db, "RockOutfits");
      const outfitsSnapshot = await getDocs(outfitsCollection);
      const outfitsList = outfitsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as RockOutfit)
      );
      setOutfits(outfitsList);
    };
    const fetchUserCoins = async () => {
      const userRef = doc(db, "Users", auth.currentUser!.uid);
      const userDoc = await getDoc(userRef);
      const userCoins = userDoc.exists() ? userDoc.data()?.coins : 0;
      setUserCoins(userCoins);
      setUserData(userDoc.data());
      console.log(userCoins);
    };

    fetchUserCoins();
    fetchOutfits();
  }, []);

  const onPurchase = async (outfit: RockOutfit) => {
    if (userCoins < outfit.cost) {
      toast.show("Insufficent Coins", {
        duration: 2000,
        viewportName: "petrock",
      });
      return;
    }
    // Deduct coins from user
    const userRef = doc(db, "Users", auth.currentUser!.uid);
    await updateDoc(userRef, {
      coins: userCoins - outfit.cost,
    });
    setUserCoins(userCoins - outfit.cost);
    toast.show(outfit.name + " obtained!", {
      duration: 2000,
      viewportName: "petrock",
    });
    onOutfitPurchased(outfit);
  };

  const renderOutfitItem = (item: RockOutfit) => {
    const isOwned = ownedOutfits.includes(item.id);

    return (
      <XStack key={item.id} space padding="$2" alignItems="center">
        <Image
          source={{ uri: item.imageUri }}
          style={{ width: 50, height: 50 }}
          objectFit="contain"
        />
        <YStack flex={1}>
          <Text>{item.name}</Text>
          <Text>{item.cost} coins</Text>
        </YStack>
        <Button onPress={() => onPurchase(item)} disabled={isOwned}>
          {isOwned ? "Owned" : "Buy"}
        </Button>
      </XStack>
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <YStack backgroundColor="$pink6" style={styles.modalContent}>
            <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
              Rock Outfit Shop
            </Text>
            <Text>Coins: {userCoins} 🪙</Text>
            <ScrollView style={styles.scrollView}>
              {outfits.map(renderOutfitItem)}
            </ScrollView>
            <Button onPress={onClose} marginTop="$4">
              Close
            </Button>
          </YStack>
          <ToastViewport style={{
             position: "absolute",
             top: 50, // Adjust this for how far from the top you want
             left: 0,
             right: 0,
             alignItems: "center", // Center horizontally
             justifyContent: "flex-start",
          }} name="petrock" />
        </View>
        
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    height: "80%",
    // backgroundColor: "$pink6",
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
  scrollView: {
    width: "100%",
    marginBottom: 20,
  },
});
