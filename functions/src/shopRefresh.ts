import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  DocumentReference,
  getFirestore,
  Timestamp,
} from "firebase-admin/firestore";

const db = getFirestore();
const PAST_ITEMS_LIMIT = 12;
const ITEMS_PER_REFRESH = 6;
const WALLPAPERS_PER_REFRESH = 3;
const SHELF_COLORS_PER_REFRESH = 3;

interface ItemStyle {
  id: string;
  cost: number;
  imageUri: string;
}

interface ProcessedItem {
  ref: DocumentReference;
  styleData: ItemStyle | null;
}

interface ShopMetadata {
  lastRefresh: Timestamp;
  nextRefresh: Timestamp;
  items: ProcessedItem[];
  wallpapers: string[];
  shelfColors: string[];
  pastItems: string[];
}

/**
 * Scheduled function to refresh the shop daily
 */
export const dailyShopRefresh = onSchedule(
    {
      schedule: "0 0 * * *",
      timeZone: "America/New_York",
      retryCount: 3,
  },
  async () => {
    await refreshShop();
  }
);

/**
 * Gets random items from an array
 * @param {T[]} items - Array of items to choose from
 * @param {number} count - Number of items to select
 * @return {T[]} Array of randomly selected items
 */
function getRandomItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, items.length));
}

/**
 * Updates shop with styles for selected items
 * @param {DocumentReference[]} selectedItems - Selected item references
 * @param {string[]} newPastItems - New list of past items
 * @param {Timestamp} nextRefresh - Next refresh timestamp
 * @param {Timestamp} now - Current timestamp
 */
async function updateShopWithStyles(
  selectedItems: DocumentReference[],
  newPastItems: string[],
  nextRefresh: Timestamp,
  now: Timestamp
): Promise<void> {
  try {
    const [wallpapersSnapshot, shelfColorsSnapshot] = await Promise.all([
      db.collection("Wallpapers").get(),
      db.collection("ShelfColors").get(),
    ]);

    const allWallpaperIds: string[] = wallpapersSnapshot.docs.map(
      (doc) => doc.id
    );
    const allShelfColorIds: string[] = shelfColorsSnapshot.docs.map(
      (doc) => doc.id
    );

    const selectedWallpapers: string[] = getRandomItems(
      allWallpaperIds,
      WALLPAPERS_PER_REFRESH
    );
    const selectedShelfColors: string[] = getRandomItems(
      allShelfColorIds,
      SHELF_COLORS_PER_REFRESH
    );

    const processedItems: ProcessedItem[] = await Promise.all(
      selectedItems.map(async (itemRef): Promise<ProcessedItem> => {
        try {
          const stylesSnapshot = await itemRef.collection("styles").get();

          if (!stylesSnapshot.empty) {
            const styles = stylesSnapshot.docs;
            const randomStyle =
              styles[Math.floor(Math.random() * styles.length)];
            const styleData = randomStyle.data() as ItemStyle;

            return {
              ref: itemRef,
              styleData: {
                id: randomStyle.id,
                cost: styleData.cost,
                imageUri: styleData.imageUri,
              },
            };
          }

          return { ref: itemRef, styleData: null };
        } catch (error) {
          console.error(`Error processing item ${itemRef.id}:`, error);
          return { ref: itemRef, styleData: null };
        }
      })
    );

    const shopMetadata: ShopMetadata = {
      lastRefresh: now,
      nextRefresh,
      items: processedItems,
      wallpapers: selectedWallpapers,
      shelfColors: selectedShelfColors,
      pastItems: newPastItems,
    };

    await db.doc("GlobalSettings/shopMetadata").set(shopMetadata);
  } catch (error) {
    console.error("Error updating shop with styles:", error);
    throw new Error(
      `Failed to update shop with styles: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Refreshes the shop with new items
 * @return {Promise<{success: boolean}>} Success status
 */
export async function refreshShop(): Promise<{ success: boolean }> {
  const now = Timestamp.now();

  const easternTime = new Date(
    now.toDate().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  easternTime.setDate(easternTime.getDate() + 1);
  easternTime.setHours(4, 0, 0, 0);
  const nextRefresh = Timestamp.fromDate(easternTime);

  try {
    const shopMetadataDoc = await db.doc("GlobalSettings/shopMetadata").get();
    const currentMetadata = shopMetadataDoc.data() as ShopMetadata | undefined;
    const pastItems = currentMetadata?.pastItems || [];

    const itemsSnapshot = await db.collection("Items").get();
    const allItems = itemsSnapshot.docs;

    const availableItems = allItems.filter(
      (doc) => !pastItems.includes(doc.id)
    );

    if (availableItems.length < ITEMS_PER_REFRESH) {
      console.log(
        "Insufficient fresh items available, resetting past items list"
      );
      const selectedItems = getRandomItems(
        allItems.map((doc) => doc.ref),
        ITEMS_PER_REFRESH
      );
      const newPastItems = selectedItems.map((ref) => ref.id);
      await updateShopWithStyles(selectedItems, newPastItems, nextRefresh, now);
    } else {
      const selectedItems = getRandomItems(
        availableItems.map((doc) => doc.ref),
        ITEMS_PER_REFRESH
      );
      const newPastItems = [
        ...selectedItems.map((ref) => ref.id),
        ...pastItems,
      ].slice(0, PAST_ITEMS_LIMIT);

      await updateShopWithStyles(selectedItems, newPastItems, nextRefresh, now);
    }

    console.log("Shop refresh completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Error in shop refresh:", error);
    throw new Error(
      `Failed to refresh shop: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
