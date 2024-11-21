import React, { useEffect, useState } from "react";
import { YStack, Text, Button } from "tamagui";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { TouchableOpacity } from "react-native";
import { Menu } from "@tamagui/lucide-icons";
import { HEADER_BACKGROUND, USER_ITEM_BACKGROUND } from "../styles/RoomSettingsStyles";

interface ShelfItem {
  id: string;
  name: string;
  position: number;
}

interface DraggableShelfListProps {
  shelves: ShelfItem[];
  onReorder: (newOrder: { id: string; position: number }[]) => void;
  onClose: () => void;
}

export const DraggableShelfList: React.FC<DraggableShelfListProps> = ({
  shelves,
  onReorder,
  onClose,
}) => {
  // Create a deep copy of the shelves array
  const [localData, setLocalData] = useState<ShelfItem[]>([]);

  // Update localData when shelves prop changes
  useEffect(() => {
    setLocalData([...shelves].sort((a, b) => a.position - b.position));
  }, [shelves]);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ShelfItem>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={{
            backgroundColor: isActive ? HEADER_BACKGROUND : USER_ITEM_BACKGROUND,
            padding: 16,
            marginVertical: 4,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Menu color={isActive ? "white" : "black"} size={24} style={{ marginRight: 12 }} />
          <Text color={isActive ? "white" : "black"} flex={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const handleDragEnd = ({ data: newData }: { data: ShelfItem[] }) => {
    const updatedOrder = newData.map((item, index) => ({
      id: item.id,
      position: index,
    }));
    setLocalData(newData);
    onReorder(updatedOrder);
  };

  return (
    <YStack flex={1}>
      <Text textAlign="center" color="black" marginBottom="$4">
        Press and hold a shelf to drag it to a new position
      </Text>
      <YStack flex={1} marginBottom="$4">
        <DraggableFlatList
          data={localData}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          containerStyle={{ flex: 1 }}
        />
      </YStack>
      <Button
        onPress={onClose}
        backgroundColor={HEADER_BACKGROUND}
        color="white"
      >
        Done
      </Button>
    </YStack>
  );
};
