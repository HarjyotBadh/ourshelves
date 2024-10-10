import { DocumentReference, Timestamp } from "firebase/firestore";

export interface PurchasedItem {
  id: string;
  userId: string;
  itemRef: DocumentReference;
  purchaseDate: Timestamp;
  name: string;
  cost: number;
  imageUri: string;
  // Add any other relevant item data here
}
