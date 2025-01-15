import React from 'react';
import { Text, XStack, Button } from 'tamagui';

interface ShopHeaderProps {
  coins: number;
  onEarnCoins: () => void;
  onLoseCoins: () => void;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ coins, onEarnCoins, onLoseCoins }) => {
  return (
    <>
      <Text
        fontSize="$8"
        fontWeight="bold"
        textAlign="center"
        marginBottom="$2"
      >
        OurShelves
      </Text>
      <Text
        fontSize="$6"
        fontWeight="bold"
        textAlign="center"
        marginBottom="$4"
      >
        Shop
      </Text>
      <XStack
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$4"
      >
        <Text fontSize="$4" fontWeight="bold">
          🪙 {coins}
        </Text>
        {/* <Button
          onPress={onLoseCoins}
          backgroundColor="$red8"
          color="$white"
          fontSize="$1"
          paddingHorizontal="$2"
          paddingVertical="$1"
        >
          -50 Coins (Test)
        </Button>
        <Button
          onPress={onEarnCoins}
          backgroundColor="$blue8"
          color="$white"
          fontSize="$1"
          paddingHorizontal="$2"
          paddingVertical="$1"
        >
          +50 Coins (Test)
        </Button> */}
      </XStack>
    </>
  );
};

export default ShopHeader;