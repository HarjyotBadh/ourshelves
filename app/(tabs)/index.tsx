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
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "firebaseConfig";

interface RoomData {
  name: string;
  admins: { path: string }[];
  tags?: string[];
}

interface Room {
  id: string;
  name: string;
  isAdmin: boolean;
  tags: string[];
}

const HomeScreen = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagIdsList, setTagIdsList] = useState<string[]>([]);
  const router = useRouter();
  const pushToken = useContext(PushTokenContext);

  const homeSetRooms = () => {
    if (!auth.currentUser) {
      return;
    }

    const userRef = doc(db, "Users", auth.currentUser.uid);

    const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const roomRefs = userData.rooms || [];

        const roomsData = await Promise.all(
          roomRefs.map(async (roomRef) => {
            const roomDoc = await getDoc(roomRef);

            if (roomDoc.exists()) {
              const roomData = roomDoc.data() as RoomData;
              const isAdmin = roomData.admins.some((adminRef) =>
                adminRef.path.includes(auth.currentUser!.uid)
              );

              return {
                id: roomDoc.id,
                name: roomData.name,
                isAdmin: isAdmin,
                tags: roomData.tags || [],
              };
            }
            return null;
          })
        );

        const validRooms = roomsData.filter((room): room is Room => room !== null);
        setRooms(validRooms);
      }
    });

    return unsubscribe;
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
      Alert.alert("Room Created", `Room "${roomName}" created.`);
    } else {
      Alert.alert(
        "Error",
        `An error occurred while creating the room. Yell this to Jack: \n\n${result.message}`
      );
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
    let unsubscribe: (() => void) | undefined;

    if (auth.currentUser) {
      unsubscribe = homeSetRooms();

      getTags().then((result) => {
        setTagsList(result.tagNames);
        setTagIdsList(result.tagIds);
      });
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
