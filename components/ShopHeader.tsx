import React from "react";
import { Text, XStack } from "tamagui";

interface ShopHeaderProps {
  coins: number;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ coins }) => {
  return (
    <>
      <Text fontSize="$8" fontWeight="bold" textAlign="center" marginBottom="$2">
        OurShelves
      </Text>
      <Text fontSize="$6" fontWeight="bold" textAlign="center" marginBottom="$4">
        Shop
      </Text>
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
        <Text fontSize="$4" fontWeight="bold">
          🪙 {coins}
        </Text>
      </XStack>
    </>
  );
};

export default ShopHeader;
