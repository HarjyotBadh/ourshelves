import React from "react";

export interface PictureFrameItemData {
  id: string;
  itemId: string;
  name: string;
  imageUri: string;
  placedUserId: string;
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
  roomId: string;
}

export interface PictureFrameItemProps {
  itemData: PictureFrameItemData;
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: RoomInfo;
}

export interface PictureFrameItemComponent extends React.FC<PictureFrameItemProps> {
  getInitialData: () => { imageUri: string };
}

// You can add any additional interfaces or types specific to the PictureFrame here