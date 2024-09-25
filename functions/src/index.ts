/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {CallableRequest, onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface Item {
    itemId: string;
    cost: number;
    imageUri: string;
    name: string;
  }
  
  interface PurchasedItem extends Item {
    purchaseDate: Date;
  }

  export const purchaseItem = functions.https.onCall(async (request: CallableRequest<{ item: Item }>) => {
    const data = request.data;
      // Ensure the user is authenticated
      // if (!context.auth) {
      //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to purchase items.');
      // }
    
      // const userId = context.auth.uid;
      const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder
      const item: Item = data.item;
    
      // Reference to the user document
      const userRef = admin.firestore().collection('Users').doc(userId);
    
      try {
        // Run the purchase logic in a transaction to ensure data consistency
        await admin.firestore().runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
    
          if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found.');
          }
    
          const userData = userDoc.data();
          if (!userData) {
            throw new functions.https.HttpsError('internal', 'User data is null.');
          }
    
          // Check if user has enough coins
          if (userData.coins < item.cost) {
            throw new functions.https.HttpsError('failed-precondition', 'Not enough coins to purchase this item.');
          }
    
          // Create the purchased item object
          const purchasedItem: PurchasedItem = {
            ...item,
            purchaseDate: new Date(admin.firestore.Timestamp.now().toMillis()),
          };
    
          // Update user document: deduct coins and add item to inventory
          transaction.update(userRef, {
            coins: admin.firestore.FieldValue.increment(-item.cost),
            inventory: admin.firestore.FieldValue.arrayUnion(purchasedItem),
          });
        });
    
        return { success: true, message: 'Item purchased successfully.' };
      } catch (error) {
        console.error('Error purchasing item:', error);
        throw new functions.https.HttpsError('internal', 'Failed to purchase item. Please try again later.');
      }
    });

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
