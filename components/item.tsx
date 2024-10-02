import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View, Image } from 'tamagui';

export interface ItemData {
  itemId: string;
  name: string;
  imageUri: string;
  cost: number;
  shouldLock: boolean;
  [key: string]: any;
}

interface ItemProps {
  item: ItemData;
  onPress?: (item: ItemData) => void;
  showName?: boolean;
  showCost?: boolean;
}

const Item: React.FC<ItemProps> = ({ item, onPress, showName = true, showCost = false }) => {
  return (
    <TouchableOpacity onPress={() => onPress && onPress(item)}>
      <View padding="$2" alignItems="center">
        {showName && (
          <Text fontSize="$3" marginTop="$1">
            {item.name}
          </Text>
        )}
        <Image 
          source={{ uri: item.imageUri }} 
          style={{ width: 80, height: 80, borderRadius: 10 }} 
          objectFit="cover"
        />
        {showCost && (
          <Text fontSize="$2" color="$yellow10" marginTop="$1">
            {item.cost} 🪙
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Item;