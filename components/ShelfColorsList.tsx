import React from 'react';
import { FlatList, View } from 'react-native';
import { Text, Button, Circle } from 'tamagui';

interface ShelfColorData {
  id: string;
  name: string;
  cost: number;
  color: string;
}

interface ShelfColorsListProps {
  shelfColors: ShelfColorData[];
  userCoins: number;
  onPurchase: (shelfColor: ShelfColorData) => void;
}

const ShelfColorsList: React.FC<ShelfColorsListProps> = ({ shelfColors, userCoins, onPurchase }) => {
  return (
    <FlatList
      data={shelfColors}
      renderItem={({ item }: { item: ShelfColorData }) => (
        <View style={{ width: "30%", marginBottom: 16, alignItems: "center" }}>
          <Circle size={80} backgroundColor={item.color} />
          <Text fontSize="$2" marginTop="$1">{item.name}</Text>
          <Text fontSize="$2" color="$yellow10">{item.cost} 🪙</Text>
          <Button
            onPress={() => onPurchase(item)}
            backgroundColor={userCoins >= item.cost ? "$green8" : "$red8"}
            color="$white"
            fontSize="$2"
            marginTop="$1"
          >
            Buy
          </Button>
        </View>
      )}
      keyExtractor={(item) => item.id}
      numColumns={3}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      scrollEnabled={false}
    />
  );
};

export default ShelfColorsList;