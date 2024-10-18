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
import { Pokemon } from "../../models/PokemonModel";

const ProgressIndicator = styled(View, {
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: "#FFDE00",
  variants: {
    filled: {
      true: {
        backgroundColor: "#FFDE00",
      },
      false: {
        backgroundColor: "transparent",
      },
    },
  },
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
    };
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  onClose: () => void;
}

const PokeEggDialog: React.FC<PokeEggDialogProps> = ({ itemData, onDataUpdate, onClose }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const generatePokemon = async () => {
    const fetchPokemon = async () => {
      const randomChainId = Math.floor(Math.random() * 500) + 1;

      const chainDetailsResponse = await fetch(
        `https://pokeapi.co/api/v2/evolution-chain/${randomChainId}`
      );
      const chainDetails = await chainDetailsResponse.json();

      const firstPokemonSpecies = chainDetails.chain.species;

      const pokemonResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${firstPokemonSpecies.name}`
      );
      return await pokemonResponse.json();
    };

    try {
      let pokemonData = await fetchPokemon();
      let attempts = 0;
      const maxAttempts = 5;

      while (!pokemonData.sprites.front_default && attempts < maxAttempts) {
        console.log(
          `Attempt ${attempts + 1}: Pokémon ${
            pokemonData.name
          } has no front sprite. Trying another...`
        );
        pokemonData = await fetchPokemon();
        attempts++;
      }

      if (attempts === maxAttempts) {
        console.error("Failed to find a Pokémon with a front sprite after multiple attempts");
        return null;
      }

      return {
        pokemonId: pokemonData.id,
        name: pokemonData.name,
        imageUri: pokemonData.sprites.front_default,
        types: pokemonData.types.map((t) => t.type.name),
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
              Mysterious Egg
            </Text>
          </Dialog.Title>
          <XStack gap="$2" justifyContent="center">
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
          </XStack>
          <Paragraph textAlign="center" color="#FFFFFF" fontSize={20} fontWeight="bold">
            Day {itemData.interactionCount + 1} of 7
          </Paragraph>
          <AnimatedImage
            source={{ uri: itemData.imageUri }}
            style={[{ width: 220, height: 220 }, animatedStyle]}
            objectFit="contain"
          />
          <Button
            onPress={handleInteraction}
            disabled={!isInteractionAvailable()}
            backgroundColor={isInteractionAvailable() ? "#FFDE00" : "#A9A9A9"}
            color={isInteractionAvailable() ? "#3B4CCA" : "#FFFFFF"}
            borderRadius="$4"
            fontSize={20}
            fontWeight="bold"
            paddingHorizontal="$5"
            hoverStyle={isInteractionAvailable() ? { backgroundColor: "#FFE769" } : {}}
            pressStyle={isInteractionAvailable() ? { scale: 0.95 } : {}}
          >
            <YStack alignItems="center">
              <Text
                color={isInteractionAvailable() ? "#3B4CCA" : "#FFFFFF"}
                fontSize={20}
                fontWeight="bold"
              >
                Take care of the egg
              </Text>
              <Text color={isInteractionAvailable() ? "#3B4CCA" : "#FFFFFF"} fontSize={14}>
                {isInteractionAvailable() ? "Ready!" : getTimeUntilNextInteraction()}
              </Text>
            </YStack>
          </Button>
          <Button
            onPress={handleQuickHatch}
            backgroundColor="#FF6B6B"
            color="#FFFFFF"
            borderRadius="$4"
            fontSize={16}
            fontWeight="bold"
            paddingHorizontal="$3"
            marginTop="$2"
          >
            Quick Hatch (Test)
          </Button>
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

export default PokeEggDialog;
