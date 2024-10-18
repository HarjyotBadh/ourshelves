import React, { useEffect } from "react";
import { Text, YStack, Image, Dialog, Button, XStack, Card } from "tamagui";
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

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedText = Animated.createAnimatedComponent(Text);

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
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);

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

  const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
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
            <AnimatedText
              fontSize={32}
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
              <Animated.View style={[{ width: 240, height: 240 }, bgStyle]}>
                <LinearGradient
                  colors={["#FFD700", "#FFA500"]}
                  start={[0, 0]}
                  end={[1, 1]}
                  borderRadius={10}
                  padding={20}
                />
              </Animated.View>
            </Card.Background>
            <AnimatedImage
              source={{ uri: itemData.pokemon?.imageUri || itemData.imageUri }}
              width={220}
              height={220}
              objectFit="contain"
              style={[{ width: 220, height: 220 }, imageStyle]}
            />
          </Card>
          <XStack gap="$2" flexWrap="wrap" justifyContent="center">
            {itemData.pokemon?.types.map((type, index) => (
              <Card
                key={index}
                backgroundColor={typeColors[type.toLowerCase()] || "#A8A878"}
                borderRadius="$4"
                paddingHorizontal="$2"
                paddingVertical="$1"
              >
                <Text color="#FFFFFF" fontSize={14} fontWeight="bold">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Card>
            ))}
          </XStack>
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
