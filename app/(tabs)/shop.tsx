import React, { useState, useEffect, useCallback, useRef } from "react";
import { FlatList, Animated, Easing } from "react-native";
import { Image, Text, View, Button, XStack, YStack, useTheme, styled, Spinner, Progress } from "tamagui";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  DocumentReference,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { differenceInSeconds } from "date-fns";
import { db, functions } from "firebaseConfig";
import { purchaseItem } from "project-functions/shopFunctions";
import Item, { ItemData } from "components/item";
import { Loader2 } from "@tamagui/lucide-icons";

const BACKGROUND_COLOR = '$pink6';

// Interfaces
interface ShopMetadata {
  lastRefresh: Timestamp;
  nextRefresh: Timestamp;
  items: string[];
}

interface User {
  userId: string;
  coins: number;
  inventory: DocumentReference[];
  lastDailyGiftClaim: Timestamp | null;
}

async function fetchItemData(
  itemRef: DocumentReference
): Promise<ItemData | null> {
  const itemDoc = await getDoc(itemRef);
  if (itemDoc.exists()) {
    return { itemId: itemDoc.id, ...itemDoc.data() } as ItemData;
  }
  return null;
}

async function fetchInventoryItems(
  inventory: DocumentReference[]
): Promise<ItemData[]> {
  const inventoryItems = await Promise.all(inventory.map(fetchItemData));
  return inventoryItems.filter((item): item is ItemData => item !== null);
}

const preloadImages = async (items: ItemData[], setLoadingProgress: (progress: number) => void) => {
  const totalImages = items.length;
  let loadedImages = 0;

  const preloadPromises = items.map((item) => {
    return new Promise((resolve) => {
      Image.prefetch(item.imageUri)
        .then(() => {
          loadedImages++;
          setLoadingProgress((loadedImages / totalImages) * 100);
          resolve(null);
        })
        .catch(() => {
          loadedImages++;
          setLoadingProgress((loadedImages / totalImages) * 100);
          resolve(null);
        });
    });
  });

  await Promise.all(preloadPromises);
};

const LoadingContainer = styled(YStack, {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'BACKGROUND_COLOR',
  padding: 20,
});

export default function ShopScreen() {
  // State variables
  const [items, setItems] = useState<ItemData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState(0);
  const [canClaimDailyGift, setCanClaimDailyGift] = useState(false);
  const [dailyGiftTimer, setDailyGiftTimer] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [demoRefreshTime, setDemoRefreshTime] = useState<number | null>(null); //for sprint 1 testing
  const [isDemoMode, setIsDemoMode] = useState(false);

  // TODO: Replace with actual user authentication
  const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder

  // Fetch shop metadata from Firestore
  const fetchShopMetadata = async (): Promise<ShopMetadata | null> => {
    const shopMetadataRef = doc(db, "GlobalSettings", "shopMetadata");
    const shopMetadataDoc = await getDoc(shopMetadataRef);
    return shopMetadataDoc.exists()
      ? (shopMetadataDoc.data() as ShopMetadata)
      : null;
  };

  // Check if user can claim daily gift
  const checkCanClaimDailyGift = (user: User, lastRefresh: Date): boolean => {
    if (!user.lastDailyGiftClaim) return true;
    const lastClaimDate = user.lastDailyGiftClaim.toDate();
    return lastClaimDate < lastRefresh;
  };

  //for sprint 1 testing
  const handleDemoRefresh = () => {
    setDemoRefreshTime(10);
    setIsDemoMode(true);
  };

  // Fetch all necessary data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setError(null);

      const shopMetadata = await fetchShopMetadata();
      if (!shopMetadata) throw new Error("Shop metadata not found");

      const now = new Date();
      const nextRefreshDate = shopMetadata.nextRefresh.toDate();

      // Fetch items
      const itemsCollectionRef = collection(db, "Items");
      const itemsSnapshot = await getDocs(itemsCollectionRef);
      const allItems = itemsSnapshot.docs.map(
        (doc) =>
          ({
            itemId: doc.id,
            ...doc.data(),
          } as ItemData)
      );

      // Filter items based on shopMetadata.items
      const fetchedItems = allItems.filter((item) =>
        shopMetadata.items.includes(item.itemId)
      );
      await preloadImages(fetchedItems, setLoadingProgress);

      setItems(fetchedItems);


      // Fetch user data
      if (userId) {
        const userDocRef = doc(db, "Users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);

          updateDailyGiftStatus(
            userData,
            shopMetadata,
            setCanClaimDailyGift,
            setDailyGiftTimer
          );
        } else {
          throw new Error("User not found");
        }
      } else {
        throw new Error("User not authenticated");
      }

      // Set refresh timer
      const secondsUntilRefresh = differenceInSeconds(nextRefreshDate, now);
      setRefreshTime(secondsUntilRefresh > 0 ? secondsUntilRefresh : 0);

      // Add a short delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial data fetch and refresh timer setup
  useEffect(() => {
    fetchData();

    const timer = setInterval(() => {
      setRefreshTime((prevTime) => {
        if (prevTime <= 0) {
          fetchData();
          return 0;
        }
        return prevTime - 1;
      });

      setDailyGiftTimer((prevTime) => {
        if (prevTime <= 0) {
          setCanClaimDailyGift(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [fetchData]);

  //for sprint 1 testing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (demoRefreshTime !== null && demoRefreshTime > 0) {
      timer = setTimeout(() => {
        setDemoRefreshTime(demoRefreshTime - 1);
      }, 1000);
    } else if (demoRefreshTime === 0) {
      handleManualRefresh();
      setDemoRefreshTime(null);
      setIsDemoMode(false);
    }
    return () => clearTimeout(timer);
  }, [demoRefreshTime]);

  // Handle daily gift claim
  const handleDailyGiftClaim = async () => {
    if (!user || !canClaimDailyGift) return;

    try {
      const userDocRef = doc(db, "Users", userId);
      const now = Timestamp.now();
      const newCoins = user.coins + 100;
      await updateDoc(userDocRef, {
        coins: newCoins,
        lastDailyGiftClaim: now,
      });

      const updatedUser: User = {
        ...user,
        coins: newCoins,
        lastDailyGiftClaim: now,
      };

      setUser(updatedUser);

      // Fetch the current shop metadata
      const shopMetadata = await fetchShopMetadata();
      if (!shopMetadata) throw new Error("Shop metadata not found");

      // Update the daily gift status
      updateDailyGiftStatus(
        updatedUser,
        shopMetadata,
        setCanClaimDailyGift,
        setDailyGiftTimer
      );

      alert("Daily gift claimed! You received 100 coins.");
    } catch (error) {
      console.error("Error claiming daily gift:", error);
      alert("Failed to claim daily gift. Please try again later.");
    }
  };

  const updateDailyGiftStatus = (
    user: User,
    shopMetadata: ShopMetadata,
    setCanClaimDailyGift: (value: boolean) => void,
    setDailyGiftTimer: (value: number) => void
  ) => {
    const now = new Date();
    const lastRefreshDate = shopMetadata.lastRefresh.toDate();
    const nextRefreshDate = shopMetadata.nextRefresh.toDate();
    const canClaim = checkCanClaimDailyGift(user, lastRefreshDate);
    setCanClaimDailyGift(canClaim);

    if (!canClaim) {
      const secondsUntilNextClaim = differenceInSeconds(nextRefreshDate, now);
      setDailyGiftTimer(secondsUntilNextClaim > 0 ? secondsUntilNextClaim : 0);
    } else {
      setDailyGiftTimer(0);
    }
  };

  // Handle item purchase
  const handlePurchase = async (item: ItemData) => {
    if (!user) return;
    const inventoryItems = await fetchInventoryItems(user.inventory);
    if (inventoryItems.some((invItem) => invItem.itemId === item.itemId)) {
      return alert("You already own this item!");
    }
    const result = await purchaseItem(item);
    if (result.success) {
      // Update local state
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          coins: prevUser.coins - item.cost,
          inventory: [...prevUser.inventory, doc(db, "Items", item.itemId)],
        };
      });
      alert("Purchase successful!");
    } else {
      alert(result.message);
    }
  };

  // Handle earning coins (for testing purposes)
  const handleEarnCoins = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "Users", userId);
      const newCoins = user.coins + 50;
      await updateDoc(userDocRef, { coins: newCoins });

      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              coins: newCoins,
            }
          : null
      );

      alert("You've earned 50 coins!");
    } catch (error) {
      console.error("Error earning coins:", error);
      alert("Failed to earn coins. Please try again.");
    }
  };

  // Handle losing coins (for testing purposes)
  const handleLoseCoins = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "Users", userId);
      const newCoins = user.coins - 50;
      await updateDoc(userDocRef, { coins: newCoins });

      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              coins: newCoins,
            }
          : null
      );

      alert("oh...okay, you lost 50 coins.");
    } catch (error) {
      console.error("Error earning coins:", error);
      alert("Failed to lose coins. Please try again.");
    }
  };

  // Format time for display
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle manual shop refresh
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const refreshShop = httpsCallable(functions, "refreshShopManually");
      await refreshShop();
      await fetchData();
    } catch (error) {
      console.error("Error refreshing shop:", error);
      setError("Failed to refresh shop. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size="large" color="$blue10" />
        <Text fontSize={18} color="$blue10" marginTop={20} marginBottom={10}>
          Shop is loading...
        </Text>
        <Progress value={loadingProgress} width={200}>
          <Progress.Indicator animation="bouncy" backgroundColor="$blue10" />
        </Progress>
      </LoadingContainer>
    );
  }

  if (error) {
    return <Text color="$red10">{error}</Text>;
  }

  return (
    <YStack flex={1} padding="$4" backgroundColor="$pink6">
      <Text
        fontSize="$8"
        fontWeight="bold"
        textAlign="center"
        marginBottom="$2"
      >
        OurShelves
      </Text>
      <Text
        fontSize="$6"
        fontWeight="bold"
        textAlign="center"
        marginBottom="$4"
      >
        Shop
      </Text>
      {user && (
        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginBottom="$4"
        >
          <Text fontSize="$4" fontWeight="bold">
            🪙 {user.coins}
          </Text>
          <Button
            onPress={handleLoseCoins}
            backgroundColor="$red8"
            color="$white"
            fontSize="$1"
            paddingHorizontal="$2"
            paddingVertical="$1"
          >
            -50 Coins (Test)
          </Button>
          <Button
            onPress={handleEarnCoins}
            backgroundColor="$blue8"
            color="$white"
            fontSize="$1"
            paddingHorizontal="$2"
            paddingVertical="$1"
          >
            +50 Coins (Test)
          </Button>
        </XStack>
      )}
      <FlatList
        data={[{ isDailyGift: true }, ...items]}
        renderItem={({ item }: { item: ItemData | { isDailyGift: true } }) => {
          if ("isDailyGift" in item) {
            return (
              <View width="30%" marginBottom="$4">
                <Item
                  item={{
                    itemId: "daily-gift",
                    name: "Daily Gift",
                    imageUri:
                      "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/items%2Fdailygift.png?alt=media&token=46ad85b5-9fb5-4ef0-b32f-1894091e82f3",
                    cost: 0,
                  }}
                  showName={true}
                  showCost={false}
                />
                <View
                  height={20}
                  marginTop="$1"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text fontSize="$2" color="$yellow10">
                    Free!
                  </Text>
                </View>
                {canClaimDailyGift ? (
                  <Button
                    onPress={handleDailyGiftClaim}
                    backgroundColor="$green8"
                    color="$white"
                    fontSize="$2"
                    marginTop="$1"
                  >
                    Claim
                  </Button>
                ) : (
                  <Text fontSize="$2" textAlign="center" marginTop="$1">
                    {isDemoMode ? `Demo: ${formatTime(demoRefreshTime)}` : formatTime(dailyGiftTimer)}
                  </Text>
                )}
              </View>
            );
          }
          return (
            <View width="30%" marginBottom="$4">
              <Item item={item} showName={true} showCost={true} />
              <Button
                onPress={() => handlePurchase(item)}
                backgroundColor={
                  user && user.coins >= item.cost ? "$green8" : "$red8"
                }
                color="$white"
                fontSize="$2"
                marginTop="$1"
              >
                Buy
              </Button>
            </View>
          );
        }}
        keyExtractor={(item, index) =>
          "isDailyGift" in item ? "daily-gift" : item.itemId
        }
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
      <Text fontSize="$4" textAlign="center" marginTop="$4">
        Shop Refreshes In:
      </Text>
      <Text
        fontSize="$5"
        fontWeight="bold"
        textAlign="center"
        marginBottom="$4"
      >
        {isDemoMode ? `Demo: ${formatTime(demoRefreshTime)}` : formatTime(refreshTime)}
      </Text>
      <XStack justifyContent="space-between" marginTop="$4">
        <Button
          onPress={handleManualRefresh}
          backgroundColor="$orange8"
          color="$white"
          fontSize="$3"
          flex={1}
          marginRight="$2"
        >
          Refresh Shop
        </Button>
        <Button
          onPress={handleDemoRefresh}
          backgroundColor="$purple8"
          color="$white"
          fontSize="$3"
          flex={1}
          marginLeft="$2"
          disabled={demoRefreshTime !== null}
        >
          Demo Refresh (10s)
        </Button>
      </XStack>
    </YStack>
  );
}
