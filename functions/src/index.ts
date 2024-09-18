import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

admin.initializeApp();

export { dailyShopRefresh } from "./shopRefresh";
import { refreshShop } from "./shopRefresh";

export const refreshShopManually = onCall(async () => {
  try {
    await refreshShop();
    return { success: true, message: "Shop refreshed successfully" };
  } catch (error) {
    console.error("Error in manual shop refresh:", error);
    return { success: false, message: "Failed to refresh shop" };
  }
});
