import React, { useRef, useEffect, useState } from "react";
import { Dialog, Button, XStack, YStack, Text, View, styled, SelectSeparator } from "tamagui";
import { Animated } from "react-native";
import { SlotMachineSlotIcon } from "components/SlotMachineItem/SlotMachineSlotIcon"; // Adjust the import path as necessary
import { earnCoins, loseCoins } from "project-functions/shopFunctions";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { UserData } from "models/UserData";

const slotOptions = [
    { symbol: "apple", weight: 500000, reward: 20 },
    { symbol: "banana", weight: 4, reward: 30 },
    { symbol: "ham", weight: 3, reward: 40 },
    { symbol: "cherry", weight: 2, reward: 50 },
    { symbol: "seven", weight: 1, reward: 777 },
];

const getRandomSlotValue = () => {
    const totalWeight = slotOptions.reduce((sum, option) => sum + option.weight, 0);
    const randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const option of slotOptions) {
        cumulativeWeight += option.weight;
        if (randomValue < cumulativeWeight) {
            return option.symbol;
        }
    }

    return "apple"; // Default value
};

interface SlotMachineDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SlotMachineDialog: React.FC<SlotMachineDialogProps> = ({ open, onOpenChange }) => {
    const [slotValues, setSlotValues] = useState(["apple", "cherry", "seven"]);
    const [isBreathing, setIsBreathing] = useState(false);

    const SlotMachineSlot = styled(View, {
        width: 100,
        height: 100,
        borderWidth: 3,
        borderColor: "rgba(0,0,0,0.1)",
        justifyContent: "center",
        alignItems: "center",
    });

    // Create animated values for each slot
    const colorAnim1 = useRef(new Animated.Value(0)).current;
    const colorAnim2 = useRef(new Animated.Value(0)).current;
    const colorAnim3 = useRef(new Animated.Value(0)).current;

    const animateColor = (animValue: Animated.Value) => {
        return Animated.loop(
            Animated.sequence([
                Animated.timing(animValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: false,
                }),
                Animated.timing(animValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
            ])
        );
    };

    const onLeverPulled = async () => {
        console.log("Pulled lever");

        const currentUser = auth.currentUser;
        if (currentUser) {
            const userDocRef = doc(db, "Users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            const currentCoins = userDoc.data()?.coins || 0;

            const cost = 10;
            if (currentCoins < cost) {
                alert("You don't have enough coins to pull the lever.");
                return;
            }

            const newCoins = currentCoins - cost;
            await loseCoins(currentUser.uid, cost);
            console.log(`You've lost ${cost} coins. You now have ${newCoins} coins.`);
        } else {
            console.log("User not authenticated");
        }

        setIsBreathing(true);
        setSlotValues([getRandomSlotValue(), getRandomSlotValue(), getRandomSlotValue()]);

        setTimeout(() => {
            setIsBreathing(false);
        }, 2000);
    };

    useEffect(() => {
        // Start isBreathing animation only if 'isBreathing' is true
        if (isBreathing) {
            const animation1 = animateColor(colorAnim1);
            const animation2 = animateColor(colorAnim2);
            const animation3 = animateColor(colorAnim3);
            animation1.start();
            animation2.start();
            animation3.start();

            const timer = setTimeout(() => {
                animation1.stop();
                animation2.stop();
                animation3.stop();
                setIsBreathing(false);

                grantCoins();
            }, 1000);

            return () => clearTimeout(timer);
        } else {
            colorAnim1.setValue(0);
            colorAnim2.setValue(0);
            colorAnim3.setValue(0);
        }
    }, [isBreathing]);

    const grantCoins = () => {
        if (slotValues[0] === slotValues[1] && slotValues[1] === slotValues[2]) {
            const reward =
                slotOptions.find((option) => option.symbol === slotValues[0])?.reward || 0;
            earnCoins(auth.currentUser.uid, reward);
            alert(`Jackpot! All slots show "${slotValues[0]}". You've earned ${reward} coins!`);
        }
    };

    // Interpolated color values
    const color1 = colorAnim1.interpolate({
        inputRange: [0, 1],
        outputRange: ["black", "white"],
    });
    const color2 = colorAnim2.interpolate({
        inputRange: [0, 1],
        outputRange: ["black", "white"],
    });
    const color3 = colorAnim3.interpolate({
        inputRange: [0, 1],
        outputRange: ["black", "white"],
    });

    return (
        <Dialog modal open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay key="overlay" />
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
                >
                    <Dialog.Title>Slot Machine</Dialog.Title>

                    <YStack alignItems="center" marginVertical="$4">
                        <XStack marginBottom={10} gap="$3">
                            <SlotMachineSlot>
                                {isBreathing ? (
                                    <Animated.Text style={{ color: color1, fontSize: 24 }}>
                                        ?
                                    </Animated.Text>
                                ) : (
                                    <SlotMachineSlotIcon icon={slotValues[0]} />
                                )}
                            </SlotMachineSlot>
                            <SlotMachineSlot>
                                {isBreathing ? (
                                    <Animated.Text style={{ color: color2, fontSize: 24 }}>
                                        ?
                                    </Animated.Text>
                                ) : (
                                    <SlotMachineSlotIcon icon={slotValues[1]} />
                                )}
                            </SlotMachineSlot>
                            <SlotMachineSlot>
                                {isBreathing ? (
                                    <Animated.Text style={{ color: color3, fontSize: 24 }}>
                                        ?
                                    </Animated.Text>
                                ) : (
                                    <SlotMachineSlotIcon icon={slotValues[2]} />
                                )}
                            </SlotMachineSlot>
                        </XStack>

                        <Button onPress={onLeverPulled}>
                            <Text>Pull Lever (-10 coins)</Text>
                        </Button>
                    </YStack>

                    <Dialog.Close displayWhenAdapted asChild>
                        <Button
                            onPress={() => {
                                onOpenChange(false);
                            }}
                            theme="alt1"
                            aria-label="Save"
                        >
                            Close
                        </Button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};
