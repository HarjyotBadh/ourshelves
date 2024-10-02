import { Timestamp } from "firebase/firestore";

export interface ShopMetadata {
  lastRefresh: Timestamp;
  nextRefresh: Timestamp;
  items: string[];
  wallpapers: string[];
  shelfColors: string[];
}