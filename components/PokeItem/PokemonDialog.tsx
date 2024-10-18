import React from "react";
import {
  Text,
  YStack,
  Image,
  Dialog,
  Button,
} from "tamagui";
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
    [key: string]: any;
  };
  onClose: () => void;
}

const PokemonDialog: React.FC<PokemonDialogProps> = ({ itemData, onClose }) => {
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
              Hatched Pokémon
            </Text>
          </Dialog.Title>
          <Image
            source={{ uri: itemData.imageUri }}
            width={220}
            height={220}
            objectFit="contain"
          />
          <Text color="#FFFFFF" fontSize={20} fontWeight="bold" textAlign="center">
            Congratulations! Your egg has hatched into a mysterious Pokémon!
          </Text>
          <Text color="#FFFFFF" fontSize={16} textAlign="center">
            Pokémon ID: {itemData.id}
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
