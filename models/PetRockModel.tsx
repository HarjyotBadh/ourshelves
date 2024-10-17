import { DocumentReference } from "firebase/firestore";

export interface RockOutfit {
  id: string;
  name: string;
  cost: number;
  imageUri: string;
}

export interface PetRockItemData {
  id: string;
  itemId: string;
  name: string;
  imageUri: string;
  outfits?: RockOutfit[];
  currentOutfitIndex?: number;
  [key: string]: any;
}

export interface PetRockItemProps {
  itemData: PetRockItemData;
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
}

export interface PetRockItemComponent extends React.FC<PetRockItemProps> {
  getInitialData: () => { outfits: RockOutfit[]; currentOutfitIndex: number };
}

export interface RockShopModalProps {
  onClose: () => void;
  ownedOutfits: string[];
  isVisible: boolean;
  onOutfitPurchased: (outfit: RockOutfit) => void;
}