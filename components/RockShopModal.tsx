import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { View, Text, Button, Image, YStack, XStack, Dialog } from "tamagui";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { RockShopModalProps, RockOutfit } from "models/PetRockModel";
import { rockShopStyles } from "styles/PetRockStyles";

export const RockShopModal: React.FC<RockShopModalProps> = ({
  onClose,
  ownedOutfits,
  isVisible,
  onOutfitPurchased,
  userCoins,
  onCoinUpdate,
}) => {
  const [outfits, setOutfits] = useState<RockOutfit[]>([]);
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

    fetchOutfits();
  }, []);

  const onPurchase = async (outfit: RockOutfit) => {
    if (userCoins < outfit.cost) {
      toast.show("Insufficient Coins", {
        duration: 2000,
        viewportName: "rock-shop",
      });
      return;
    }
    // Deduct coins from user
    const userRef = doc(db, "Users", auth.currentUser!.uid);
    await updateDoc(userRef, {
      coins: userCoins - outfit.cost,
    });
    onCoinUpdate(userCoins - outfit.cost);
    toast.show(outfit.name + " obtained!", {
      duration: 2000,
      viewportName: "rock-shop",
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
        <Button
          onPress={() => onPurchase(item)}
          disabled={isOwned}
          backgroundColor={isOwned ? "$gray8" : "$blue9"}
        >
          <Text color="white">{isOwned ? "Owned" : "Buy"}</Text>
        </Button>
      </XStack>
    );
  };

  return (
    <Dialog modal open={isVisible} onOpenChange={(open) => !open && onClose()}>
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
          backgroundColor="$pink6"
          width="80%"
          maxWidth={500}
          maxHeight="80%"
        >
          <YStack padding="$4" space>
            <Text fontSize="$6" fontWeight="bold" color="white">
              Rock Outfit Shop
            </Text>
            <Text fontSize="$4" color="white">
              Coins: {userCoins} 🪙
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <YStack space="$2">{outfits.map(renderOutfitItem)}</YStack>
            </ScrollView>
            <Button onPress={onClose} marginTop="$4" backgroundColor="$red10">
              <Text color="white">Close</Text>
            </Button>
          </YStack>
          <ToastViewport
            name="rock-shop"
            style={{
              position: "absolute",
              top: 50,
              left: 0,
              right: 0,
              alignItems: "center",
              justifyContent: "flex-start",
              zIndex: 1000,
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
