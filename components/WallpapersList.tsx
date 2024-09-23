import React from 'react';
import { FlatList, View } from 'react-native';
import { Text, Button } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

interface WallpaperData {
  id: string;
  name: string;
  cost: number;
  gradientColors: string[];
}

interface WallpapersListProps {
  wallpapers: WallpaperData[];
  userCoins: number;
  onPurchase: (wallpaper: WallpaperData) => void;
}

const WallpapersList: React.FC<WallpapersListProps> = ({ wallpapers, userCoins, onPurchase }) => {
  return (
    <FlatList
      data={wallpapers}
      renderItem={({ item }: { item: WallpaperData }) => (
        <View style={{ width: "30%", marginBottom: 16, alignItems: "center" }}>
          <LinearGradient
            width={80}
            height={80}
            borderRadius={40}
            colors={item.gradientColors}
          />
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

export default WallpapersList;