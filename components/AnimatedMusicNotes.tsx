import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Music } from '@tamagui/lucide-icons';

export const AnimatedMusicNotes: React.FC = () => {
  const noteAnim1 = useRef(new Animated.Value(0)).current;
  const noteAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateNote = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateNote(noteAnim1, 0);
    animateNote(noteAnim2, 1000);

    return () => {
      noteAnim1.stopAnimation();
      noteAnim2.stopAnimation();
    };
  }, []);

  const renderNote = (anim: Animated.Value, style: object) => (
    <Animated.View
      style={[
        style,
        {
          opacity: anim.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [0, 1, 0],
          }),
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -50],
              }),
            },
          ],
        },
      ]}
    >
      <Music size={16} color="black" />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderNote(noteAnim1, styles.note1)}
      {renderNote(noteAnim2, styles.note2)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  note1: {
    position: 'absolute',
    top: '50%',
    right: '30%',
  },
  note2: {
    position: 'absolute',
    top: '60%',
    right: '40%',
  },
});