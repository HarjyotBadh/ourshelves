
import { ReactNode } from 'react';

export interface PageData {
    text: string;
}

export interface StorybookItemData {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    pages: PageData[];
}

export interface StorybookItemProps {
    itemData: StorybookItemData;
    onDataUpdate: (newItemData: StorybookItemData) => void;
    isActive: boolean;
    onClose: () => void;
}

export interface StorybookItemComponent extends React.FC<StorybookItemProps> {
    getInitialData: () => { pages: PageData[] };
}