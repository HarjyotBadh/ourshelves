import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import {router} from "expo-router";

const HomeTile = ({ id, isAdmin }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [bgColor, setBgColor] = useState('');

    const colors = [
        '#ffbfd6',
        '#bfe0ff',
        '#b9f0e3',
        '#c7fcd6',
        '#f0ffbf',
        '#ffddbd',
        '#f0c2ff',
    ];

    useEffect(() => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setBgColor(randomColor);
    }, []);

    const handlePress = () => {
        console.log('Go to room with id:', id);

        router.push({
            pathname: "/(room)/room",
            params: {
                roomId: "zQOz0TCXM8qJSMXigI6k"
            },
        });

    };

    const handleLongPress = () => {
        setModalVisible(true);
    };

    const handleOptionSelect = (option) => {
        console.log(`Selected option: ${option}`);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={handlePress} onLongPress={handleLongPress} style={styles.pressable}>
                <View style={[styles.pressableSquare, { backgroundColor: bgColor }]} />
                <Text style={styles.pressableText}>Room {id}</Text>
            </Pressable>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{id}</Text>

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={() => handleOptionSelect('addtags')}
                            >
                                <Text style={styles.optionText}>Add Tags</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleOptionSelect('leaveroom')}
                        >
                            <Text style={[styles.optionText, styles.optionTextSerious]}>Leave Room</Text>
                        </TouchableOpacity>

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={() => handleOptionSelect('deleteroom')}
                            >
                                <Text style={[styles.optionText, styles.optionTextSerious]}>Delete Room</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

HomeTile.defaultProps = {
    isAdmin: false,
};

const styles = StyleSheet.create({
    container: {},
    pressable: {
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    pressableSquare: {
        width: 150,
        height: 150,
        borderRadius: 15,
    },
    pressableText: {
        color: '#000',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        margin: 20,
        padding: 20,
        backgroundColor: '#fff2cf',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    optionButton: {
        padding: 10,
        backgroundColor: '#f2dca0',
        borderRadius: 8,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
    },
    optionText: {
        color: 'black',
        fontSize: 16,
    },
    optionTextSerious: {
        color: '#ff0000',
    },
});

export default HomeTile;
