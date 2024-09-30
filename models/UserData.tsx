import { DocumentReference, Timestamp } from "firebase/firestore";

export interface User {
  userId: string;
  coins: number;
  inventory: DocumentReference[];
  wallpapers: DocumentReference[];
  shelfColors: DocumentReference[];
  lastDailyGiftClaim: Timestamp | null;
}