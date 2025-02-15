import { DocumentReference } from "firebase/firestore";

export interface ShelfData {
  id: string;
  roomId: string;
  position: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  itemList: DocumentReference[];
  placedItems?: PlacedItemData[];
  isPersonalShelf?: boolean;
  ownerId?: string;
}

export interface PlacedItemData {
  id: string;
  roomId: string;
  shelfId: string;
  itemId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  shouldLock: boolean;
  itemData: Record<string, any>;
  placedUserId: string;
}

export interface ItemData {
  itemId: string;
  name: string;
  imageUri: string;
  cost: number;
  shouldLock: boolean;
  styleId: string | null;
  styleName: string | null;
  [key: string]: any;
}

export interface ShelfColorData {
  id: string;
  name: string;
  cost: number;
  color: string;
  description?: string;
}

export interface WallpaperData {
  id: string;
  name: string;
  cost: number;
  gradientColors: string[];
  description?: string;
}
