import React, { useState, useEffect } from "react";
import { Dialog, Button, Text, YStack, XStack, ScrollView, styled, View } from "tamagui";
import { useToastController } from "@tamagui/toast";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "firebaseConfig";
import { loseCoins } from "project-functions/shopFunctions";
import { FoodItem, FOOD_ITEMS } from "models/FoodItem";

const StyledDialog = styled(Dialog.Content, {
  backgroundColor: "#DEB887",
  width: "90%",
  maxWidth: 800,
  padding: 0,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  overflow: "hidden",
});

const DialogTitle = styled(Text, {
  color: "white",
  backgroundColor: "#8B4513",
  padding: "$4",
  fontSize: 24,
  textAlign: "center",
  fontWeight: "bold",
});

const ContentContainer = styled(YStack, {
  padding: "$4",
});

const CoinsDisplay = styled(XStack, {
  backgroundColor: "#F5DEB3",
  paddingHorizontal: "$3",
  paddingVertical: "$2",
  borderRadius: "$4",
  borderWidth: 1,
  borderColor: "#8B4513",
  alignSelf: "center",
  alignItems: "center",
  marginBottom: "$4",
});

const FoodCard = styled(XStack, {
  backgroundColor: "#F5DEB3",
  padding: "$3",
  borderRadius: "$4",
  borderWidth: 1,
  borderColor: "#8B4513",
  alignItems: "center",
  gap: "$3",
  marginBottom: "$2",
});

const IconContainer = styled(YStack, {
  backgroundColor: "#DEB887",
  padding: "$2",
  borderRadius: "$3",
  borderWidth: 1,
  borderColor: "#8B4513",
});

const StyledButton = styled(Button, {
  backgroundColor: "#8B4513",
  color: "white",
  borderRadius: "$4",
  borderWidth: 2,
  borderColor: "#654321",
  
  variants: {
    selected: {
      true: {
        backgroundColor: "#654321",
      },
    },
    disabled: {
      true: {
        backgroundColor: "#D2B48C",
        borderColor: "#8B4513",
        opacity: 0.6,
      },
    },
  },
});

const BottomBar = styled(View, {
  height: 20,
  backgroundColor: "#8B4513",
  marginTop: "auto",
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
          <DialogTitle>Pet Food Shop</DialogTitle>
          <ContentContainer>
            <CoinsDisplay>
              <Text fontSize="$5" fontWeight="bold" color="#8B4513">
                {coins}
              </Text>
              <Text fontSize="$5" color="#8B4513"> 🪙</Text>
            </CoinsDisplay>

            <ScrollView maxHeight={400}>
              <YStack>
                {FOOD_ITEMS.map((food) => (
                  <FoodCard key={food.id}>
                    <IconContainer>
                      <food.icon size={32} color="#8B4513" />
                    </IconContainer>
                    <YStack flex={1}>
                      <Text fontWeight="bold" color="#8B4513">{food.name}</Text>
                      <Text fontSize="$2" color="#8B4513">{food.description}</Text>
                      <Text color="#8B4513">Feeding value: {food.feedValue}%</Text>
                    </YStack>
                    <StyledButton
                      disabled={!ownedFood.includes(food.id) && coins < food.cost}
                      selected={selectedFoodId === food.id}
                      onPress={() => 
                        ownedFood.includes(food.id) 
                          ? onSelectFood(food.id)
                          : handlePurchase(food)
                      }
                    >
                      <Text color="white">
                        {selectedFoodId === food.id 
                          ? "Selected" 
                          : ownedFood.includes(food.id) 
                            ? "Select" 
                            : coins < food.cost
                              ? "Not enough coins"
                              : `${food.cost} 🪙`
                        }
                      </Text>
                    </StyledButton>
                  </FoodCard>
                ))}
              </YStack>
            </ScrollView>

            <StyledButton onPress={() => onOpenChange(false)} marginTop="$4">
              <Text color="white">Close</Text>
            </StyledButton>
          </ContentContainer>
          <BottomBar />
        </StyledDialog>
      </Dialog.Portal>
    </Dialog>
  );
};
