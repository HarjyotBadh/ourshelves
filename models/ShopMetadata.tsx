import { DocumentReference, Timestamp } from "firebase/firestore";

interface ShopItemWithStyle {
  ref: DocumentReference;
  styleData: {
    id: string;
    cost: number;
    imageUri: string;
  } | null;
}
export interface ShopMetadata {
  lastRefresh: Timestamp;
  nextRefresh: Timestamp;
  items: ShopItemWithStyle[];
  wallpapers: string[];
  shelfColors: string[];
  pastItems: string[];
}