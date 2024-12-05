import React, { useState, useEffect } from "react";
import { Pressable, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { Text, YStack, Input, Button, ScrollView, Switch, XStack, SizableText } from "tamagui";
import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";
import { useRouter, Stack } from "expo-router";
import { getBlockedUsers } from "project-functions/blockFunctions";
import { WandSparkles } from "@tamagui/lucide-icons";

interface User {
  id: string;
  displayName: string;
}

interface Room {
  id: string;
  roomName: string;
  isPublic: boolean;
}

export default function SearchComponent() {
  const [userNames, setUserNames] = useState<User[]>([]);
  const [roomNames, setRoomNames] = useState<Room[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isUsersMode, setIsUsersMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isUsersMode) {
        const usersRef = collection(db, "Users");
        const querySnapshot = await getDocs(usersRef);

        const users: User[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          displayName: doc.data().displayName,
        }));

        setUserNames(users);
      } else {
        const roomsRef = collection(db, "Rooms");
        const querySnapshot = await getDocs(roomsRef);

        const rooms: Room[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          roomName: doc.data().name,
          isPublic: doc.data().isPublic,
        }));

        setRoomNames(rooms.filter((room) => room.isPublic));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const users = await getBlockedUsers();
        setBlockedUsers(users);
      } catch (error) {
        console.error("Error fetching blocked users:", error);
      }
    };

    fetchBlockedUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setUserNames([]);
      setRoomNames([]);
    } else {
      fetchData();
    }
  }, [searchQuery, isUsersMode]);

  const handleSwitchChange = (checked: boolean) => {
    setIsUsersMode(!checked);
    setSearchQuery(""); // Reset the search query on mode switch
  };

  const selectUser = (userId: string) => {
    router.push(`/other_user_page?profileId=${userId}`);
  };

  const selectRoom = (roomId: string) => {
    router.push(`/other_room_page?roomId=${roomId}`);
  };

  const recommendedRooms = () => {
    setIsButtonPressed((prev) => !prev);
    if (!isButtonPressed) {
      Alert.alert("Recommended Rooms Displayed");
    }
  };

  const filteredUserNames = userNames.filter((user) =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoomNames = roomNames.filter((room) =>
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const blockedResults = filteredUserNames.filter((user) =>
    blockedUsers.includes(user.id)
  );

  const normalResults = filteredUserNames.filter((user) =>
    !blockedUsers.includes(user.id)
  );

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
            {!isUsersMode && (
              <Button
                size="$4"
                circular
                color="$white"
                justifyContent="center"
                alignItems="center"
                backgroundColor={isButtonPressed ? "$blue10" : "$gray8"}
                onPress={recommendedRooms}
                icon={<WandSparkles size="$2" />}
              />
            )}
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
            ) : isUsersMode ? (
              <>
                <Text fontSize="$6" color="$gray10">Results</Text>
                {normalResults.map((user) => (
                  <Pressable key={user.id} onPress={() => selectUser(user.id)}>
                    <Text fontSize="$9" color="$color" marginBottom="$2">
                      {user.displayName}
                    </Text>
                  </Pressable>
                ))}

                <Text fontSize="$6" color="$gray10" marginTop="$4">Blocked Users</Text>
                {blockedResults.map((user) => (
                  <Pressable key={user.id} onPress={() => selectUser(user.id)}>
                    <Text fontSize="$9" color="$color" marginBottom="$2">
                      {user.displayName}
                    </Text>
                  </Pressable>
                ))}
              </>
            ) : filteredRoomNames.length > 0 ? (
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
