
export const soundEffectUrl = "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/sound-effects%2Fstart-stop-sound.mp3?alt=media&token=7c8ab84b-a711-4bbf-b66d-d96f66e4dd5e";
export interface BoomboxItemData {
  id: string;
  itemId: string;
  name: string;
  imageUri: string;
  trackId: string;
  trackUrl: string;
  [key: string]: any;
}

export interface BoomboxItemProps {
  itemData: BoomboxItemData;
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    id: string;
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
  };
}

export interface BoomboxItemComponent extends React.FC<BoomboxItemProps> {
  getInitialData: () => { trackId: string; trackUrl: string; };
}