import { StyleSheet, Alert } from 'react-native';
import { Text, View, ScrollView } from 'tamagui';
import HomeTile from '../../components/HomeTile';
import CreateHomeTile from '../../components/CreateHomeTile';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db, auth } from "firebaseConfig";
import { getRooms, leaveRoom } from 'functions/homeFunctions';
import { CodeSquare } from '@tamagui/lucide-icons';


const HomeScreen = () => {
  interface Room {
    id: string;
    name: string;
    isAdmin: boolean;
  }

  const [rooms, setRooms] = useState<Room[]>([]);




  const homeSetRooms = async () => {
    const result = await getRooms(auth.currentUser.uid);
    const roomsData: Room[] = result.rooms.map((room: any) => ({
      id: room.id,
      name: room.name,
      isAdmin: room.isAdmin,
    }));
    setRooms(roomsData);
  }

  const homeLeaveRoom = async (roomId: string, roomName: string) => {
    const result = await leaveRoom(roomId);
    console.log(result);

    if (result.success) {
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));

      Alert.alert(
        'Room Left',
        `Left room "${roomName}".`,
      );
    }
    else {
      Alert.alert(
        'Error',
        `An error occurred while leaving the room. Yell this to Jack: \n\n${result.message}`,
      )
    }
  };

  



  const enterRoom = () => {
    console.log('Go to room');
  };

  const roomOptions = (option: string, roomName: string, roomId: string) => {
    if (option === 'addtags') {
      console.log('Add tags');
    } else if (option === 'leaveroom') {
      console.log('Leave room option');

      Alert.alert(
        'Leave Room',
        `Are you sure you want to leave "${roomName}" room?`,
        [
          {
        text: 'No',
        style: 'cancel',
          },
          {
        text: 'Yes',
        onPress: () => homeLeaveRoom(roomId, roomName),
          }
        ]
      )
    } else if (option === 'deleteroom') {
      console.log('Delete room');
    }
  };

  const optionCreateRoom = () => {
    console.log('Create room');


  };





  useEffect(() => {
    console.log(auth.currentUser.uid);
    homeSetRooms();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.homeContainer}>
      {rooms.map((room) => (
        <HomeTile
          id={room.id}
          name={room.name}
          isAdmin={room.isAdmin}
          enterRoom={enterRoom}
          roomOptions={roomOptions}
        />
      ))}
      <CreateHomeTile />
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  homeContainer: {
    backgroundColor: '#fff2cf',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
});

export default HomeScreen;
