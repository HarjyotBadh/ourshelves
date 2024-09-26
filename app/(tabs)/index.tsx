import { StyleSheet, Alert } from 'react-native';
import { Text, View, ScrollView } from 'tamagui';
import HomeTile from '../../components/HomeTile';
import CreateHomeTile from '../../components/CreateHomeTile';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db, auth } from "firebaseConfig";
import { getRooms, getRoomById, leaveRoom, createRoom } from 'project-functions/homeFunctions';
import { CodeSquare } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';


const HomeScreen = () => {
  interface Room {
    id: string;
    name: string;
    isAdmin: boolean;
  }

  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();




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

  const homeCreateRoom = async (roomName: string, roomDescription: string) => {
    console.log('== Create room');

    const result = await createRoom(roomName, roomDescription);
    console.log(result.message);

    if (result.success) {
      const getRoomResult = await getRoomById(result.message);
      console.log(getRoomResult);

      if (getRoomResult.success) {
        setRooms((prevRooms) => [
          ...prevRooms,
          {
            id: getRoomResult.room.id,
            name: getRoomResult.room.name,
            isAdmin: true,
          },
        ]);

        Alert.alert(
          'Room Created',
          `Room "${getRoomResult.room.name}" created.`,
        );
      }
      else {
        Alert.alert(
          'Error',
          `An error occurred while creating the room. Yell this to Jack: \n\n${result.message}`,
        );
      }
    }
  }
  



  
  const enterRoom = (id: string) => {
    console.log('Go to room ' + id);

    router.push({
      pathname: "/(room)/room",
      params: {
        roomId: id,
      }
    });
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
      <CreateHomeTile
        handleCreateRoom={homeCreateRoom}
      />
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
