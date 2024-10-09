import { DocumentReference, Timestamp } from "firebase/firestore";

export interface ShopMetadata {
  lastRefresh: Timestamp;
  nextRefresh: Timestamp;
  items: DocumentReference[];
  wallpapers: string[];
  shelfColors: string[];
}