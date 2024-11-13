import React from 'react';
import { FlatList, View } from 'react-native';
import { Button } from 'tamagui';
import Item, { ItemData } from './item';

interface ShopItemsListProps {
  items: ItemData[];
  userCoins: number;
  onPurchase: (item: ItemData) => void;
}


const ShopItemsList: React.FC<ShopItemsListProps> = ({ items, userCoins, onPurchase }) => {
  
  return (
    <FlatList
      data={items}
      renderItem={({ item }: { item: ItemData }) => (
        <View style={{ width: "30%", marginBottom: 16 }}>
          <Item item={item} showName={true} showCost={true} />
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
      keyExtractor={(item) => item.itemId}
      numColumns={3}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      scrollEnabled={false}
    />
  );
};

export default ShopItemsList;