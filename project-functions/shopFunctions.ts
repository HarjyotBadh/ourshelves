import { getFirestore, doc, runTransaction, arrayUnion, Timestamp, DocumentReference, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';

// TODO: Remove this hardcoded userId and use the actual user's ID in production
const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder for testing

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
  userId: string;
  coins: number;
  inventory: DocumentReference[];
  wallpapers: DocumentReference[];
  shelfColors: DocumentReference[];
  lastDailyGiftClaim: Timestamp | null;
}

export const purchaseItem = async (item: Item, user: User): Promise<{ success: boolean; message: string; updatedUser: User | null }> => {
  const userRef = doc(db, "Users", userId); // Using hardcoded userId for testing

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        return { success: false, message: "User not found.", updatedUser: null };
      }

      const userData = userDoc.data() as User;

      if (userData.coins < item.cost) {
        return { success: false, message: `Not enough coins to purchase ${item.name}!`, updatedUser: null };
      }

      // Check if the user already owns the item
      const itemReference = doc(db, "Items", item.itemId);
      if (userData.inventory.some(ref => ref.path === itemReference.path)) {
        return { success: false, message: `You already own ${item.name}!`, updatedUser: null };
      }

      const updatedUser = {
        ...userData,
        coins: userData.coins - item.cost,
        inventory: [...userData.inventory, itemReference],
      };

      transaction.update(userRef, updatedUser);

      return { success: true, message: `Successfully purchased ${item.name}!`, updatedUser };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing item:", error);
    return { success: false, message: "Failed to purchase item. Please try again later.", updatedUser: null };
  }
};

export const purchaseWallpaper = async (wallpaper: WallpaperData, user: User): Promise<{ success: boolean; message: string; updatedUser: User | null }> => {
  const userRef = doc(db, "Users", userId); // Using hardcoded userId for testing

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        return { success: false, message: "User not found.", updatedUser: null };
      }

      const userData = userDoc.data() as User;

      if (userData.coins < wallpaper.cost) {
        return { success: false, message: `Not enough coins to purchase ${wallpaper.name}!`, updatedUser: null };
      }

      // Check if the user already owns the wallpaper
      const wallpaperReference = doc(db, "Wallpapers", wallpaper.id);
      if (userData.wallpapers.some(ref => ref.path === wallpaperReference.path)) {
        return { success: false, message: `You already own the ${wallpaper.name} wallpaper!`, updatedUser: null };
      }


      const updatedUser = {
        ...userData,
        coins: userData.coins - wallpaper.cost,
        wallpapers: [...userData.wallpapers, wallpaperReference],
      };

      transaction.update(userRef, updatedUser);

      return { success: true, message: `Successfully purchased ${wallpaper.name}!`, updatedUser };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing wallpaper:", error);
    return { success: false, message: "Failed to purchase wallpaper. Please try again later.", updatedUser: null };
  }
};

export const purchaseShelfColor = async (shelfColor: ShelfColorData, user: User): Promise<{ success: boolean; message: string; updatedUser: User | null }> => {
  const userRef = doc(db, "Users", userId); // Using hardcoded userId for testing

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        return { success: false, message: "User not found.", updatedUser: null };
      }

      const userData = userDoc.data() as User;

      if (userData.coins < shelfColor.cost) {
        return { success: false, message: `Not enough coins to purchase ${shelfColor.name}!`, updatedUser: null };
      }

      // Check if the user already owns the shelf color
      const shelfColorReference = doc(db, "ShelfColors", shelfColor.id);
      if (userData.shelfColors.some(ref => ref.path === shelfColorReference.path)) {
        return { success: false, message: `You already own the ${shelfColor.name} shelf color!`, updatedUser: null };
      }

      

      const updatedUser = {
        ...userData,
        coins: userData.coins - shelfColor.cost,
        shelfColors: [...userData.shelfColors, shelfColorReference],
      };

      transaction.update(userRef, updatedUser);

      return { success: true, message: `Successfully purchased ${shelfColor.name}!`, updatedUser };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing shelf color:", error);
    return { success: false, message: "Failed to purchase shelf color. Please try again later.", updatedUser: null };
  }
};

export const handleEarnCoins = async (user: User, amount: number = 50): Promise<{ success: boolean; message: string; updatedUser: User | null }> => {
  try {
    // const userDocRef = doc(db, "Users", user.userId);
    const userDocRef = doc(db, "Users", userId); // Using hardcoded userId for testing
    const newCoins = user.coins + amount;
    await updateDoc(userDocRef, { coins: newCoins });

    const updatedUser = { ...user, coins: newCoins };
    return { success: true, message: `You've earned ${amount} coins!`, updatedUser };
  } catch (error) {
    console.error("Error earning coins:", error);
    return { success: false, message: "Failed to earn coins. Please try again.", updatedUser: null };
  }
};

export const handleLoseCoins = async (user: User, amount: number = 50): Promise<{ success: boolean; message: string; updatedUser: User | null }> => {
  try {
    // const userDocRef = doc(db, "Users", user.userId);
    const userDocRef = doc(db, "Users", userId); // Using hardcoded userId for testing
    const newCoins = Math.max(0, user.coins - amount); // Ensure coins don't go below 0
    await updateDoc(userDocRef, { coins: newCoins });

    const updatedUser = { ...user, coins: newCoins };
    return { success: true, message: `You've lost ${amount} coins.`, updatedUser };
  } catch (error) {
    console.error("Error losing coins:", error);
    return { success: false, message: "Failed to lose coins. Please try again.", updatedUser: null };
  }
};

export const handleDailyGiftClaim = async (user: User): Promise<{ success: boolean; message: string; updatedUser: User | null }> => {
  try {
    // const userDocRef = doc(db, "Users", user.userId);
    const userDocRef = doc(db, "Users", userId); // Using hardcoded userId for testing
    const now = Timestamp.now();
    const newCoins = user.coins + 100;
    await updateDoc(userDocRef, {
      coins: newCoins,
      lastDailyGiftClaim: now,
    });

    const updatedUser = { ...user, coins: newCoins, lastDailyGiftClaim: now };
    return { success: true, message: "Daily gift claimed! You received 100 coins.", updatedUser };
  } catch (error) {
    console.error("Error claiming daily gift:", error);
    return { success: false, message: "Failed to claim daily gift. Please try again later.", updatedUser: null };
  }
};