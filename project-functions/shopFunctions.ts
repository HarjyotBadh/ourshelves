import {
  getFirestore,
  doc,
  runTransaction,
  arrayUnion,
  Timestamp,
  DocumentReference,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  getDoc,
  increment,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import { ItemData, WallpaperData, ShelfColorData } from "../models/RoomData";
import { PurchasedItem } from "models/PurchasedItem";
import { UserData } from "../models/UserData";
import { useToastController } from "@tamagui/toast";

const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");
  return user.uid;
};

export const purchaseItem = async (
  item: ItemData,
  user: UserData
): Promise<{
  success: boolean;
  message: string;
  updatedUser: UserData | null;
}> => {
  const userId = getCurrentUserId();
  const userRef = doc(db, "Users", userId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          message: "User not found.",
          updatedUser: null,
        };
      }

      const userData = userDoc.data() as UserData;

      if (userData.coins < item.cost) {
        return {
          success: false,
          message: `Not enough coins to purchase ${item.name}!`,
          updatedUser: null,
        };
      }

      const purchasedItemsQuery = query(
        collection(db, "PurchasedItems"),
        where("userId", "==", userRef.id),
        where("itemRef", "==", doc(db, "Items", item.itemId)),
        where("styleId", "==", item.styleId || null) // Add style check
      );
      
      const purchasedItemsSnapshot = await getDocs(purchasedItemsQuery);

      // Check if user already owns this specific style of the item
      if (!purchasedItemsSnapshot.empty) {
        return {
          success: false,
          message: `You already own this version of ${item.name}!`,
          updatedUser: null,
        };
      }

      // Create a new PurchasedItem document with style information
      const purchasedItemRef = doc(collection(db, "PurchasedItems"));
      const purchasedItemData: PurchasedItem = {
        id: purchasedItemRef.id,
        userId: userRef.id,
        itemRef: doc(db, "Items", item.itemId),
        itemId: item.itemId,
        purchaseDate: Timestamp.now(),
        name: item.name,
        cost: item.cost,
        imageUri: item.imageUri,
        shouldLock: item.shouldLock || false,
        styleId: item.styleId || null,  // Store the style ID if it exists
      };

      transaction.set(purchasedItemRef, purchasedItemData);

      const updatedUser = {
        ...userData,
        coins: userData.coins - item.cost,
        inventory: [...userData.inventory, purchasedItemRef],
      };

      transaction.update(userRef, updatedUser);

      return {
        success: true,
        message: `Successfully purchased ${item.name}!`,
        updatedUser,
      };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing item:", error);
    return {
      success: false,
      message: "Failed to purchase item. Please try again later.",
      updatedUser: null,
    };
  }
};

export const purchaseWallpaper = async (
  wallpaper: WallpaperData,
  user: UserData
): Promise<{
  success: boolean;
  message: string;
  updatedUser: UserData | null;
}> => {
  const userId = getCurrentUserId();
  const userRef = doc(db, "Users", userId);
  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          message: "User not found.",
          updatedUser: null,
        };
      }

      const userData = userDoc.data() as UserData;

      if (userData.coins < wallpaper.cost) {
        return {
          success: false,
          message: `Not enough coins to purchase ${wallpaper.name}!`,
          updatedUser: null,
        };
      }

      // Check if the user already owns the wallpaper
      const wallpaperReference = doc(db, "Wallpapers", wallpaper.id);
      if (userData.wallpapers.some((ref) => ref.path === wallpaperReference.path)) {
        return {
          success: false,
          message: `You already own the ${wallpaper.name} wallpaper!`,
          updatedUser: null,
        };
      }

      const updatedUser = {
        ...userData,
        coins: userData.coins - wallpaper.cost,
        wallpapers: [...userData.wallpapers, wallpaperReference],
      };

      transaction.update(userRef, updatedUser);

      return {
        success: true,
        message: `Successfully purchased ${wallpaper.name}!`,
        updatedUser,
      };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing wallpaper:", error);
    return {
      success: false,
      message: "Failed to purchase wallpaper. Please try again later.",
      updatedUser: null,
    };
  }
};

export const purchaseShelfColor = async (
  shelfColor: ShelfColorData,
  user: UserData
): Promise<{
  success: boolean;
  message: string;
  updatedUser: UserData | null;
}> => {
  const userId = getCurrentUserId();
  const userRef = doc(db, "Users", userId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          message: "User not found.",
          updatedUser: null,
        };
      }

      const userData = userDoc.data() as UserData;

      if (userData.coins < shelfColor.cost) {
        return {
          success: false,
          message: `Not enough coins to purchase ${shelfColor.name}!`,
          updatedUser: null,
        };
      }

      // Check if the user already owns the shelf color
      const shelfColorReference = doc(db, "ShelfColors", shelfColor.id);
      if (userData.shelfColors.some((ref) => ref.path === shelfColorReference.path)) {
        return {
          success: false,
          message: `You already own the ${shelfColor.name} shelf color!`,
          updatedUser: null,
        };
      }

      const updatedUser = {
        ...userData,
        coins: userData.coins - shelfColor.cost,
        shelfColors: [...userData.shelfColors, shelfColorReference],
      };

      transaction.update(userRef, updatedUser);

      return {
        success: true,
        message: `Successfully purchased ${shelfColor.name}!`,
        updatedUser,
      };
    });

    return result;
  } catch (error) {
    console.error("Error purchasing shelf color:", error);
    return {
      success: false,
      message: "Failed to purchase shelf color. Please try again later.",
      updatedUser: null,
    };
  }
};

export const earnCoins = async (
  userId: string,
  amount: number
): Promise<{
  success: boolean;
  message: string;
  newCoins: number | null;
}> => {
  try {
    const userDocRef = doc(db, "Users", userId);
    
    // Use increment to atomically update the coins field
    await updateDoc(userDocRef, { coins: increment(amount) });
    
    // Fetch the updated user document to get the new coin amount
    const updatedUserDoc = await getDoc(userDocRef);
    const newCoins = updatedUserDoc.data()?.coins;
    return {
      success: true,
      message: `You've earned ${amount} coins!`,
      newCoins,
    };
  } catch (error) {
    console.error("Error earning coins:", error);
    return {
      success: false,
      message: "Failed to earn coins. Please try again.",
      newCoins: null,
    };
  }
};

export const loseCoins = async (
  userId: string,
  amount: number
): Promise<{
  success: boolean;
  message: string;
  newCoins: number | null;
}> => {
  try {
    const userDocRef = doc(db, "Users", userId);
    
    // First, get the current coin amount
    const userDoc = await getDoc(userDocRef);
    const currentCoins = userDoc.data()?.coins || 0;
    
    // Calculate new coin amount, ensuring it doesn't go below 0
    const newCoins = Math.max(0, currentCoins - amount);
    
    // Update the user document with the new coin amount
    await updateDoc(userDocRef, { coins: newCoins });

    return {
      success: true,
      message: `You've lost ${amount} coins.`,
      newCoins,
    };
  } catch (error) {
    console.error("Error losing coins:", error);
    return {
      success: false,
      message: "Failed to lose coins. Please try again.",
      newCoins: null,
    };
  }
};

export const handleDailyGiftClaim = async (
  user: UserData
): Promise<{
  success: boolean;
  message: string;
  updatedUser: UserData | null;
}> => {
  try {
    // const userDocRef = doc(db, "Users", user.userId);
    const userId = getCurrentUserId();
    const userDocRef = doc(db, "Users", userId);
    const now = Timestamp.now();
    const newCoins = user.coins + 100;
    await updateDoc(userDocRef, {
      coins: newCoins,
      lastDailyGiftClaim: now,
    });

    const updatedUser = { ...user, coins: newCoins, lastDailyGiftClaim: now };
    return {
      success: true,
      message: "Daily gift claimed! You received 100 coins.",
      updatedUser,
    };
  } catch (error) {
    console.error("Error claiming daily gift:", error);
    return {
      success: false,
      message: "Failed to claim daily gift. Please try again later.",
      updatedUser: null,
    };
  }
};
