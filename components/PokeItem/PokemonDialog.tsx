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
        <Star
          key={star.id}
          style={{ top: star.top, left: star.left }}
          color={color}
        />
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

  const InteractionBar = ({ type, count = 0 }) => {
    const config = {
      feeding: { color: "#FF6B6B", icon: Heart },
      training: { color: "#4ECDC4", icon: Dumbbell },
      fun: { color: "#FFD93D", icon: Sparkles },
    };

    const { color, icon: Icon } = config[type];

    return (
      <XStack alignItems="center" space="$2">
        <Icon color={color} size={24} />
        <View flex={1} height={8} backgroundColor="$gray300" borderRadius={4}>
          <View
            height={8}
            width={`${(count / 7) * 100}%`}
            backgroundColor={color}
            borderRadius={4}
          />
        </View>
        <Text color="$gray800" fontSize={14} fontWeight="bold">
          {count}/7
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

    const newCount = Math.min((itemData[`${type}Count`] || 0) + 1, 7);
    const newNextTime = Timestamp.fromMillis(Timestamp.now().toMillis() + 24 * 60 * 60 * 1000);
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

              <XStack gap="$3" justifyContent="center" flexWrap="wrap">
                {["feeding", "training", "fun"].map((type) => (
                  <Button
                    key={type}
                    onPress={() => handleInteraction(type as "feeding" | "training" | "fun")}
                    disabled={
                      !isInteractionAvailable(
                        itemData[`next${type.charAt(0).toUpperCase() + type.slice(1)}Time`]
                      )
                    }
                    backgroundColor={
                      isInteractionAvailable(
                        itemData[`next${type.charAt(0).toUpperCase() + type.slice(1)}Time`]
                      )
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
                    {type === "feeding" ? "Feed" : type === "training" ? "Train" : "Play"}
                  </Button>
                ))}
              </XStack>
            </YStack>

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
