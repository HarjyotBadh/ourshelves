import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native';

const HomeTile = ({ id, name, isAdmin, enterRoom, roomOptions }) => {
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

    const handleLongPress = () => {
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={enterRoom} onLongPress={handleLongPress} style={styles.pressable}>
                <View style={[styles.pressableSquare, { backgroundColor: bgColor }]} />
                <Text style={styles.pressableText}>{name}</Text>
            </Pressable>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                animationType="slide"
            >

                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{name}</Text>

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={() => roomOptions('addtags', name, id)}
                            >
                                <Text style={styles.optionText}>Add Tags</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => roomOptions('leaveroom', name, id)}
                        >
                            <Text style={[styles.optionText, styles.optionTextSerious]}>Leave Room</Text>
                        </TouchableOpacity>

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={() => roomOptions('deleteroom', name, id)}
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
        borderRadius: 16,
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
