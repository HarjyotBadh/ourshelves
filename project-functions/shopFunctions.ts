import { getFirestore, doc, runTransaction, arrayUnion, Timestamp, DocumentReference } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Item {
  itemId: string;
  cost: number;
  imageUri: string;
  name: string;
}

interface WallpaperData {
  id: string;
  name: string;
  cost: number;
  gradientColors: string[];
  description?: string;
}

interface ShelfColorData {
  id: string;
  name: string;
  cost: number;
  color: string;
  description?: string;
}

interface User {
  coins: number;
  inventory: DocumentReference[];
  wallpapers: DocumentReference[];
  shelfColors: DocumentReference[];
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

      const itemReference = doc(db, "Items", item.itemId); // Create a DocumentReference to the item

      transaction.update(userRef, {
        coins: userData.coins - item.cost,
        inventory: arrayUnion(itemReference),
      });

      return { success: true, message: `Successfully purchased ${item.name}!` };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing item:", error);
    return { success: false, message: "Failed to purchase item. Please try again later." };
  }
};

export const purchaseWallpaper = async (wallpaper: WallpaperData): Promise<{ success: boolean; message: string }> => {
  const db = getFirestore();
  const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder
  const userRef = doc(db, "Users", userId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        return { success: false, message: "User not found." };
      }

      const userData = userDoc.data() as User;

      if (userData.coins < wallpaper.cost) {
        return { success: false, message: `Not enough coins to purchase ${wallpaper.name}!` };
      }

      const wallpaperReference = doc(db, "Wallpapers", wallpaper.id);

      transaction.update(userRef, {
        coins: userData.coins - wallpaper.cost,
        wallpapers: arrayUnion(wallpaperReference),
      });

      return { success: true, message: `Successfully purchased ${wallpaper.name}!` };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing wallpaper:", error);
    return { success: false, message: "Failed to purchase wallpaper. Please try again later." };
  }
};

export const purchaseShelfColor = async (shelfColor: ShelfColorData): Promise<{ success: boolean; message: string }> => {
  const db = getFirestore();
  const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder
  const userRef = doc(db, "Users", userId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        return { success: false, message: "User not found." };
      }

      const userData = userDoc.data() as User;

      if (userData.coins < shelfColor.cost) {
        return { success: false, message: `Not enough coins to purchase ${shelfColor.name}!` };
      }

      const shelfColorReference = doc(db, "ShelfColors", shelfColor.id);

      transaction.update(userRef, {
        coins: userData.coins - shelfColor.cost,
        shelfColors: arrayUnion(shelfColorReference),
      });

      return { success: true, message: `Successfully purchased ${shelfColor.name}!` };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing shelf color:", error);
    return { success: false, message: "Failed to purchase shelf color. Please try again later." };
  }
};