import { Container } from '@tamagui/lucide-icons';
import { PlusCircle } from '@tamagui/lucide-icons';
import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native';

const CreateHomeTile = () => {
    const handlePress = () => {
        console.log('Create new room');
    };

    return (
        <View style={styles.createHomeContainer}>
            <Pressable onPress={handlePress} style={styles.pressable}>
                <View style={styles.pressableSquare}>
                    <PlusCircle size={75} color="rgba(0, 0, 0, 0.2)" />
                </View>
                <Text style={styles.pressableText}>Create Room</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    createHomeContainer: {

    },
    pressable: {
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    pressableSquare: {
        width: 150,
        height: 150,
        borderWidth: 8,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 15,
        borderStyle: 'dashed',

        justifyContent: 'center',
        alignItems: 'center',
    },
    pressableText: {
        color: '#000',
        fontSize: 16,
    },
});

export default CreateHomeTile;