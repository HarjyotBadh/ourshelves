import { StyleSheet } from 'react-native';
import { Text, View, ScrollView } from 'tamagui';
import HomeTile from '../../components/HomeTile';
import CreateHomeTile from '../../components/CreateHomeTile';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db, auth } from "firebaseConfig";
import { getRooms } from 'functions/homeFunctions';
import { CodeSquare } from '@tamagui/lucide-icons';


const HomeScreen = () => {
  interface Room {
    // Define the structure of a room object based on your data
    id: string;
    name: string;
    isAdmin: boolean;
    // Add other fields as necessary
  }
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  

  const updateRooms = async () => {
    const result = await getRooms(auth.currentUser.uid);
    const roomsData: Room[] = result.rooms.map((room: any) => ({
      id: room.id,
      name: room.name,
      isAdmin: room.isAdmin,
    }));
    console.log(roomsData);
    setRooms(roomsData);
  }

  useEffect(() => {
    console.log(auth.currentUser.uid);

    updateRooms();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.homeContainer}>
      {rooms.map((room) => (
        <HomeTile id={ids[rooms.indexOf(room)]} name={room.name} isAdmin={room.isAdmin} />
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
