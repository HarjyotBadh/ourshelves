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
    getInitialData: () => { trackId: string; trackUrl: string };
  }