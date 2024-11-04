import React, { useState, useEffect } from "react";
import { Dialog, Button, Text, YStack, XStack, ScrollView, styled } from "tamagui";
import { useToastController } from "@tamagui/toast";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "firebaseConfig";
import { loseCoins } from "project-functions/shopFunctions";
import { FoodItem, FOOD_ITEMS } from "models/FoodItem";

const StyledDialog = styled(Dialog.Content, {
  backgroundColor: "$blue2",
  borderRadius: "$6",
  paddingVertical: "$3",
  paddingHorizontal: "$3",
  width: "90%",
  maxWidth: 420,
  borderWidth: 2,
  borderColor: "$blue6",
});

const FoodCard = styled(XStack, {
  backgroundColor: "$blue4",
  padding: "$3",
  borderRadius: "$4",
  borderWidth: 1,
  borderColor: "$blue6",
  alignItems: "center",
  gap: "$3",
});

interface FoodShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFoodId?: string;
  onSelectFood: (foodId: string) => void;
}

export const FoodShopDialog: React.FC<FoodShopDialogProps> = ({ 
  open, 
  onOpenChange, 
  selectedFoodId,
  onSelectFood 
}) => {
  const [ownedFood, setOwnedFood] = useState<string[]>([]);
  const [coins, setCoins] = useState<number>(0);
  const toast = useToastController();

  useEffect(() => {
    fetchOwnedFood();
    fetchCoins();
  }, [open]);

  const fetchCoins = async () => {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, "Users", auth.currentUser.uid));
    if (userDoc.exists()) {
      setCoins(userDoc.data().coins || 0);
    }
  };

  const fetchOwnedFood = async () => {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, "Users", auth.currentUser.uid));
    if (userDoc.exists()) {
      // Add basic_kibble to the initial food list if it doesn't exist
      const foodList = userDoc.data().foodList || ["basic_kibble"];
      setOwnedFood(foodList);
    } else {
      // If it's a new user, they still get basic_kibble
      setOwnedFood(["basic_kibble"]);
    }
  };

  const handlePurchase = async (food: FoodItem) => {
    if (!auth.currentUser) return;

    try {
      const result = await loseCoins(auth.currentUser.uid, food.cost);

      if (!result.success) {
        toast.show(result.message, {
          backgroundColor: "$red9",
        });
        return;
      }

      const userRef = doc(db, "Users", auth.currentUser.uid);
      await updateDoc(userRef, {
        foodList: arrayUnion(food.id),
      });

      setOwnedFood([...ownedFood, food.id]);

      toast.show("Food purchased successfully!", {
        backgroundColor: "$green9",
      });
    } catch (error) {
      toast.show("Failed to purchase food", {
        backgroundColor: "$red9",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <StyledDialog>
          <YStack space="$4">
            <YStack space="$2">
              <Text fontSize="$6" fontWeight="bold" textAlign="center">
                Pet Food Shop
              </Text>
              <XStack 
                backgroundColor="$blue4" 
                paddingHorizontal="$3" 
                paddingVertical="$2" 
                borderRadius="$4"
                borderWidth={1}
                borderColor="$blue6"
                alignSelf="center"
                alignItems="center"
                space="$2"
              >
                <Text fontSize="$5" fontWeight="bold" color="$blue11">
                  {coins}
                </Text>
                <Text fontSize="$5" color="$blue11">
                  🪙
                </Text>
              </XStack>
            </YStack>
            
            <ScrollView maxHeight={400}>
              <YStack space="$2">
                {FOOD_ITEMS.map((food) => (
                  <FoodCard key={food.id}>
                    <YStack
                      backgroundColor="$blue3"
                      padding="$2"
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor="$blue6"
                    >
                      <food.icon size={32} color="$blue10" />
                    </YStack>
                    <YStack flex={1}>
                      <Text fontWeight="bold">{food.name}</Text>
                      <Text fontSize="$2">{food.description}</Text>
                      <Text color="$blue11">Feeding value: {food.feedValue}%</Text>
                    </YStack>
                    <Button
                      // Only disable if we don't own it AND don't have enough coins
                      disabled={!ownedFood.includes(food.id) && coins < food.cost}
                      onPress={() => ownedFood.includes(food.id) 
                        ? onSelectFood(food.id)
                        : handlePurchase(food)
                      }
                      backgroundColor={
                        selectedFoodId === food.id 
                          ? "$blue9" 
                          : ownedFood.includes(food.id) 
                            ? "$green9" 
                            : coins < food.cost
                              ? "$red9"
                              : "$gray8"
                      }
                    >
                      {selectedFoodId === food.id 
                        ? "Selected" 
                        : ownedFood.includes(food.id) 
                          ? "Select" 
                          : coins < food.cost
                            ? "Not enough coins"
                            : `${food.cost} 🪙`
                      }
                    </Button>
                  </FoodCard>
                ))}
              </YStack>
            </ScrollView>
            <Button onPress={() => onOpenChange(false)}>Close</Button>
          </YStack>
        </StyledDialog>
      </Dialog.Portal>
    </Dialog>
  );
};
