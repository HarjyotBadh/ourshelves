import React, { useState, useEffect } from "react";
import { Pressable, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Text, YStack, Input, ScrollView, Switch, XStack, SizableText } from "tamagui";
import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";
import { useRouter, Stack } from "expo-router";

interface User {
  id: string;
  displayName: string;
}

interface Room {
  id: string;
  roomName: string;
  isPublic: boolean;
}

export default function SearchList() {
  const [userNames, setUserNames] = useState<User[]>([]);
  const [roomNames, setRoomNames] = useState<Room[]>([]);
  const [isUsersMode, setIsUsersMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUserNames = async () => {
    setLoading(true);
    try {
      if (isUsersMode) {
        const dataRef = collection(db, "Users");
        const querySnapshot = await getDocs(dataRef);
        const users: User[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as { displayName: string };
          return {
            id: doc.id,
            displayName: data.displayName,
          };
        });
        setUserNames(users);
      } else {
        const dataRef = collection(db, "Rooms");
        const querySnapshot = await getDocs(dataRef);
        const rooms: Room[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as { name: string, isPublic: boolean };
          return {
            id: doc.id,
            roomName: data.name,
            isPublic: data.isPublic
          };
        });

        // Filter only the public rooms
        const publicRooms = rooms.filter((room) => room.isPublic);

        setRoomNames(publicRooms);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setUserNames([]);
      setRoomNames([]);
      return;
    }
    fetchUserNames();
  }, [searchQuery, isUsersMode]);

  const handleSwitchChange = (checked: boolean) => {
    setIsUsersMode(!checked);
    fetchUserNames(); // Fetch data whenever the mode is toggled
  };

  const filteredUserNames = userNames.filter((user) =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoomNames = roomNames.filter((room) =>
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectUser = (userId: string) => {
    router.push(`/other_user_page?profileId=${userId}`);
  };

  const selectRoom = (id: string) => {
    //router.push(`/room_page?roomId=${id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isUsersMode ? "Search Users" : "Search Rooms",
          headerBackTitle: "Home",
        }}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <YStack f={1} padding="$3">
          <XStack justifyContent="center" alignItems="center" marginBottom="$4" space="$4">
            <SizableText size="$6" color={isUsersMode ? "$color" : "$gray8"}>
              Users
            </SizableText>
            <Switch
              size="$4"
              checked={!isUsersMode}
              onCheckedChange={handleSwitchChange}
            >
              <Switch.Thumb animation="quicker" />
            </Switch>
            <SizableText size="$6" color={!isUsersMode ? "$color" : "$gray8"}>
              Rooms
            </SizableText>
          </XStack>
          <Input
            size="$6"
            borderWidth={1}
            borderColor="$gray8"
            marginBottom="$4"
            placeholder={`Search for a ${isUsersMode ? "user" : "room"}`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            color="$color"
          />

          <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
            {loading ? (
              <Text fontSize="$6" color="$color">
                Loading...
              </Text>
            ) : isUsersMode && filteredUserNames.length > 0 ? (
              filteredUserNames.map((user) => (
                <Pressable key={user.id} onPress={() => selectUser(user.id)}>
                  <Text fontSize="$10" color="$color" marginBottom="$2">
                    {user.displayName}
                  </Text>
                </Pressable>
              ))
            ) : !isUsersMode && filteredRoomNames.length > 0 ? (
              filteredRoomNames.map((room) => (
                <Pressable key={room.id} onPress={() => selectRoom(room.id)}>
                  <Text fontSize="$10" color="$color" marginBottom="$2">
                    {room.roomName}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text fontSize="$8" color="$color">
                -- No Results --
              </Text>
            )}
          </ScrollView>
        </YStack>
      </TouchableWithoutFeedback>
    </>
  );
}
