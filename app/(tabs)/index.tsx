import { StyleSheet, Alert } from 'react-native';
import { Text, View, ScrollView, styled } from 'tamagui';
import HomeTile from '../../components/HomeTile';
import CreateHomeTile from '../../components/CreateHomeTile';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db, auth } from "firebaseConfig";
import { getRooms, getRoomById, leaveRoom, createRoom, getTags, addTag, deleteRoom } from 'project-functions/homeFunctions';
import { CodeSquare } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';


const HomeScreen = () => {
  interface Room {
    id: string;
    name: string;
    isAdmin: boolean;
    tags: string[];
  }

  const [rooms, setRooms] = useState<Room[]>([]);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagIdsList, setTagIdsList] = useState<string[]>([]);
  const router = useRouter();




  const homeSetRooms = async () => {
    const result = await getRooms(auth.currentUser.uid);
    const roomsData: Room[] = result.rooms.map((room: any) => ({
      id: room.id,
      name: room.name,
      isAdmin: room.isAdmin,
      tags: room.tags,
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
        `${result.message}`,
      )
    }
  };

  const homeDeleteRoom = async (roomId: string, roomName: string) => {
    console.log("Delete room " + roomId);
    const result = await deleteRoom(roomId);

    if (result.success) {
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));

      Alert.alert(
        'Room Deleted',
        `Room "${roomName}" deleted.`,
      );
    }
  }

  const homeCreateRoom = async (roomName: string, roomDescription: string) => {
    console.log('== Create room');

    if (roomName === '') {
      Alert.alert(
        'Error',
        'Room name cannot be empty.',
      );
      return;
    }

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
            tags: getRoomResult.room.tags,
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

  const homeAddTag = async (roomId: string, tagId: string, tagName: string) => {
    console.log(tagId);

    const result = await addTag(roomId, tagId);

    if (result.success) {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, tags: [...room.tags, tagName] } : room
        )
      );

      Alert.alert(
        'Tag Added',
        `Tag "${tagName}" added to room.`,
      );
    }
  };





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
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
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

    getTags().then((result) => {
      setTagsList(result.tagNames);
      setTagIdsList(result.tagIds);
    });
  }, []);




  const HomePageContainer = styled(View, {
    backgroundColor: '#fff2cf',
    flex: 1,
  }
  )

  return (
    <HomePageContainer>
      <ScrollView contentContainerStyle={styles.homeContainer}>
        {rooms.map((room) => (
          <HomeTile
            id={room.id}
            name={room.name}
            isAdmin={room.isAdmin}
            tags={room.tags}
            tagsList={tagsList}
            tagIdsList={tagIdsList}
            enterRoom={enterRoom}
            homeLeaveRoom={homeLeaveRoom}
            homeAddTag={homeAddTag}
            homeDeleteRoom={homeDeleteRoom}
          />
        ))}
        <CreateHomeTile
          handleCreateRoom={homeCreateRoom}
        />
      </ScrollView>
    </HomePageContainer>
  );
};


const styles = StyleSheet.create({
  homeContainer: {
    // backgroundColor: '#fff2cf',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
});

export default HomeScreen;
