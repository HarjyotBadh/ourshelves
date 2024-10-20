import React, { useEffect, useState } from "react";
import { Text, YStack, Image, Dialog, Button, XStack, Card, View, ScrollView } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import { Timestamp } from "firebase/firestore";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { AlertDialog } from "../AlertDialog";
import { useToastController } from "@tamagui/toast";
import { Heart, Dumbbell, Sparkles } from "@tamagui/lucide-icons";
import { PokemonClient, EvolutionClient } from "pokenode-ts";

const pokeAPI = new PokemonClient();
const evolutionAPI = new EvolutionClient();

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedText = Animated.createAnimatedComponent(Text);

const Star = ({ style, color }: { style: any; color: string }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.ease }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 2,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
        },
        style,
        animatedStyle,
      ]}
    />
  );
};

const StarryBackground = ({ color }: { color: string }) => {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2000,
  }));

  return (
    <View style={{ position: "absolute", width: "100%", height: "100%" }}>
      {stars.map((star) => (
        <Star key={star.id} style={{ top: star.top, left: star.left }} color={color} />
      ))}
    </View>
  );
};

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
      hasEvolution: boolean;
    };
    feedingCount?: number;
    trainingCount?: number;
    funCount?: number;
    nextFeedingTime?: Timestamp | Date;
    nextTrainingTime?: Timestamp | Date;
    nextFunTime?: Timestamp | Date;
    [key: string]: any;
  };
  onClose: () => void;
  onDataUpdate: (data: any) => void;
}

interface EvolutionSpecies {
  name: string;
}

const PokemonDialog: React.FC<PokemonDialogProps> = ({ itemData, onClose, onDataUpdate }) => {
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const toast = useToastController();

  useEffect(() => {
    scale.value = withSpring(1);
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const getBackgroundColor = (type: string) => {
    const typeColors = {
      normal: ["#A8A878", "#6D6D4E"],
      fire: ["#F08030", "#9C531F"],
      water: ["#6890F0", "#445E9C"],
      electric: ["#F8D030", "#A1871F"],
      grass: ["#78C850", "#4E8234"],
      ice: ["#98D8D8", "#638D8D"],
      fighting: ["#C03028", "#7D1F1A"],
      poison: ["#A040A0", "#682A68"],
      ground: ["#E0C068", "#927D44"],
      flying: ["#A890F0", "#6D5E9C"],
      psychic: ["#F85888", "#A13959"],
      bug: ["#A8B820", "#6D7815"],
      rock: ["#B8A038", "#786824"],
      ghost: ["#705898", "#493963"],
      dragon: ["#7038F8", "#4924A1"],
      dark: ["#705848", "#49392F"],
      steel: ["#B8B8D0", "#787887"],
      fairy: ["#EE99AC", "#9B6470"],
    };
    return typeColors[type.toLowerCase()] || ["#68A090", "#4A685A"];
  };

  const primaryType = itemData.pokemon?.types[0]?.toLowerCase() || "normal";
  const [lightColor, darkColor] = getBackgroundColor(primaryType);

  const getTimeUntilNextInteraction = (nextTime?: Timestamp | Date) => {
    if (!nextTime) return "Ready!";
    const now = Timestamp.now();
    const next = nextTime instanceof Date ? Timestamp.fromDate(nextTime) : nextTime;
    const timeLeft = next.toMillis() - now.toMillis();

    if (timeLeft <= 0) return "Ready!";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const InteractionBar = ({ type, count = 0 }) => {
    const config = {
      feeding: { color: "#FF6B6B", icon: Heart, maxCount: 10 },
      training: { color: "#4ECDC4", icon: Dumbbell, maxCount: 22 },
      fun: { color: "#FFD93D", icon: Sparkles, maxCount: 7 },
    };

    const { color, icon: Icon, maxCount } = config[type];

    return (
      <XStack alignItems="center" gap="$2">
        <Icon color={color} size={24} />
        <View flex={1} height={8} backgroundColor="$gray300" borderRadius={4}>
          <View
            height={8}
            width={`${(count / maxCount) * 100}%`}
            backgroundColor={color}
            borderRadius={4}
          />
        </View>
        <Text color="$gray800" fontSize={14} fontWeight="bold">
          {count}/{maxCount}
        </Text>
      </XStack>
    );
  };

  const isInteractionAvailable = (nextTime?: Timestamp | Date) => {
    if (!nextTime) return true;
    const currentDate = Timestamp.now();
    const nextInteraction = nextTime instanceof Date ? Timestamp.fromDate(nextTime) : nextTime;
    return currentDate.toMillis() >= nextInteraction.toMillis();
  };

  const handleInteraction = (type: "feeding" | "training" | "fun") => {
    if (
      !isInteractionAvailable(itemData[`next${type.charAt(0).toUpperCase() + type.slice(1)}Time`])
    ) {
      setAlertMessage(
        `You can't ${type} your Pokemon yet. Please wait until the next available time.`
      );
      setIsAlertOpen(true);
      return;
    }

    const maxCounts = { feeding: 10, training: 22, fun: 7 };
    const cooldowns = { feeding: 18, training: 6, fun: 24 };

    const newCount = Math.min((itemData[`${type}Count`] || 0) + 1, maxCounts[type]);
    const newNextTime = Timestamp.fromMillis(
      Timestamp.now().toMillis() + cooldowns[type] * 60 * 60 * 1000
    );
    const newData = {
      ...itemData,
      [`${type}Count`]: newCount,
      [`next${type.charAt(0).toUpperCase() + type.slice(1)}Time`]: newNextTime.toDate(),
    };
    onDataUpdate(newData);

    if (toast) {
      toast.show(`${type.charAt(0).toUpperCase() + type.slice(1)} successful!`, {
        message: `Your Pokemon is happy!`,
      });
    }
  };

  const isEvolutionReady = () => {
    return (
      (itemData.feedingCount || 0) >= 10 &&
      (itemData.trainingCount || 0) >= 22 &&
      (itemData.funCount || 0) >= 7 &&
      itemData.pokemon?.hasEvolution
    );
  };

  const handleEvolution = async () => {
    try {
      if (!itemData.pokemon) {
        console.error("No Pokémon data found");
        return;
      }
  
      const species = await pokeAPI.getPokemonSpeciesByName(itemData.pokemon.name);
      const evolutionChainId = species.evolution_chain.url.split("/").filter(Boolean).pop();
  
      if (!evolutionChainId) {
        console.error("Failed to extract evolution chain ID");
        return;
      }
  
      const evolutionChain = await evolutionAPI.getEvolutionChainById(parseInt(evolutionChainId));
  
      let nextEvolution: string | null = null;
      let hasNextEvolution = false;
  
      const findNextEvolution = (chain: any) => {
        if (chain.species.name === itemData.pokemon?.name) {
          if (chain.evolves_to.length > 0) {
            nextEvolution = chain.evolves_to[0].species.name;
            hasNextEvolution = chain.evolves_to[0].evolves_to.length > 0;
          }
          return;
        }
        chain.evolves_to.forEach(findNextEvolution);
      };
      findNextEvolution(evolutionChain.chain);
  
      if (!nextEvolution) {
        console.error("No evolution found");
        return;
      }
  
      const evolvedPokemon = await pokeAPI.getPokemonByName(nextEvolution);
      // const evolvedSpecies = await pokeAPI.getPokemonSpeciesByName(nextEvolution);
  
      const newData = {
        ...itemData,
        pokemon: {
          pokemonId: evolvedPokemon.id,
          name: evolvedPokemon.name,
          imageUri: evolvedPokemon.sprites.front_default,
          types: evolvedPokemon.types.map((t) => t.type.name),
          hasEvolution: hasNextEvolution, // Set based on the check we did earlier
        },
        feedingCount: 0,
        trainingCount: 0,
        funCount: 0,
        nextFeedingTime: Timestamp.now().toDate(),
        nextTrainingTime: Timestamp.now().toDate(),
        nextFunTime: Timestamp.now().toDate(),
      };
  
      onDataUpdate(newData);
  
      if (toast) {
        toast.show("Evolution successful!", {
          message: `Your ${itemData.pokemon.name} evolved into ${newData.pokemon.name}!`,
        });
      }
    } catch (error) {
      console.error("Error during evolution:", error);
      if (toast) {
        toast.show("Evolution failed", {
          message: "An error occurred during evolution. Please try again.",
        });
      }
    }
  };

  // Add this function near your other handler functions
  const handleFillInteractions = () => {
    const newData = {
      ...itemData,
      feedingCount: 10,
      trainingCount: 22,
      funCount: 7,
      nextFeedingTime: Timestamp.now().toDate(),
      nextTrainingTime: Timestamp.now().toDate(),
      nextFunTime: Timestamp.now().toDate(),
    };
    onDataUpdate(newData);

    if (toast) {
      toast.show("Interactions Filled", {
        message: "All interaction bars have been filled for testing.",
      });
    }
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
      maxHeight="85%"
      overflow="hidden"
    >
      <LinearGradient
        colors={[lightColor, darkColor]}
        start={[0, 0]}
        end={[1, 1]}
        borderRadius={16}
        padding={24}
      >
        <ScrollView>
          <YStack gap="$4" maxWidth={500} alignItems="center">
            <Dialog.Title>
              <AnimatedText
                fontSize={36}
                fontWeight="bold"
                color="#FFDE00"
                style={{
                  textShadowColor: "#3B4CCA",
                  textShadowOffset: { width: 2, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                {itemData.pokemon?.name
                  ? itemData.pokemon.name.charAt(0).toUpperCase() + itemData.pokemon.name.slice(1)
                  : "Unknown Pokémon"}
              </AnimatedText>
            </Dialog.Title>
            <Card
              elevate
              size="$4"
              bordered
              animation="bouncy"
              scale={0.9}
              hoverStyle={{ scale: 0.925 }}
              pressStyle={{ scale: 0.875 }}
            >
              <Card.Background>
                <View style={{ width: 280, height: 280, overflow: "hidden", borderRadius: 16 }}>
                  <LinearGradient
                    colors={[lightColor, darkColor]}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={{ position: "absolute", width: "100%", height: "100%" }}
                  />
                  <StarryBackground color={lightColor} />
                </View>
              </Card.Background>
              <AnimatedImage
                source={{ uri: itemData.pokemon?.imageUri || itemData.imageUri }}
                width={260}
                height={260}
                objectFit="contain"
                style={[{ width: 260, height: 260 }, imageStyle]}
              />
            </Card>
            <XStack gap="$2" flexWrap="wrap" justifyContent="center">
              {itemData.pokemon?.types.map((type, index) => (
                <Card
                  key={index}
                  backgroundColor={getBackgroundColor(type)[0]}
                  borderRadius="$4"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                >
                  <Text color="#FFFFFF" fontSize={16} fontWeight="bold">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Card>
              ))}
            </XStack>

            <YStack gap="$4" alignItems="stretch" width="100%">
              <Text fontSize={24} fontWeight="bold" color="#FFFFFF" textAlign="center">
                Interactions
              </Text>

              <YStack space="$3">
                <InteractionBar type="feeding" count={itemData.feedingCount || 0} />
                <InteractionBar type="training" count={itemData.trainingCount || 0} />
                <InteractionBar type="fun" count={itemData.funCount || 0} />
              </YStack>

              {isEvolutionReady() ? (
                <Button
                  onPress={handleEvolution}
                  backgroundColor="#FFD700"
                  color="#000000"
                  borderRadius="$4"
                  fontSize={18}
                  fontWeight="bold"
                  paddingHorizontal="$4"
                  hoverStyle={{ opacity: 0.9 }}
                  pressStyle={{ scale: 0.95 }}
                >
                  Evolve Pokemon
                </Button>
              ) : (
                <XStack gap="$3" justifyContent="center" flexWrap="wrap">
                  {["feeding", "training", "fun"].map((type) => (
                    <Button
                      key={type}
                      onPress={() => handleInteraction(type as "feeding" | "training" | "fun")}
                      disabled={
                        !isInteractionAvailable(
                          itemData[`next${type.charAt(0).toUpperCase() + type.slice(1)}Time`]
                        ) ||
                        (type === "feeding" && (itemData.feedingCount || 0) >= 10) ||
                        (type === "training" && (itemData.trainingCount || 0) >= 22) ||
                        (type === "fun" && (itemData.funCount || 0) >= 7)
                      }
                      backgroundColor={
                        isInteractionAvailable(
                          itemData[`next${type.charAt(0).toUpperCase() + type.slice(1)}Time`]
                        ) &&
                        ((type === "feeding" && (itemData.feedingCount || 0) < 10) ||
                          (type === "training" && (itemData.trainingCount || 0) < 22) ||
                          (type === "fun" && (itemData.funCount || 0) < 7))
                          ? type === "feeding"
                            ? "#FF6B6B"
                            : type === "training"
                            ? "#4ECDC4"
                            : "#FFD93D"
                          : "$gray8"
                      }
                      color="#FFFFFF"
                      borderRadius="$4"
                      fontSize={18}
                      fontWeight="bold"
                      paddingHorizontal="$4"
                      hoverStyle={{ opacity: 0.9 }}
                      pressStyle={{ scale: 0.95 }}
                    >
                      <YStack alignItems="center">
                        <Text color="#FFFFFF" fontSize={18} fontWeight="bold">
                          {type === "feeding" ? "Feed" : type === "training" ? "Train" : "Play"}
                        </Text>
                        {isInteractionAvailable(
                          itemData[`next${type.charAt(0).toUpperCase() + type.slice(1)}Time`]
                        ) &&
                        ((type === "feeding" && (itemData.feedingCount || 0) < 10) ||
                          (type === "training" && (itemData.trainingCount || 0) < 22) ||
                          (type === "fun" && (itemData.funCount || 0) < 7)) ? (
                          <Text color="#FFFFFF" fontSize={14}>
                            Ready!
                          </Text>
                        ) : null}
                      </YStack>
                    </Button>
                  ))}
                </XStack>
              )}
            </YStack>

            <Button
              onPress={handleFillInteractions}
              backgroundColor="#8A2BE2"
              color="#FFFFFF"
              borderRadius="$4"
              fontSize={18}
              fontWeight="bold"
              paddingHorizontal="$4"
              marginTop="$2"
              hoverStyle={{ opacity: 0.9 }}
              pressStyle={{ scale: 0.95 }}
            >
              Fill Interactions (Test)
            </Button>

            <Dialog.Close asChild>
              <Button
                onPress={onClose}
                backgroundColor="#FF0000"
                color="#FFFFFF"
                borderRadius="$4"
                fontSize={18}
                fontWeight="bold"
                paddingHorizontal="$5"
                marginTop="$4"
                marginBottom="$2"
                hoverStyle={{ backgroundColor: "#FF3333" }}
                pressStyle={{ scale: 0.95 }}
              >
                Close
              </Button>
            </Dialog.Close>
          </YStack>
        </ScrollView>
      </LinearGradient>
      <AlertDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        title="Interaction Not Available"
        description={alertMessage}
        onConfirm={() => setIsAlertOpen(false)}
        onCancel={() => setIsAlertOpen(false)}
      />
    </Dialog.Content>
  );
};

export default PokemonDialog;
