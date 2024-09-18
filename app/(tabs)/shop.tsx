import React, { useState, useEffect, useCallback } from 'react';
import { FlatList } from 'react-native';
import { Text, View, Button, XStack, YStack } from 'tamagui';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { purchaseItem } from 'project-functions/shopFunctions';
import { db } from "firebaseConfig";
import Item, { ItemData } from 'components/item';
import { differenceInSeconds } from 'date-fns';

interface ShopMetadata {
  lastRefresh: Timestamp;
  nextRefresh: Timestamp;
}

interface User {
  userId: string;
  coins: number;
  inventory: ItemData[];
  lastDailyGiftClaim: Timestamp | null;
}

export default function ShopScreen() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState(0);
  const [canClaimDailyGift, setCanClaimDailyGift] = useState(false);
  const [dailyGiftTimer, setDailyGiftTimer] = useState(0);
  const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder

  const fetchShopMetadata = async () => {
    const shopMetadataRef = doc(db, 'GlobalSettings', 'shopMetadata');
    const shopMetadataDoc = await getDoc(shopMetadataRef);
    if (shopMetadataDoc.exists()) {
      return shopMetadataDoc.data() as ShopMetadata;
    }
    return null;
  };

  const checkCanClaimDailyGift = (user: User, lastRefresh: Date) => {
    if (!user.lastDailyGiftClaim) return true;
    const lastClaimDate = user.lastDailyGiftClaim.toDate();
    return lastClaimDate < lastRefresh;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const shopMetadata = await fetchShopMetadata();
      if (!shopMetadata) throw new Error('Shop metadata not found');

      const now = new Date();
      const nextRefreshDate = shopMetadata.nextRefresh.toDate();

      // Fetch items
      const itemsCollectionRef = collection(db, 'Items');
      const itemsSnapshot = await getDocs(itemsCollectionRef);
      const fetchedItems = itemsSnapshot.docs.map(doc => ({
        itemId: doc.id,
        ...doc.data()
      } as ItemData));
      setItems(fetchedItems);

      // Fetch user data
      if (userId) {
        const userDocRef = doc(db, 'Users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);

          const lastRefreshDate = shopMetadata.lastRefresh.toDate();
          const canClaim = checkCanClaimDailyGift(userData, lastRefreshDate);
          setCanClaimDailyGift(canClaim);

          if (!canClaim) {
            const secondsUntilNextClaim = differenceInSeconds(nextRefreshDate, now);
            setDailyGiftTimer(secondsUntilNextClaim > 0 ? secondsUntilNextClaim : 0);
          }
        } else {
          throw new Error('User not found');
        }
      } else {
        throw new Error('User not authenticated');
      }

      // Set refresh timer
      const secondsUntilRefresh = differenceInSeconds(nextRefreshDate, now);
      setRefreshTime(secondsUntilRefresh > 0 ? secondsUntilRefresh : 0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
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

  const handleDailyGiftClaim = async () => {
    if (!user || !canClaimDailyGift) return;

    try {
      const userDocRef = doc(db, 'Users', userId);
      const now = Timestamp.now();
      const newCoins = user.coins + 100;
      await updateDoc(userDocRef, {
        coins: newCoins,
        lastDailyGiftClaim: now,
      });

      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          coins: newCoins,
          lastDailyGiftClaim: now,
        };
      });

      setCanClaimDailyGift(false);
      alert("Daily gift claimed! You received 100 coins.");
    } catch (error) {
      console.error("Error claiming daily gift:", error);
      alert("Failed to claim daily gift. Please try again later.");
    }
  };

  const handlePurchase = async (item: ItemData) => {
    if (!user) return;
    if (user.inventory.some(invItem => invItem.itemId === item.itemId)) {
      return alert("You already own this item!");
    }
    const result = await purchaseItem(item);
    if (result.success) {
      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedInventory = [...prevUser.inventory, item];
        return {
          ...prevUser,
          coins: prevUser.coins - item.cost,
          inventory: updatedInventory,
        };
      });
      alert("Purchase successful!");
    } else {
      alert(result.message);
    }
  };

  const handleEarnCoins = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "Users", userId);
      const newCoins = user.coins + 50;
      await updateDoc(userDocRef, { coins: newCoins });

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          coins: newCoins,
        };
      });

      alert("You've earned 50 coins!");
    } catch (error) {
      console.error("Error earning coins:", error);
      alert("Failed to earn coins. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const refreshItems = async () => {
    const itemsCollectionRef = collection(db, 'Items');
    const itemsSnapshot = await getDocs(itemsCollectionRef);
    const fetchedItems = itemsSnapshot.docs.map(doc => ({
      itemId: doc.id,
      ...doc.data()
    } as ItemData));
    setItems(fetchedItems);
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      await refreshItems();
      setCanClaimDailyGift(true);
    } catch (error) {
      console.error("Error refreshing shop:", error);
      setError("Failed to refresh shop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
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
        renderItem={({ item }) => {
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
                    {formatTime(dailyGiftTimer)}
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
        {formatTime(refreshTime)}
      </Text>
      <Button
        onPress={handleManualRefresh}
        backgroundColor="$orange8"
        color="$white"
        fontSize="$3"
        marginTop="$4"
      >
        Refresh Shop
      </Button>
    </YStack>
  );
}