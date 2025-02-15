import React, { useState, useEffect } from "react";
import { View, YStack, Image, Dialog, Text } from "tamagui";
import { Timestamp } from "firebase/firestore";
import PokeEggDialog from "../PokeItem/PokeEggDialog";
import PokemonDialog from "../PokeItem/PokemonDialog";
import { styled } from "tamagui";

const NotificationBadge = styled(View, {
  position: "absolute",
  top: 0,
  left: 0,
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: "#8B4513",
  borderColor: "#DEB887",
  borderWidth: 2,
  justifyContent: "center",
  alignItems: "center",
});

const NotificationText = styled(Text, {
  color: "#F5DEB3",
  fontSize: 12,
  fontWeight: "bold",
});

interface PokeItemProps {
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
    pokemon?: {
      pokemonId: number;
      name: string;
      imageUri: string;
      types: string[];
      hasEvolution: boolean;
    };
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  };
}

interface PokeItemComponent extends React.FC<PokeItemProps> {
  getInitialData: () => {
    hatched: boolean;
    interactionCount: number;
    nextInteractionTime: Timestamp | Date;
  };
}

const PokeItem: PokeItemComponent = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (
      !itemData.hasOwnProperty("hatched") ||
      !itemData.hasOwnProperty("interactionCount") ||
      !itemData.hasOwnProperty("nextInteractionTime")
    ) {
      const initialData = PokeItem.getInitialData();
      onDataUpdate({
        ...itemData,
        ...initialData,
      });
    }
  }, []);

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose();
  };

  const isInteractionAvailable = () => {
    if (!itemData.nextInteractionTime) {
      return true;
    }
    const currentDate = Timestamp.now();
    const nextInteraction =
      itemData.nextInteractionTime instanceof Date
        ? Timestamp.fromDate(itemData.nextInteractionTime)
        : itemData.nextInteractionTime;
    return currentDate.toMillis() >= nextInteraction.toMillis();
  };

  if (!isActive) {
    const containerSize = 90;
    const eggSize = 80;
    const pokemonSize = 130;

    return (
      <YStack
        width={containerSize}
        height={containerSize}
        justifyContent="center"
        alignItems="center"
      >
        <View
          width={containerSize}
          height={containerSize}
          justifyContent="center"
          alignItems="center"
          backgroundColor="#F5DEB3"
          borderRadius={12}
          borderWidth={1}
          borderColor="#8B4513"
        >
          <Image
            source={{ uri: itemData.hatched ? itemData.pokemon?.imageUri : itemData.imageUri }}
            width={itemData.hatched ? pokemonSize : eggSize}
            height={itemData.hatched ? pokemonSize : eggSize}
            objectFit="contain"
          />
          {isInteractionAvailable() && !itemData.hatched && (
            <NotificationBadge>
              <NotificationText>!</NotificationText>
            </NotificationBadge>
          )}
        </View>
      </YStack>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        {!itemData.hatched ? (
          <PokeEggDialog
            itemData={itemData}
            onDataUpdate={onDataUpdate}
            onClose={handleDialogClose}
          />
        ) : (
          <PokemonDialog
            itemData={itemData}
            onDataUpdate={onDataUpdate}
            onClose={handleDialogClose}
          />
        )}
      </Dialog.Portal>
    </Dialog>
  );
};

PokeItem.getInitialData = () => ({
  hatched: false,
  interactionCount: 0,
  nextInteractionTime: Timestamp.now().toDate(),
});

export default PokeItem;