import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { Text, View, Button, Image, YStack } from 'tamagui';
//import { useAuth } from '../path/to/your/auth/hook'; // You'll need to create this
import { db } from "firebaseConfig.js";
import { doc, getDoc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';

interface Item {
    itemId: string;
    coinCost: number;
    imageUri: string;
    name: string;
}

interface PurchasedItem extends Item {
  purchaseDate: Date;
}

interface User {
  userId: string;
  coins: number;
  inventory: PurchasedItem[];
}

export default function ShopScreen() {
    const [item, setItem] = useState<Item | null>(null);
    const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const { userId } = useAuth(); // Assuming you have an auth hook
  const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the specific item from Firestore
        const itemDocRef = doc(db, 'Items', '9ngGTOJz71VI1gLMkGEe');
        const itemDoc = await getDoc(itemDocRef);
        if (itemDoc.exists()) {
          const itemData = itemDoc.data();
          const fetchedItem: Item = {
            itemId: itemDoc.id,
            coinCost: itemData.coinCost,
            imageUri: itemData.imageUri,
            name: itemData.name,
          };
          setItem(fetchedItem);
        } else {
          throw new Error('Item not found');
        }

        // Fetch user data
        if (userId) {
            const userDocRef = doc(db, 'Users', userId);
            const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const fetchedUser: User = {
              userId: userDoc.id,
              coins: userData.coins,
              inventory: userData.inventory || [],
            };
            setUser(fetchedUser);
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

  const handlePurchase = async () => {
    if (!user || !item) return;

    if (user.coins < item.coinCost) {
      setError('Not enough coins!');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error('User not found');
        }

        const userData = userDoc.data() as User;

        if (userData.coins < item.coinCost) {
          throw new Error('Not enough coins');
        }

        const purchasedItem: PurchasedItem = {
          ...item,
          purchaseDate: new Date(),
        };

        transaction.update(userRef, {
          coins: userData.coins - item.coinCost,
          inventory: arrayUnion(purchasedItem),
        });
      });

      // Update local user state
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          coins: prevUser.coins - item.coinCost,
          inventory: [...prevUser.inventory, { ...item, purchaseDate: new Date() }],
        };
      });

      alert('Item purchased successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    <View flex={1} padding="$4">
      <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
        Shop
      </Text>
      {user && (
        <Text fontSize="$4" marginBottom="$4">
          Your Coins: {user.coins}
        </Text>
      )}
      {item && (
        <YStack gap="$2" alignItems="center">
          <Image source={{ uri: item.imageUri }} width={100} height={100} />
          <Text fontSize="$5">{item.name}</Text>
          <Text>{item.coinCost} coins</Text>
          <Button onPress={handlePurchase}>Buy</Button>
        </YStack>
      )}
    </View>
  );
}