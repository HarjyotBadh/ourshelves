import React from 'react';
import {ScrollView} from 'react-native';
import { YStack } from 'tamagui';
import Shelf from '../../components/Shelf';
import { useNavigation } from '@react-navigation/native';

const RoomScreen = () => {
    const shelves = Array(10).fill(null);
    const navigation = useNavigation();

    // Change the headerTitle to "Room"
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Room',
        });
    }, [navigation]);

    return (
        <ScrollView>
            <YStack backgroundColor="#f0e6d2" padding="$4" gap="$6">
                {shelves.map((_, index) => (
                    <Shelf key={index} shelfNumber={index + 1} />
                ))}
            </YStack>
        </ScrollView>
    );
};

export default RoomScreen;