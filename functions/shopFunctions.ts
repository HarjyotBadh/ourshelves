import { getFirestore, doc, runTransaction, arrayUnion, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Item {
  itemId: string;
  cost: number;
  imageUri: string;
  name: string;
}

interface PurchasedItem extends Item {
  purchaseDate: Timestamp;
}

interface User {
  coins: number;
  inventory: PurchasedItem[];
}

export const purchaseItem = async (item: Item): Promise<{ success: boolean; message: string }> => {
  const auth = getAuth();
  const db = getFirestore();

  // For now, we're using a placeholder userId. In a real app, you'd use auth.currentUser.uid
  const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder
  const userRef = doc(db, "Users", userId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        return { success: false, message: "User not found." };
      }

      const userData = userDoc.data() as User;

      if (userData.coins < item.cost) {
        return { success: false, message: `Not enough coins to purchase ${item.name}!` };
      }

      const purchasedItem: PurchasedItem = {
        ...item,
        purchaseDate: Timestamp.now(),
      };

      transaction.update(userRef, {
        coins: userData.coins - item.cost,
        inventory: arrayUnion(purchasedItem),
      });

      return { success: true, message: `Successfully purchased ${item.name}!` };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing item:", error);
    return { success: false, message: "Failed to purchase item. Please try again later." };
  }
};