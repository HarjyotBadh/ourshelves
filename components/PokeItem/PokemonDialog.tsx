import React from "react";
import { Text, YStack, Image, Dialog, Button } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import { Timestamp } from "firebase/firestore";

interface PokemonDialogProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    hatched: boolean;
    interactionCount: number;
    nextInteractionTime: Timestamp | Date;
    pokemon?: {
      pokemonId: number;
      name: string;
      imageUri: string;
      types: string[];
    };
    [key: string]: any;
  };
  onClose: () => void;
  onDataUpdate: (data: any) => void;
}

const PokemonDialog: React.FC<PokemonDialogProps> = ({ itemData, onClose, onDataUpdate }) => {
  return (
    <Dialog.Content
      bordered
      elevate
      key="content"
      animation={[
        "quick",
        {
          opacity: {
            overshootClamping: true,
          },
        },
      ]}
      enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
      exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
      x={0}
      scale={1}
      opacity={1}
      y={0}
    >
      <LinearGradient
        colors={["#4F94CD", "#87CEFA"]}
        start={[0, 0]}
        end={[1, 1]}
        borderRadius={10}
        padding={20}
      >
        <YStack gap="$4" maxWidth={500} alignItems="center">
          <Dialog.Title>
            <Text
              fontSize={28}
              fontWeight="bold"
              color="#FFDE00"
              style={{
                textShadowColor: "#3B4CCA",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {itemData.pokemon?.name
                ? itemData.pokemon.name.charAt(0).toUpperCase() + itemData.pokemon.name.slice(1)
                : "Unknown Pokémon"}
            </Text>
          </Dialog.Title>
          <Image
            source={{ uri: itemData.pokemon?.imageUri || itemData.imageUri }}
            width={220}
            height={220}
            objectFit="contain"
          />
          <Text color="#FFFFFF" fontSize={24} fontWeight="bold" textAlign="center">
            {itemData.pokemon?.name || "Unknown Pokémon"}
          </Text>
          <Text color="#FFFFFF" fontSize={18} textAlign="center">
            Types: {itemData.pokemon?.types.join(", ") || "Unknown"}
          </Text>
          <Text color="#FFFFFF" fontSize={16} textAlign="center">
            Pokémon ID: {itemData.pokemon?.pokemonId || "Unknown"}
          </Text>
          <Text color="#FFFFFF" fontSize={16} textAlign="center">
            Item ID: {itemData.itemId}
          </Text>
          <Dialog.Close asChild>
            <Button
              onPress={onClose}
              backgroundColor="#FF0000"
              color="#FFFFFF"
              borderRadius="$4"
              fontSize={18}
              fontWeight="bold"
              paddingVertical="$2"
              paddingHorizontal="$4"
              hoverStyle={{ backgroundColor: "#FF3333" }}
              pressStyle={{ scale: 0.95 }}
            >
              Close
            </Button>
          </Dialog.Close>
        </YStack>
      </LinearGradient>
    </Dialog.Content>
  );
};

export default PokemonDialog;
