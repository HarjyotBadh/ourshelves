import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const db = getFirestore();

export const dailyShopRefresh = onSchedule({
  schedule: "0 0 * * *", // This cron syntax means "every day at midnight"
  timeZone: "America/New_York", // Ensures the function runs at midnight Eastern Time
  retryCount: 3, // Optional: number of retry attempts if the function fails
}, async () => {
  await refreshShop();
});

/**
 * Refreshes the shop by selecting random items and updating shop metadata.
 */
export async function refreshShop() {
  const now = Timestamp.now();

  // Calculate the next midnight in Eastern Time
  const easternTime = new Date(now.toDate().toLocaleString("en-US", { timeZone: "America/New_York" }));
  easternTime.setDate(easternTime.getDate() + 1); // Move to the next day
  easternTime.setHours(4, 0, 0, 0); // Set to midnight (00:00:00.000)
  // lol actually setting to 4 am because time zones suck
  const nextRefresh = Timestamp.fromDate(easternTime);

  try {
    // Get all item IDs
    const itemsSnapshot = await db.collection("Items").get();
    const allItemIds = itemsSnapshot.docs.map((doc) => doc.id);

    // Get all wallpaper IDs
    const wallpapersSnapshot = await db.collection("Wallpapers").get();
    const allWallpaperIds = wallpapersSnapshot.docs.map((doc) => doc.id);

    // Get all shelf color IDs
    const shelfColorsSnapshot = await db.collection("ShelfColors").get();
    const allShelfColorIds = shelfColorsSnapshot.docs.map((doc) => doc.id);

    // Randomly select 6 items, 3 wallpapers, and 3 shelf colors
    const selectedItems = getRandomItems(allItemIds, 6);
    const selectedWallpapers = getRandomItems(allWallpaperIds, 3);
    const selectedShelfColors = getRandomItems(allShelfColorIds, 3);

    // Update shop metadata
    await db.doc("GlobalSettings/shopMetadata").set({
      lastRefresh: now,
      nextRefresh: nextRefresh,
      items: selectedItems,
      wallpapers: selectedWallpapers,
      shelfColors: selectedShelfColors,
    }, { merge: true });

  } catch (error) {
    console.error("Error refreshing shop:", error);
    throw new Error("Failed to refresh shop");
  }
}

/**
 * Selects random items from the given array.
 * @param {string[]} items - Array of item IDs.
 * @param {number} count - Number of items to select.
 * @return {string[]} Array of randomly selected item IDs.
 */
function getRandomItems(items: string[], count: number): string[] {
  const shuffled = items.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
