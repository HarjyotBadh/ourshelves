import React from "react";

export interface MoodMeterItemData {
  id: string;
  itemId: string;
  name: string;
  imageUri: string;
  placedUserId: string;
  currentMood: string;
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

export interface MoodMeterItemProps {
  itemData: MoodMeterItemData;
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: RoomInfo;
}

export interface MoodMeterItemComponent extends React.FC<MoodMeterItemProps> {
  getInitialData: () => { 
    currentMood: string;
    imageUri: string;
  };
}

export const MOODS = [
  {
    id: 'happy',
    emoji: '😊',
    text: 'Happy'
  },
  {
    id: 'sad',
    emoji: '😢',
    text: 'Sad'
  },
  {
    id: 'angry',
    emoji: '😠',
    text: 'Angry'
  },
  {
    id: 'excited',
    emoji: '🤩',
    text: 'Excited'
  },
  {
    id: 'tired',
    emoji: '😴',
    text: 'Tired'
  }
];