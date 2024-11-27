import React, { useState, useEffect } from "react";
import { Text, YStack, Image, Dialog, Button, XStack, Card, View, ScrollView, styled } from "tamagui";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Timestamp } from "firebase/firestore";
import { AlertDialog } from "../AlertDialog";
import { useToastController } from "@tamagui/toast";
import { Heart, Dumbbell, Sparkles, Zap } from "@tamagui/lucide-icons";
import { PokemonClient, EvolutionClient } from "pokenode-ts";

const pokeAPI = new PokemonClient();
const evolutionAPI = new EvolutionClient();

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedText = Animated.createAnimatedComponent(Text);

// Styled components with wood theme
const DialogContainer = styled(Dialog.Content, {
  backgroundColor: "#DEB887",
  width: "90%",
  maxWidth: 800,
  padding: 0,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  overflow: "hidden",
  maxHeight: "85%",
});

const ContentContainer = styled(YStack, {
  padding: "$4",
  backgroundColor: "#F5DEB3",
});

const DialogTitle = styled(Text, {
  fontSize: 28,
  fontWeight: "bold",
  color: "#8B4513",
  textAlign: "center",
  marginBottom: "$4",
});

const PetCard = styled(Card, {
  backgroundColor: "#DEB887",
  borderRadius: 16,
  borderWidth: 2,
  borderColor: "#8B4513",
  padding: "$4",
});

const TypeBadge = styled(View, {
  backgroundColor: "#8B4513",
  borderRadius: "$4",
  paddingHorizontal: "$3",
  paddingVertical: "$2",
});

const InteractionContainer = styled(YStack, {
  gap: "$4",
  padding: "$4",
  backgroundColor: "#DEB887",
  borderRadius: 12,
  marginTop: "$4",
});

const ProgressBar = styled(View, {
  height: 8,
  backgroundColor: "#F5DEB3",
  borderRadius: 4,
  overflow: "hidden",
  flex: 1,
});

const ProgressFill = styled(View, {
  height: "100%",
  borderRadius: 4,
});

const ActionButton = styled(Button, {
  backgroundColor: "#8B4513",
  borderRadius: "$4",
  marginTop: "$4",
  variants: {
    variant: {
      feeding: {
        backgroundColor: "#A0522D",
      },
      training: {
        backgroundColor: "#8B4513",
      },
      fun: {
        backgroundColor: "#CD853F",
      },
      evolution: {
        backgroundColor: "#D2691E",
      },
      close: {
        backgroundColor: "#A0522D",
      },
    },
    disabled: {
      true: {
        backgroundColor: "#D2B48C",
        opacity: 0.6,
      },
    },
  },
});

const BottomBar = styled(View, {
  height: 20,
  backgroundColor: "#8B4513",
  marginTop: "auto",
});

const EvolutionBadge = styled(XStack, {
  backgroundColor: "#DEB887",
  borderRadius: "$full",
  paddingHorizontal: "$2",
  paddingVertical: "$1",
  alignItems: "center",
  justifyContent: "center",
  gap: "$1",
  borderWidth: 2,
  borderColor: "#8B4513",
});

const InteractionBar = ({ type, count = 0, maxCount }) => {
  const config = {
    feeding: { color: "#A0522D", icon: Heart },
    training: { color: "#8B4513", icon: Dumbbell },
    fun: { color: "#CD853F", icon: Sparkles },
  };

  const { color, icon: Icon } = config[type];

  return (
    <XStack alignItems="center" gap="$2">
      <Icon color={color} size={24} />
      <ProgressBar>
        <ProgressFill
          backgroundColor={color}
          width={`${(count / maxCount) * 100}%`}
        />
      </ProgressBar>
      <Text color="#8B4513" fontSize={14} fontWeight="bold">
        {count}/{maxCount}
      </Text>
    </XStack>
  );
};

const PokemonDialog = ({ itemData, onDataUpdate, onClose }) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const toast = useToastController();
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isInteractionAvailable = (nextTime?: Timestamp | Date) => {
    if (!nextTime) return true;
    const currentDate = Timestamp.now();
    const nextInteraction = nextTime instanceof Date ? Timestamp.fromDate(nextTime) : nextTime;
    return currentDate.toMillis() >= nextInteraction.toMillis();
  };

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
  };

  return (
    <DialogContainer>
      <ScrollView>
        <ContentContainer>
          <YStack gap="$4" alignItems="center">
            <DialogTitle>
              {itemData.pokemon?.name
                ? itemData.pokemon.name.charAt(0).toUpperCase() + itemData.pokemon.name.slice(1)
                : "Unknown Pokémon"}
            </DialogTitle>

            <EvolutionBadge>
              {itemData.pokemon?.hasEvolution ? (
                <Zap size={16} color="#8B4513" />
              ) : (
                <Sparkles size={16} color="#8B4513" />
              )}
              <Text color="#8B4513" fontSize={12} fontWeight="bold">
                {itemData.pokemon?.hasEvolution ? "Can Evolve" : "Final Form"}
              </Text>
            </EvolutionBadge>

            <PetCard
              size="$8"
              width={280}
              height={280}
              scale={1}
              animation="bouncy"
              backgroundColor="#DEB887"
            >
              <Card.Background>
                <View style={{ width: "100%", height: "100%", borderRadius: 16 }} />
              </Card.Background>
              <AnimatedImage
                source={{ uri: itemData.pokemon?.imageUri || itemData.imageUri }}
                style={[
                  {
                    width: 260,
                    height: 260,
                    alignSelf: "center",
                  },
                  imageStyle,
                ]}
                resizeMode="contain"
              />
            </PetCard>

            <XStack gap="$2" flexWrap="wrap" justifyContent="center">
              {itemData.pokemon?.types.map((type, index) => (
                <TypeBadge key={index}>
                  <Text color="#F5DEB3" fontSize={16} fontWeight="bold">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TypeBadge>
              ))}
            </XStack>

            <InteractionContainer>
              <Text fontSize={24} fontWeight="bold" color="#F5DEB3" textAlign="center">
                Interactions
              </Text>

              <YStack space="$3">
                <InteractionBar type="feeding" count={itemData.feedingCount || 0} maxCount={10} />
                <InteractionBar type="training" count={itemData.trainingCount || 0} maxCount={22} />
                <InteractionBar type="fun" count={itemData.funCount || 0} maxCount={7} />
              </YStack>

              {isEvolutionReady() ? (
                <ActionButton variant="evolution" onPress={handleEvolution}>
                  <Text color="#F5DEB3" fontSize={18} fontWeight="bold">
                    Evolve Pokemon
                  </Text>
                </ActionButton>
              ) : (
                <XStack gap="$3" justifyContent="center" flexWrap="wrap">
                  {["feeding", "training", "fun"].map((type) => (
                    <ActionButton
                      key={type}
                      variant={type as "feeding" | "training" | "fun"}
                      onPress={() => handleInteraction(type as "feeding" | "training" | "fun")}
                      disabled={
                        !isInteractionAvailable(
                          itemData[`next${type.charAt(0).toUpperCase() + type.slice(1)}Time`]
                        )
                      }
                    >
                      <YStack alignItems="center">
                        <Text color="#F5DEB3" fontSize={18} fontWeight="bold">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                        <Text color="#F5DEB3" fontSize={14}>
                          {getTimeUntilNextInteraction(
                            itemData[`next${type.charAt(0).toUpperCase() + type.slice(1)}Time`]
                          )}
                        </Text>
                      </YStack>
                    </ActionButton>
                  ))}
                </XStack>
              )}
            </InteractionContainer>

            <ActionButton variant="close" onPress={onClose}>
              <Text color="#F5DEB3" fontSize={18} fontWeight="bold">
                Close
              </Text>
            </ActionButton>

            <ActionButton 
              variant="evolution"
              onPress={handleFillInteractions}
              size="$2"
            >
              <Text color="#F5DEB3" fontSize={12}>
                Fill Interactions (Test)
              </Text>
            </ActionButton>
          </YStack>
        </ContentContainer>
      </ScrollView>
      <BottomBar />
      
      <AlertDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        title="Interaction Not Available"
        description={alertMessage}
        onConfirm={() => setIsAlertOpen(false)}
        onCancel={() => setIsAlertOpen(false)}
      />
    </DialogContainer>
  );
};

export default PokemonDialog;