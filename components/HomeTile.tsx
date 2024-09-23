import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const HomeTile = ({ id, name, isAdmin }) => {
    const [containerVisible, setContainerVisible] = useState(true);
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
        console.log('Go to room');
    };

    const handleLongPress = () => {
        setModalVisible(true);
    };

    const handleOptionSelect = (option) => {
        if (option === 'addtags') {
            console.log('Add tags');
        } else if (option === 'leaveroom') {
            console.log('Leave room');

            Alert.alert(
                'Leave Room',
                'Are you sure you want to leave "' + name + '"?',
                [
                    {
                        text: 'No',
                        style: 'cancel',
                    },
                    {
                        text: 'Yes',
                        onPress: leaveRoom,
                    }
                ]
            )
        } else if (option === 'deleteroom') {
            console.log('Delete room');
        }


        setModalVisible(false);
    };

    const leaveRoom = async () => {
        console.log('Leaving room');
        // the id passed into the component is of the format 'Rooms/<id>'. using this, go into our firestore database and remove this id from the array in

        try {
            const userDocRef = doc(db, 'Users', auth.currentUser.uid);
            console.log(userDocRef);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                console.log('Short document data: ', userDoc.data().rooms[0].path);
                const rooms = userDoc.data().rooms;
                for (let i = 0; i < rooms.length; i++) {
                    if (rooms[i].path === id) {
                        rooms.splice(i, i+1);
                        await updateDoc(userDocRef, { rooms });
                        console.log('Room removed from user document');
                        
                        Alert.alert(
                            'Room Left',
                            'Left room "' + name + '".',
                        )

                        setContainerVisible(false);
                        break;
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        (containerVisible) &&
        <View style={styles.container}>
            <Pressable onPress={handlePress} onLongPress={handleLongPress} style={styles.pressable}>
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
