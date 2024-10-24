export interface Event {
  title: string;
  date: string;
}

export interface CalendarItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    currentDate?: string;
    events?: Event[];
    [key: string]: any;
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    id: string;
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  };
}

export interface CalendarItemComponent extends React.FC<CalendarItemProps> {
  getInitialData: () => { currentDate: string; events: Event[] };
}
