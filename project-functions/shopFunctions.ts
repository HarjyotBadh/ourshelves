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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import { ItemData, WallpaperData, ShelfColorData } from "../models/RoomData";
import { PurchasedItem } from "models/PurchasedItem";
import { UserData } from "../models/UserData";

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
        where("itemRef", "==", doc(db, "Items", item.itemId))
      );
      const purchasedItemsSnapshot = await getDocs(purchasedItemsQuery);

      if (!purchasedItemsSnapshot.empty) {
        return {
          success: false,
          message: `You already own ${item.name}!`,
          updatedUser: null,
        };
      }

      // Create a new PurchasedItem document
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

export const handleEarnCoins = async (
  user: UserData,
  amount: number = 50
): Promise<{
  success: boolean;
  message: string;
  updatedUser: UserData | null;
}> => {
  try {
    // const userDocRef = doc(db, "Users", user.userId);
    const userId = getCurrentUserId();
    const userDocRef = doc(db, "Users", userId);
    const newCoins = user.coins + amount;
    await updateDoc(userDocRef, { coins: newCoins });

    const updatedUser = { ...user, coins: newCoins };
    return {
      success: true,
      message: `You've earned ${amount} coins!`,
      updatedUser,
    };
  } catch (error) {
    console.error("Error earning coins:", error);
    return {
      success: false,
      message: "Failed to earn coins. Please try again.",
      updatedUser: null,
    };
  }
};

export const handleLoseCoins = async (
  user: UserData,
  amount: number = 50
): Promise<{
  success: boolean;
  message: string;
  updatedUser: UserData | null;
}> => {
  try {
    // const userDocRef = doc(db, "Users", user.userId);
    const userId = getCurrentUserId();
    const userDocRef = doc(db, "Users", userId);
    const newCoins = Math.max(0, user.coins - amount); // Ensure coins don't go below 0
    await updateDoc(userDocRef, { coins: newCoins });

    const updatedUser = { ...user, coins: newCoins };
    return {
      success: true,
      message: `You've lost ${amount} coins.`,
      updatedUser,
    };
  } catch (error) {
    console.error("Error losing coins:", error);
    return {
      success: false,
      message: "Failed to lose coins. Please try again.",
      updatedUser: null,
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
