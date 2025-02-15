import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Path as SvgPath } from 'react-native-svg';

import { Text } from "tamagui";

export interface PathData {
  path: string;
  color: string;
  strokeWidth: number;
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

export const EraserIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 299.289 299.289">
    <SvgPath
      d="M290.422,79.244L220.034,8.857c-11.794-11.795-30.986-11.795-42.78,0C175.866,10.245,12.971,173.14,8.867,177.244 c-11.822,11.821-11.824,30.957,0,42.78l70.388,70.388c11.821,11.822,30.957,11.824,42.78,0 c1.046-1.046,165.357-165.357,168.388-168.388C302.244,110.203,302.246,91.066,290.422,79.244z M110.367,278.744 c-5.374,5.373-14.071,5.373-19.446,0l-70.388-70.388c-5.373-5.374-5.375-14.071,0-19.446l34.61-34.61l89.834,89.834 L110.367,278.744z M278.755,110.357l-122.111,122.11l-89.833-89.833l122.11-122.111c5.374-5.374,14.071-5.374,19.446,0 l70.388,70.388C284.129,96.285,284.129,104.983,278.755,110.357z"
      fill="#000000"
    />
  </Svg>
);