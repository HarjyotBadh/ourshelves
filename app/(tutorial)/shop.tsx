// app/tutorial/shop.tsx
import React, { useState } from "react";
import { ScrollView } from "react-native";
import {
  Text,
  YStack,
  styled,
  Dialog,
  Button,
  XStack,
} from "tamagui";
import { useRouter } from "expo-router";
import { auth, db } from "firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { ItemData } from "components/item";
import ShopHeader from "components/ShopHeader";
import ShopItemsList from "components/ShopItemsList";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ShopContainer = styled(ScrollView, {
  flex: 1,
  backgroundColor: "$pink6",
});

const ContentContainer = styled(YStack, {
  padding: "$4",
});

const TUTORIAL_ITEMS: ItemData[] = [
  {
    itemId: "SoPRqkDt7BchhwihkqRN",
    name: "Test Item",
    imageUri: "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/items%2FTestSquare.png?alt=media&token=437e78d2-88e6-4f1e-979a-0d4b39f8e8bb",
    cost: 50,
    shouldLock: false,
    styleId: "defaultStyle",
    styleName: "Tutorial Item",
  },
];

export default function TutorialShop() {
  const router = useRouter();
  const [dialogConfig, setDialogConfig] = useState<{
    show: boolean;
    title: string;
    description: string;
    action: string;
    onAction: () => void;
  }>({
    show: true,
    title: "Welcome to the Shop!",
    description: "Here you can buy items for your room. You have 100 coins to start!",
    action: "Next",
    onAction: () => showSelectItemDialog(),
  });
  const [purchasedItem, setPurchasedItem] = useState(false);

  const showSelectItemDialog = () => {
    setDialogConfig({
      show: true,
      title: "Select an Item",
      description: "Choose an item you'd like to purchase. Each item costs 50 coins.",
      action: "Got it",
      onAction: () => setDialogConfig(prev => ({ ...prev, show: false }))
    });
  };

  const showCompletedDialog = () => {
    setDialogConfig({
      show: true,
      title: "Great Purchase!",
      description: "Now let's head back to your room to place your new item!",
      action: "Return Home",
      onAction: () => {
        setDialogConfig(prev => ({ ...prev, show: false }));
        // Use setTimeout to ensure dialog is fully closed before navigation
        setTimeout(() => {
          router.push({
            pathname: "/(tutorial)/home",
            params: { from: 'shop' }
          });
        }, 100);
      }
    });
  };

  const handlePurchase = async (item: ItemData) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        inventory: arrayUnion(doc(db, "PurchasedItems", item.itemId)),
        coins: 50, // Set coins to 50 after purchase
      });

      setPurchasedItem(true);
      showCompletedDialog();
    } catch (error) {
      console.error("Error in tutorial purchase:", error);
    }
  };

  return (
    <ShopContainer>
      <ContentContainer>
        <ShopHeader
          coins={purchasedItem ? 50 : 100}
          onEarnCoins={() => {}}
          onLoseCoins={() => {}}
        />

        <ShopItemsList
          items={TUTORIAL_ITEMS}
          userCoins={purchasedItem ? 50 : 100}
          onPurchase={handlePurchase}
        />

        {dialogConfig.show && (
          <Dialog modal open={dialogConfig.show} onOpenChange={(open) => {
            setDialogConfig(prev => ({ ...prev, show: open }));
          }}>
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
              >
                <Dialog.Title>{dialogConfig.title}</Dialog.Title>
                <Dialog.Description>{dialogConfig.description}</Dialog.Description>
                <YStack ai="flex-end" mt="$4">
                  <Button 
                    theme="blue" 
                    onPress={dialogConfig.onAction}
                  >
                    {dialogConfig.action}
                  </Button>
                </YStack>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog>
        )}
      </ContentContainer>
    </ShopContainer>
  );
}