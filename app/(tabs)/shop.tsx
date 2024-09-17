import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { Text, View, Button, XStack, YStack } from 'tamagui';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { purchaseItem } from 'functions/shopFunctions';
import { db } from "firebaseConfig";
import Item, { ItemData } from 'components/item';
import { format, toDate } from 'date-fns-tz';

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
  const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder

  const fetchShopMetadata = async () => {
    const shopMetadataRef = doc(db, 'GlobalSettings', 'shopMetadata');
    const shopMetadataDoc = await getDoc(shopMetadataRef);
    if (shopMetadataDoc.exists()) {
      return shopMetadataDoc.data() as ShopMetadata;
    }
    return null;
  };

  const updateShopMetadata = async (metadata: Partial<ShopMetadata>) => {
    const shopMetadataRef = doc(db, 'GlobalSettings', 'shopMetadata');
    await updateDoc(shopMetadataRef, metadata);
  };

  const getNextMidnightEST = () => {
    const timeZone = 'America/New_York'; // Eastern Time (ET), which handles DST automatically
    const now = new Date();
  
    // Convert the current date to Eastern Time
    const estNow = toDate(now, { timeZone });
  
    // Set to next midnight (00:00:00)
    const nextMidnight = new Date(estNow);
    nextMidnight.setHours(24, 0, 0, 0); // Move to midnight of the next day
  
    // Convert next midnight to the correct date format
    const estMidnightFormatted = format(nextMidnight, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone });
  
    // Return the formatted Date object
    return new Date(estMidnightFormatted);
  };

  const shopRefresh = async () => {
    const now = Timestamp.now();

    if (user) {
      const canClaim = checkCanClaimDailyGift(user, now);
      setCanClaimDailyGift(canClaim);
    }
  
    // Here you would typically fetch new items or update existing ones
    const itemsCollectionRef = collection(db, 'Items');
    const itemsSnapshot = await getDocs(itemsCollectionRef);
    const fetchedItems = itemsSnapshot.docs.map(doc => ({
      itemId: doc.id,
      ...doc.data()
    } as ItemData));
    setItems(fetchedItems);
  };

  const checkCanClaimDailyGift = (user: User, lastRefresh: Timestamp) => {
    return !user.lastDailyGiftClaim || user.lastDailyGiftClaim.toDate() < lastRefresh.toDate();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let shopMetadata = await fetchShopMetadata();
        const now = Timestamp.now();

        if (!shopMetadata || now.toDate() >= shopMetadata.nextRefresh.toDate()) {
          await shopRefresh();
          shopMetadata = await fetchShopMetadata();
        } else {
          const itemsCollectionRef = collection(db, 'Items');
          const itemsSnapshot = await getDocs(itemsCollectionRef);
          const fetchedItems = itemsSnapshot.docs.map(doc => ({
            itemId: doc.id,
            ...doc.data()
          } as ItemData));
          setItems(fetchedItems);

          setRefreshTime(Math.floor((shopMetadata.nextRefresh.toDate().getTime() - now.toDate().getTime()) / 1000));
        }

        // Fetch user data
        if (userId) {
          const userDocRef = doc(db, 'Users', userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);

            const canClaim = checkCanClaimDailyGift(userData, shopMetadata!.lastRefresh);
            setCanClaimDailyGift(canClaim);
          } else {
            throw new Error('User not found');
          }
        } else {
          throw new Error('User not authenticated');
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const getInitialRefreshTime = () => {
      const now = Timestamp.now().toDate();
      const nextRefresh = getNextMidnightEST();
      const timeDiffInSeconds = Math.floor((nextRefresh.getTime() - now.getTime()) / 1000);
      return timeDiffInSeconds > 0 ? timeDiffInSeconds : 24 * 60 * 60;
    };
  
    let initialRefreshTime = getInitialRefreshTime();
    setRefreshTime(initialRefreshTime);
  
    const timer = setInterval(() => {
      setRefreshTime((prevTime) => {
        if (prevTime <= 0) {
          shopRefresh(); // Call shopRefresh only when timer hits 0
          const now = Timestamp.now();
          const nextRefresh = getNextMidnightEST();
          updateShopMetadata({
            lastRefresh: now,
            nextRefresh: Timestamp.fromDate(nextRefresh),
          });
          return 24 * 60 * 60; // Reset timer to 24 hours
        }
        return prevTime - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer); // Clean up on unmount
  }, []);
  

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

  const handleRefreshNow = async () => {
    try {
      await shopRefresh(); // Directly call shopRefresh
      alert('Shop refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing shop:', error);
      alert('Failed to refresh shop. Please try again.');
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

        // Log the updated inventory to the console
        console.log("Updated Inventory:");
        updatedInventory.forEach((invItem, index) => {
          console.log(`${index + 1}. ${invItem.name} (ID: ${invItem.itemId})`);
        });
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

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text color="$red10">{error}</Text>;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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
                      "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/dailygift.png?alt=media&token=865d3646-df64-4d45-98f5-30d5713982de", // Replace with actual image URL
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
                <Button
                  onPress={handleDailyGiftClaim}
                  backgroundColor={canClaimDailyGift ? "$green8" : "$gray8"}
                  color="$white"
                  fontSize="$2"
                  marginTop="$1"
                >
                  {canClaimDailyGift ? "Claim" : "Claimed"}
                </Button>
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

      {/* Debug buttons */}
      <XStack justifyContent="space-between" marginTop="$4">
        <Button
          onPress={handleRefreshNow}
          backgroundColor="$orange8"
          color="$white"
          fontSize="$2"
          padding="$2"
        >
          Refresh Now
        </Button>
      </XStack>
    </YStack>
  );
}
