import React from "react";
import { Text, View, styled, YStack, Image, Paragraph, Dialog, Button, XStack } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  withRepeat,
} from "react-native-reanimated";
import { Timestamp } from "firebase/firestore";
import { PokemonClient, EvolutionClient } from "pokenode-ts";

const pokeAPI = new PokemonClient();
const evolutionAPI = new EvolutionClient();

const DialogContainer = styled(Dialog.Content, {
  backgroundColor: "#DEB887",
  width: "90%",
  maxWidth: 800,
  padding: 0,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  overflow: "hidden",
});

const DialogTitle = styled(Text, {
  fontSize: 28,
  fontWeight: "bold",
  color: "#8B4513",
  textAlign: "center",
  marginBottom: "$4",
});

const ContentContainer = styled(YStack, {
  padding: "$4",
  backgroundColor: "#F5DEB3",
});

const ProgressContainer = styled(XStack, {
  gap: "$2",
  justifyContent: "center",
  marginBottom: "$4",
});

const ProgressIndicator = styled(View, {
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: "#8B4513",
  backgroundColor: "transparent",
  variants: {
    filled: {
      true: {
        backgroundColor: "#8B4513",
      },
    },
  },
});

const InteractionButton = styled(Button, {
  backgroundColor: "#8B4513",
  color: "#F5DEB3",
  borderRadius: "$4",
  marginTop: "$4",
  variants: {
    disabled: {
      true: {
        backgroundColor: "#D2B48C",
        opacity: 0.6,
      },
    },
  },
});

const StyledText = styled(Text, {
  color: "#8B4513",
  textAlign: "center",
});

const BottomBar = styled(View, {
  height: 20,
  backgroundColor: "#8B4513",
  marginTop: "auto",
});

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PokeEggDialogProps {
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
  onClose: () => void;
}

const PokeEggDialog: React.FC<PokeEggDialogProps> = ({ itemData, onDataUpdate, onClose }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  // List of legendary Pokémon IDs
  const legendaryPokemonIds = [
    144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384,
    385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 638, 639,
    640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 716, 717, 718, 719, 720, 721, 785, 786, 787,
    788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 807, 808, 809, 888,
    889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
  ];

  const generatePokemon = async () => {
    try {
      const randomChainId = Math.floor(Math.random() * 549) + 1;
      const chainDetails = await evolutionAPI.getEvolutionChainById(randomChainId);

      if (!chainDetails) {
        console.error("No chain details found");
        return null;
      }

      const firstPokemonSpecies = chainDetails.chain.species;
      const pokemonData = await pokeAPI.getPokemonByName(firstPokemonSpecies.name);

      if (!pokemonData) {
        console.error("No pokemon data found");
        return null;
      }

      if (!pokemonData.sprites.front_default) {
        console.log(`Pokémon ${pokemonData.name} has no front sprite. Trying another...`);
        return generatePokemon();
      }

      if (legendaryPokemonIds.includes(pokemonData.id)) {
        console.log("Legendary Pokémon detected");
        // 1% chance to keep the legendary Pokémon
        if (Math.random() > 0.01) {
          return generatePokemon();
        }
      }

      const hasEvolution = chainDetails.chain.evolves_to.length > 0;

      return {
        pokemonId: pokemonData.id,
        name: pokemonData.name,
        imageUri: pokemonData.sprites.front_default,
        types: pokemonData.types.map((t) => t.type.name),
        hasEvolution: hasEvolution,
      };
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
      return null;
    }
  };

  const handleInteraction = async () => {
    const currentDate = Timestamp.now();
    const nextInteraction =
      itemData.nextInteractionTime instanceof Date
        ? Timestamp.fromDate(itemData.nextInteractionTime)
        : itemData.nextInteractionTime;

    if (currentDate.toMillis() >= nextInteraction.toMillis()) {
      const newInteractionCount = (itemData.interactionCount || 0) + 1;
      const newNextInteractionTime = Timestamp.fromMillis(
        currentDate.toMillis() + 24 * 60 * 60 * 1000
      );
      const newData = {
        ...itemData,
        interactionCount: newInteractionCount,
        nextInteractionTime: newNextInteractionTime.toDate(),
      };
      if (newInteractionCount >= 7) {
        newData.hatched = true;
        const pokemon = await generatePokemon();
        if (pokemon) {
          newData.pokemon = pokemon;
        }
      }
      onDataUpdate(newData);

      rotation.value = withSequence(
        withTiming(-10, { duration: 100, easing: Easing.linear }),
        withTiming(10, { duration: 100, easing: Easing.linear }),
        withTiming(-10, { duration: 100, easing: Easing.linear }),
        withTiming(10, { duration: 100, easing: Easing.linear }),
        withTiming(0, { duration: 100, easing: Easing.linear })
      );
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    };
  });

  const isInteractionAvailable = () => {
    const currentDate = Timestamp.now();
    const nextInteraction =
      itemData.nextInteractionTime instanceof Date
        ? Timestamp.fromDate(itemData.nextInteractionTime)
        : itemData.nextInteractionTime;
    return currentDate.toMillis() >= nextInteraction.toMillis();
  };

  const getTimeUntilNextInteraction = () => {
    const nextInteraction =
      itemData.nextInteractionTime instanceof Date
        ? Timestamp.fromDate(itemData.nextInteractionTime)
        : itemData.nextInteractionTime;
    const now = Timestamp.now();
    const timeLeft = nextInteraction.toMillis() - now.toMillis();

    if (timeLeft <= 0) return "Ready!";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, []);

  const handleQuickHatch = async () => {
    const newData = {
      ...itemData,
      interactionCount: 7,
      hatched: true,
      nextInteractionTime: Timestamp.now().toDate(),
    };
    const pokemon = await generatePokemon();
    if (pokemon) {
      newData.pokemon = pokemon;
    }
    onDataUpdate(newData);
  };

  return (
    <DialogContainer>
      <ContentContainer>
        <DialogTitle>Mysterious Egg</DialogTitle>
        <ProgressContainer>
          {[...Array(7)].map((_, index) => (
            <ProgressIndicator
              key={index}
              filled={index < itemData.interactionCount}
              animation="quick"
              enterStyle={{ opacity: 0, scale: 0.8 }}
              exitStyle={{ opacity: 0, scale: 0.8 }}
              pressStyle={{ scale: 0.9 }}
              hoverStyle={{ scale: 1.1 }}
              focusStyle={{ scale: 1.1 }}
            />
          ))}
        </ProgressContainer>

        <StyledText fontSize={20} fontWeight="bold">
          Day {itemData.interactionCount + 1} of 7
        </StyledText>

        <YStack alignItems="center" padding="$4">
          <AnimatedImage
            source={{ uri: itemData.imageUri }}
            style={[{ width: 220, height: 220 }, animatedStyle]}
            objectFit="contain"
          />
        </YStack>

        <InteractionButton
          onPress={handleInteraction}
          disabled={!isInteractionAvailable()}
        >
          <YStack alignItems="center">
            <Text color="white" fontSize={20} fontWeight="bold">
              Take care of the egg
            </Text>
            <Text color="white" fontSize={14}>
              {isInteractionAvailable() ? "Ready!" : getTimeUntilNextInteraction()}
            </Text>
          </YStack>
        </InteractionButton>

        <Button
          onPress={handleQuickHatch}
          backgroundColor="#D2691E"
          color="white"
          marginTop="$4"
        >
          Quick Hatch (Test)
        </Button>

        <Dialog.Close asChild>
          <Button
            onPress={onClose}
            backgroundColor="#CD853F"
            color="white"
            marginTop="$4"
          >
            Close
          </Button>
        </Dialog.Close>
      </ContentContainer>
      <BottomBar />
    </DialogContainer>
  );
};

export default PokeEggDialog;
