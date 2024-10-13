import { Timestamp } from "firebase/firestore";

export interface PathData {
  path: string;
  color: string;
}

export interface WhiteboardItemData {
  name: string;
  imageUri: string;
  id: string;
  paths: PathData[];
}

export interface RoomUser {
  id: string;
  displayName: string;
  profilePicture?: string;
  isAdmin: boolean;
}

export interface RoomInfo {
  name: string;
  users: RoomUser[];
  description: string;
}

export interface WhiteboardItemProps {
  itemData: WhiteboardItemData;
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: RoomInfo;
}

export interface WhiteboardItemComponent extends React.FC<WhiteboardItemProps> {
  getInitialData: () => { paths: PathData[] };
}