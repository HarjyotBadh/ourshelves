import { DocumentReference, Timestamp } from "firebase/firestore";

export interface PurchasedItem {
  id: string;
  userId: string;
  itemRef: DocumentReference;
  itemId: string;
  purchaseDate: Timestamp;
  name: string;
  cost: number;
  imageUri: string;
  shouldLock: boolean;
  styleId: string | null;
  styleName: string | null;
}
