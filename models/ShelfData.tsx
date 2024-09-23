import { DocumentReference } from 'firebase/firestore';
import { PlacedItemData } from './PlacedItemData';

export interface ShelfData {
    id: string;
    roomId: string;
    position: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    itemList: DocumentReference[];
    placedItems?: PlacedItemData[];
}