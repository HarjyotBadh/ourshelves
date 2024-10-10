import { DocumentReference, Timestamp } from "firebase/firestore";

export interface UserData {
  userId: string;
  coins: number;
  inventory: DocumentReference[];
  wallpapers: DocumentReference[];
  shelfColors: DocumentReference[];
  lastDailyGiftClaim: Timestamp | null;
  displayName: string;
  profilePicture?: string;
  aboutMe?: string;
}
