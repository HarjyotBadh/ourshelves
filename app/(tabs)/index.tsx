import { StyleSheet, Alert } from "react-native";
import { View, ScrollView, styled } from "tamagui";
import HomeTile from "../../components/HomeTile";
import CreateHomeTile from "../../components/CreateHomeTile";
import { useEffect, useState, useContext } from "react";
import { auth } from "firebaseConfig";
import {
  getRooms,
  getRoomById,
  leaveRoom,
  createRoom,
  getTags,
  addTag,
  deleteRoom,
} from "project-functions/homeFunctions";
import { useRouter } from "expo-router";
import { PushTokenContext } from "../_layout";

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
  const pushToken = useContext(PushTokenContext);

  const homeSetRooms = async () => {
    if (!auth.currentUser) {
      return;
    }
    const result = await getRooms(auth.currentUser.uid);
    const roomsData: Room[] = result.rooms.map((room: any) => ({
      id: room.id,
      name: room.name,
      isAdmin: room.isAdmin,
      tags: room.tags,
    }));
    setRooms(roomsData);
  };

  const homeLeaveRoom = async (roomId: string, roomName: string) => {
    const result = await leaveRoom(roomId);

    if (result.success) {
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));

      Alert.alert("Room Left", `Left room "${roomName}".`);
    } else {
      Alert.alert("Error", `${result.message}`);
    }
  };

  const homeDeleteRoom = async (roomId: string, roomName: string) => {
    const result = await deleteRoom(roomId);

    if (result.success) {
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));

      Alert.alert("Room Deleted", `Room "${roomName}" deleted.`);
    }
  };

  const homeCreateRoom = async (roomName: string, roomDescription: string) => {
    if (roomName === "") {
      Alert.alert("Error", "Room name cannot be empty.");
      return;
    }

    const result = await createRoom(roomName, roomDescription);

    if (result.success) {
      const getRoomResult = await getRoomById(result.message);

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

        Alert.alert("Room Created", `Room "${getRoomResult.room.name}" created.`);
      } else {
        Alert.alert(
          "Error",
          `An error occurred while creating the room. Yell this to Jack: \n\n${result.message}`
        );
      }
    }
  };

  const homeAddTag = async (roomId: string, tagId: string, tagName: string) => {
    const result = await addTag(roomId, tagId);

    if (result.success) {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, tags: [...room.tags, tagName] } : room
        )
      );

      Alert.alert("Tag Added", `Tag "${tagName}" added to room.`);
    }
  };

  const enterRoom = (id: string) => {
    router.push({
      pathname: "/(room)/room",
      params: {
        roomId: id,
      },
    });
  };

  useEffect(() => {
    homeSetRooms();

    getTags().then((result) => {
      setTagsList(result.tagNames);
      setTagIdsList(result.tagIds);
    });
  }, []);

  useEffect(() => {
    if (pushToken) {
      console.log("Push Token for this device:", pushToken);
    }
  }, [pushToken]);

  const HomePageContainer = styled(View, {
    backgroundColor: "#fff2cf",
    flex: 1,
  });

  return (
    <HomePageContainer>
      <ScrollView contentContainerStyle={styles.homeContainer}>
        {rooms.map((room) => (
          <HomeTile
            key={room.id}
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
        <CreateHomeTile key={"create-home-tile"} handleCreateRoom={homeCreateRoom} />
      </ScrollView>
    </HomePageContainer>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    // backgroundColor: '#fff2cf',
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
});

export default HomeScreen;
