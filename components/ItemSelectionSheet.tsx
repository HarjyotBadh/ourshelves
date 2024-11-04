import React, { useState, useEffect, useRef } from "react";
import {
  Sheet,
  YStack,
  XStack,
  ScrollView,
  Text,
  styled,
  AnimatePresence,
  Button,
  Input,
} from "tamagui";
import { ChevronDown, ChevronUp, ShoppingBag, Search } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import Item, { ItemData } from "./item";

interface ItemSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: ItemData) => void;
  items: ItemData[];
}

const ShelfContainer = styled(YStack, {
  backgroundColor: "#f0e4d7",
  borderRadius: 16,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 5,
  marginBottom: 16,
});

const ShelfRow = styled(XStack, {
  backgroundColor: "#8b4513",
  height: 8,
  width: "100%",
  marginTop: 10,
  borderRadius: 4,
});

const ItemWrapper = styled(YStack, {
  alignItems: "center",
  marginBottom: 10,
});

const CategoryHeader = styled(XStack, {
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 10,
  paddingHorizontal: 16,
  backgroundColor: "#d2b48c",
  borderRadius: 8,
  marginBottom: 10,
});

const EmptyStateContainer = styled(YStack, {
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  backgroundColor: "#f0e4d7",
  borderRadius: 16,
  marginTop: 20,
});

const SearchContainer = styled(XStack, {
  backgroundColor: "#d2b48c",
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
  alignItems: "center",
  gap: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
});

const ItemSelectionSheet: React.FC<ItemSelectionSheetProps> = ({
  isOpen,
  onClose,
  onSelectItem,
  items,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setExpandedItems([]);
      setSearchQuery("");
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isOpen]);

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const navigateToShop = () => {
    onClose();
    router.push("/(tabs)/shop");
  };

  const sortedAndFilteredItems = React.useMemo(() => {
    return items
      .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, searchQuery]);

  useEffect(() => {}, [isOpen]);

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={[90]}
      dismissOnSnapToBottom
      zIndex={100000}
    >
      <Sheet.Overlay />
      <Sheet.Frame backgroundColor="#f5deb3">
        <Sheet.Handle />
        <ScrollView ref={scrollViewRef}>
          <YStack padding="$4" gap="$4">
            <SearchContainer>
              <Search size={20} color="#8b4513" />
              <Input
                flex={1}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search items..."
                borderWidth={0}
                backgroundColor="transparent"
                fontSize={16}
                color="#8b4513"
                placeholderTextColor="#8b4513aa"
              />
            </SearchContainer>

            {sortedAndFilteredItems.length > 0 ? (
              sortedAndFilteredItems.map((item) => (
                <ShelfContainer key={item.itemId}>
                  <CategoryHeader onPress={() => toggleItem(item.itemId)}>
                    <Text fontSize={18} fontWeight="bold">
                      {item.name}
                    </Text>
                    {expandedItems.includes(item.itemId) ? <ChevronUp /> : <ChevronDown />}
                  </CategoryHeader>
                  <AnimatePresence>
                    {expandedItems.includes(item.itemId) && (
                      <YStack
                        animation="lazy"
                        enterStyle={{ opacity: 0, scale: 0.9 }}
                        exitStyle={{ opacity: 0, scale: 0.9 }}
                        opacity={1}
                        scale={1}
                      >
                        <ItemWrapper>
                          <Item
                            item={item}
                            onPress={() => {
                              onSelectItem(item);
                              onClose();
                            }}
                            showName={false}
                            showCost={false}
                          />
                        </ItemWrapper>
                        <ShelfRow />
                      </YStack>
                    )}
                  </AnimatePresence>
                </ShelfContainer>
              ))
            ) : (
              <EmptyStateContainer>
                <ShoppingBag size={64} color="#8b4513" />
                <Text
                  fontSize={24}
                  fontWeight="bold"
                  textAlign="center"
                  marginTop={16}
                  marginBottom={8}
                  color="black"
                >
                  No Items Available
                </Text>
                <Text fontSize={16} textAlign="center" marginBottom={16} color="black">
                  Your inventory is empty. Visit the shop to get some items!
                </Text>
                <Button backgroundColor="#8b4513" color="white" onPress={navigateToShop}>
                  Go to Shop
                </Button>
              </EmptyStateContainer>
            )}
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
};

export default ItemSelectionSheet;
