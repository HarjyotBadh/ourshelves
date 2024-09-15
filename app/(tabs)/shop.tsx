import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { Text, View, Button } from 'tamagui';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { purchaseItem } from 'functions/shopFunctions';
import db from "firebaseConfig";
import Item, { ItemData } from 'components/item';

interface User {
  userId: string;
  coins: number;
  inventory: ItemData[];
}

export default function ShopScreen() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState(0);
  const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch items from Firestore
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
            const userData = userDoc.data();
            setUser({
              userId: userDoc.id,
              coins: userData.coins,
              inventory: userData.inventory || [],
            });
          } else {
            throw new Error('User not found');
          }
        } else {
          throw new Error('User not authenticated');
        }

        // Set refresh time (24 hours from now)
        setRefreshTime(24 * 60 * 60);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePurchase = async (item: ItemData) => {
    if (!user) return;

    const result = await purchaseItem(item);
    if (result.success) {
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          coins: prevUser.coins - item.cost,
          inventory: [...prevUser.inventory, item],
        };
      });
      alert("Purchase successful!");
    } else {
      alert(result.message);
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
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View flex={1} padding="$4" backgroundColor="$pink6">
      <Text fontSize="$8" fontWeight="bold" textAlign="center" marginBottom="$2">
        OurShelves
      </Text>
      <Text fontSize="$6" fontWeight="bold" textAlign="center" marginBottom="$4">
        Shop
      </Text>
      {user && (
        <Text fontSize="$4" fontWeight="bold" marginBottom="$4">
          🪙 {user.coins}
        </Text>
      )}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View width="30%" marginBottom="$4">
            <Item
              item={item}
              showName={true}
              showCost={true}
            />
            <Button
              onPress={() => handlePurchase(item)}
              backgroundColor={user && user.coins >= item.cost ? '$green8' : '$red8'}
              color="$white"
              fontSize="$2"
              marginTop="$1"
            >
              Buy
            </Button>
          </View>
        )}
        keyExtractor={(item) => item.itemId}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
      <Text fontSize="$4" textAlign="center" marginTop="$4">
        Shop Refreshes In:
      </Text>
      <Text fontSize="$5" fontWeight="bold" textAlign="center">
        {formatTime(refreshTime)}
      </Text>
    </View>
  );
}