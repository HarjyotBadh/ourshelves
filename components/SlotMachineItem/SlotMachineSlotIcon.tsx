import React from 'react';
import { Text, View } from 'tamagui';
import { Apple, Banana, Cherry, Ham } from '@tamagui/lucide-icons'

interface SlotMachineDialogProps {
    icon: string;
}

export const SlotMachineSlotIcon: React.FC<SlotMachineDialogProps> = ({
    icon
}) => {

    return (
        <View style={{ transform: [{ scale: 1.5 }] }}>
            {icon === "apple" && <Apple />}
            {icon === "banana" && <Banana />}
            {icon === "ham" && <Ham />}
            {icon === "cherry" && <Cherry />}
            {icon === "seven" && <Text style={{ fontSize: 24 }}>7</Text>}
            {icon === "?" && <Text style={{ fontSize: 24 }}>?</Text>}
        </View>
    );
};










// import React, { useRef, useEffect, useState } from 'react';
// import { Dialog, Button, XStack, YStack, Text, View, styled, SelectSeparator } from 'tamagui';
// import { Animated } from 'react-native';
// import { SlotMachineSlotIcon } from 'components/SlotMachineItem/SlotMachineSlotIcon'; // Adjust the import path as necessary

// const slotOptions = [
//     { symbol: "apple", weight: 5 },
//     { symbol: "banana", weight: 4 },
//     { symbol: "ham", weight: 3 },
//     { symbol: "cherry", weight: 2 },
//     { symbol: "seven", weight: 1 }
// ];

// const getRandomSlotValue = () => {
//     const totalWeight = slotOptions.reduce((sum, option) => sum + option.weight, 0);
//     const randomValue = Math.random() * totalWeight;
//     let cumulativeWeight = 0;

//     for (const option of slotOptions) {
//         cumulativeWeight += option.weight;
//         if (randomValue < cumulativeWeight) {
//             return option.symbol;
//         }
//     }

//     return "apple"; // Default value
// };

// interface SlotMachineDialogProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
// }

// export const SlotMachineDialog: React.FC<SlotMachineDialogProps> = ({
//     open,
//     onOpenChange
// }) => {
//     const [slotValues, setSlotValues] = useState(["?", "?", "?"]);
//     const [isBreathing, setIsBreathing] = useState(false);

//     const SlotMachineSlot = styled(View, {
//         width: 100,
//         height: 100,
//         borderWidth: 3,
//         borderColor: 'rgba(0,0,0,0.1)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     });

//     // Create animated values for each slot
//     const colorAnim1 = useRef(new Animated.Value(0)).current;
//     const colorAnim2 = useRef(new Animated.Value(0)).current;
//     const colorAnim3 = useRef(new Animated.Value(0)).current;

//     const animateColor = (animValue: Animated.Value) => {
//         return Animated.loop(
//             Animated.sequence([
//                 Animated.timing(animValue, {
//                     toValue: 1,
//                     duration: 200,
//                     useNativeDriver: false,
//                 }),
//                 Animated.timing(animValue, {
//                     toValue: 0,
//                     duration: 200,
//                     useNativeDriver: false,
//                 })
//             ])
//         );
//     };

//     useEffect(() => {
//         // Start isBreathing animation only if 'isBreathing' is true
//         if (isBreathing) {
//             const animation1 = animateColor(colorAnim1);
//             const animation2 = animateColor(colorAnim2);
//             const animation3 = animateColor(colorAnim3);
//             animation1.start();
//             animation2.start();
//             animation3.start();
//             setSlotValues([getRandomSlotValue(), getRandomSlotValue(), getRandomSlotValue()]);

//             const timer = setTimeout(() => {
//                 animation1.stop();
//                 animation2.stop();
//                 animation3.stop();
//                 setIsBreathing(false);

//                 // Wait for setSlotValues to finish
//                 console.log(slotValues);
//                 if (slotValues[0] === slotValues[1] && slotValues[1] === slotValues[2]) {
//                     alert("You win!");
//                 }
//             }, 1000);

//             // Cleanup on unmount or next lever pull
//             return () => clearTimeout(timer);
//         } else {
//             // Reset color values to prevent flicker when isBreathing restarts
//             colorAnim1.setValue(0);
//             colorAnim2.setValue(0);
//             colorAnim3.setValue(0);
//         }
//     }, [isBreathing]);

//     const onLeverPulled = () => {
//         setIsBreathing(true);
//     };

//     // Interpolated color values
//     const color1 = colorAnim1.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['black', 'white']
//     });
//     const color2 = colorAnim2.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['black', 'white']
//     });
//     const color3 = colorAnim3.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['black', 'white']
//     });

//     return (
//         <Dialog modal open={open} onOpenChange={onOpenChange}>
//             <Dialog.Portal>
//                 <Dialog.Overlay key="overlay" />
//                 <Dialog.Content
//                     bordered
//                     elevate
//                     key="content"
//                     animation={[
//                         'quick',
//                         {
//                             opacity: {
//                                 overshootClamping: true,
//                             },
//                         },
//                     ]}
//                 >
//                     <Dialog.Title>Slot Machine</Dialog.Title>

//                     <YStack alignItems="center" marginVertical="$4">
//                         <XStack marginBottom={10} gap="$3">
//                             <SlotMachineSlot>
                                
//                             </SlotMachineSlot>
//                             <SlotMachineSlot>
                                
//                             </SlotMachineSlot>
//                             <SlotMachineSlot>
                                
//                             </SlotMachineSlot>
//                         </XStack>

//                         <Button onPress={onLeverPulled}>
//                             <Text>Pull Lever (temp)</Text>
//                         </Button>
//                     </YStack>

//                     <Dialog.Close displayWhenAdapted asChild>
//                         <Button
//                             onPress={() => {
//                                 onOpenChange(false);
//                             }}
//                             theme="alt1"
//                             aria-label="Save">
//                             Close
//                         </Button>
//                     </Dialog.Close>
//                 </Dialog.Content>
//             </Dialog.Portal>
//         </Dialog>
//     );
// };
