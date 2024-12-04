import React, { useEffect } from "react";
import { View } from "tamagui";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Ellipse, Rect } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const SunflowerPlant = ({ growth = 0, isWithered = false }) => {
  const animatedGrowth = useSharedValue(0);

  useEffect(() => {
    const safeGrowth = Math.max(0, Math.min(100, Number(growth) || 0));
    animatedGrowth.value = withTiming(safeGrowth, {
      duration: 3000,
      easing: Easing.out(Easing.exp),
    });
  }, [growth]);

  // Define colors based on isWithered
  const stemColor = isWithered ? "#7A8274" : "url(#stemGradient)";
  const leafColor = isWithered ? "#9EA498" : "url(#leafGradient)";
  const petalColor = isWithered ? "#C2C2B2" : "url(#petalGradient)";
  const centerColor = isWithered ? "#6B6B63" : "#8B4513";
  const seedColor = isWithered ? "#8A8A7B" : "url(#seedGradient)";
  const potColor = isWithered ? "#8E8E83" : "url(#potGradient)";

  // Seed Props
  const seedProps = useAnimatedProps(() => ({
    r: interpolate(animatedGrowth.value, [0, 10], [5, 0]),
    opacity: interpolate(animatedGrowth.value, [0, 10], [1, 0]),
  }));

  // Stem Props
  const stemProps = useAnimatedProps(() => {
    const stemHeight = interpolate(animatedGrowth.value, [10, 50], [0, 60]);
    return {
      d: `M50 80 L50 ${80 - stemHeight}`,
      strokeWidth: 3,
      opacity: interpolate(animatedGrowth.value, [10, 15], [0, 1]),
    };
  });

  // Leaf Props
  const leafProps = (direction) =>
    useAnimatedProps(() => {
      const leafGrowth = interpolate(animatedGrowth.value, [20, 40], [0, 1]);
      const xOffset = direction === "left" ? -15 : 15;
      const yPosition = 80 - interpolate(animatedGrowth.value, [20, 40], [0, 30]);
      return {
        opacity: leafGrowth,
        transform: `translate(50,${yPosition}) scale(${leafGrowth})`,
        d: `M0 0 C${xOffset} -10, ${xOffset} -20, 0 -30`,
      };
    });

  // Petal Props
  const petalProps = useAnimatedProps(() => {
    const petalScale = interpolate(animatedGrowth.value, [50, 80], [0, 1]);
    const yPosition = 20;
    return {
      opacity: petalScale,
      transform: `translate(50,${yPosition}) scale(${petalScale})`,
    };
  });

  // Center Props
  const centerProps = useAnimatedProps(() => ({
    r: interpolate(animatedGrowth.value, [60, 80], [0, 10]),
    opacity: interpolate(animatedGrowth.value, [60, 80], [0, 1]),
    cy: 20,
  }));

  // Pot Props
  const potProps = useAnimatedProps(() => ({
    opacity: 1,
  }));

  return (
    <View width={100} height={100}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          {/* Stem Gradient - Natural green colors */}
          <LinearGradient id="stemGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#6B8E23" />
            <Stop offset="100%" stopColor="#556B2F" />
          </LinearGradient>

          {/* Leaf Gradient - Natural green colors */}
          <LinearGradient id="leafGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#228B22" />
            <Stop offset="100%" stopColor="#006400" />
          </LinearGradient>

          {/* Petal Gradient - Natural sunflower colors */}
          <LinearGradient id="petalGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="100%" stopColor="#FFA500" />
          </LinearGradient>

          {/* Seed Gradient - Natural brown colors */}
          <LinearGradient id="seedGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#8B4513" />
            <Stop offset="100%" stopColor="#A0522D" />
          </LinearGradient>

          {/* Pot Gradient - Clay pot colors */}
          <LinearGradient id="potGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#D2691E" />
            <Stop offset="100%" stopColor="#8B4513" />
          </LinearGradient>
        </Defs>

        {/* Pot */}
        <AnimatedPath animatedProps={potProps} d="M30 85 L70 85 L65 75 L35 75 Z" fill={potColor} />
        <AnimatedPath animatedProps={potProps} d="M30 85 Q50 90 70 85" fill={potColor} />

        {/* Seed */}
        <AnimatedCircle animatedProps={seedProps} cx="50" cy="80" fill={seedColor} />

        {/* Stem */}
        <AnimatedPath animatedProps={stemProps} stroke={stemColor} strokeLinecap="round" />

        {/* Left Leaf */}
        <AnimatedPath animatedProps={leafProps("left")} fill={leafColor} />

        {/* Right Leaf */}
        <AnimatedPath animatedProps={leafProps("right")} fill={leafColor} />

        {/* Petals */}
        <AnimatedEllipse animatedProps={petalProps} rx="15" ry="15" fill={petalColor} />

        {/* Flower Center */}
        <AnimatedCircle animatedProps={centerProps} cx="50" fill={centerColor} />
      </Svg>
    </View>
  );
};

export default SunflowerPlant;
