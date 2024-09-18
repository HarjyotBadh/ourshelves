import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const db = getFirestore();

export const dailyShopRefresh = onSchedule({
  schedule: "0 0 * * *", // This cron syntax means "every day at midnight"
  timeZone: "America/New_York", // Ensures the function runs at midnight Eastern Time
  retryCount: 3, // Optional: number of retry attempts if the function fails
}, async () => {
  const now = Timestamp.now();

  // Calculate the next midnight EST
  const nextMidnight = new Date();
  nextMidnight.setDate(nextMidnight.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);
  const nextRefresh = Timestamp.fromDate(nextMidnight);

  try {
    // Update shop metadata
    await db.doc("GlobalSettings/shopMetadata").set({
      lastRefresh: now,
      nextRefresh: nextRefresh,
    }, { merge: true });

    // Here you can add logic to update shop items if needed
    // For example:
    // await updateShopItems();

    console.log("Shop refreshed successfully");
  } catch (error) {
    console.error("Error refreshing shop:", error);
    throw new Error("Failed to refresh shop");
  }
});

// Optional: Function to update shop items
// async function updateShopItems() {
//   // Implement logic to update items in the shop
//   // This could involve fetching from a pool of items,
//   // randomizing selections, updating prices, etc.
// }
