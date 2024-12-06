import React, { useState, useEffect } from "react";
import { TouchableWithoutFeedback, Keyboard, Alert, Pressable, Modal } from "react-native";
import {
  Text,
  YStack,
  Input,
  Button,
  ScrollView,
  Switch,
  XStack,
  SizableText,
  Checkbox,
  Stack as TamaguiStack
} from "tamagui";
import { collection, getDocs, DocumentReference, getDoc, doc } from "firebase/firestore";
import { db, auth } from "firebaseConfig";
import { useRouter, Stack } from "expo-router";
import { WandSparkles, Filter } from "@tamagui/lucide-icons";
import { getBlockedUsers } from "project-functions/blockFunctions";

interface User {
  id: string;
  displayName: string;
}

interface Room {
  id: string;
  roomName: string;
  isPublic: boolean;
  tags: DocumentReference[];
}

export default function SearchComponent() {
  const [userNames, setUserNames] = useState<User[]>([]);
  const [roomNames, setRoomNames] = useState<Room[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  
  const [isFilterOverlayVisible, setIsFilterOverlayVisible] = useState(false);
  const [zanyRooms, setZanyRooms] = useState<Room[]>([]);
  const [familyRooms, setFamRooms] = useState<Room[]>([]);
  const [closeRooms, setCloseRooms] = useState<Room[]>([]);
  const [recRooms, setRecRooms] = useState<Room[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    familyFriendly: false,
    zanyShenanigans: false,
    closeCommunity: false,
  });

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isUsersMode, setIsUsersMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const toggleFilter = (key: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const applyFilters = () => {
    setIsFilterOverlayVisible(false);
  
    let filteredRooms: Room[] = [];
  
    if (selectedFilters.familyFriendly) {
      filteredRooms = [...filteredRooms, ...familyRooms];
    }
  
    if (selectedFilters.zanyShenanigans) {
      filteredRooms = [...filteredRooms, ...zanyRooms];
    }
  
    if (selectedFilters.closeCommunity) {
      filteredRooms = [...filteredRooms, ...closeRooms];
    }
  
    const seenIds = new Set();
    filteredRooms = filteredRooms.filter(room => {
      if (seenIds.has(room.id)) {
        return false;
      }
      seenIds.add(room.id);
      return true;
    });
  
    setRoomNames(filteredRooms);
  };

  const filterRooms = () => {
    if (!isUsersMode) {
      setIsFilterOverlayVisible(true);
    }
  };

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
        const rooms: Room[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as { name: string; isPublic: boolean; tags: DocumentReference[] };
          return {
            id: doc.id,
            roomName: data.name,
            isPublic: data.isPublic,
            tags: data.tags,
          };
        });

        const publicRooms = rooms.filter((room) => room.isPublic);

        // Reset the room category arrays
        setFamRooms([]);
        setCloseRooms([]);
        setZanyRooms([]);

        for (let i = 0; i < publicRooms.length; i++) {
          for (const ref of publicRooms[i].tags) {
            const tagDoc = await getDoc(ref);
            if (tagDoc.exists()) {
              const tagData = tagDoc.data();
              if (tagData.name === "Family Friendly") {
                setFamRooms((prev) => [...prev, publicRooms[i]]);
              } else if (tagData.name === "Close Community") {
                setCloseRooms((prev) => [...prev, publicRooms[i]]);
              } else if (tagData.name === "Zany Shenanigans") {
                setZanyRooms((prev) => [...prev, publicRooms[i]]);
              }
            }
          }
        }

        setRooms(publicRooms);
        setRoomNames(publicRooms);
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
    setSearchQuery("");
    fetchData();
  };

  const selectUser = (userId: string) => {
    router.push(`/other_user_page?profileId=${userId}`);
  };

  const selectRoom = (id: string) => {
    setIsPopupVisible(false);
    router.push(`/other_room_page?roomId=${id}`);
  };

  const recommendedRooms = async () => {
    let userTags: string[] = [];
    let recommendedRooms: Room[] = [];
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      Alert.alert("User not authenticated");
      return;
    }

    try {
      const userDocRef = doc(db, "Users", currentUserId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        userTags = userDocSnap.data().tags || [];
      } else {
        console.log("No user document found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error fetching user data");
      return;
    }

    const sortRoomsByTags = (rooms: Room[]) => {
      return rooms.sort((a, b) => b.tags.length - a.tags.length);
    };

    if (userTags.length === 0) {
      Alert.alert("Apply Tags to Your Profile For Room Recommendations");
      return;
    }

    setIsPopupVisible(true);

    if (userTags.length === 3) {
      const sortedRooms = sortRoomsByTags(rooms.filter(room => room.tags.length > 0));
      setRecRooms(sortedRooms);
    } else if (userTags.length === 2 || userTags.length === 1) {
      if (userTags.includes("zanyShenanigans")) {
        recommendedRooms = [...zanyRooms];
      }
      if (userTags.includes("closeCommunity")) {
        recommendedRooms = [...recommendedRooms, ...closeRooms];
      }
      if (userTags.includes("familyFriendly")) {
        recommendedRooms = [...recommendedRooms, ...familyRooms];
      }

      const sortedRooms = sortRoomsByTags(recommendedRooms);
      const uniqueRooms = Array.from(new Set(sortedRooms.map(room => room.id)))
        .map(id => sortedRooms.find(room => room.id === id)!);
      setRecRooms(uniqueRooms);
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
    setRecRooms([]);
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
          <XStack justifyContent="center" alignItems="center" marginBottom="$3" gap="$2">
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
                display="flex"
                onPress={recommendedRooms}
                icon={<WandSparkles size="$2" />}
              />
            )}
          </XStack>

          <XStack gap="$2" marginBottom="$1" verticalAlign="center">
            <Input
              width="$20"
              height="$5"
              borderWidth={1}
              borderColor="$gray8"
              marginBottom="$4"
              placeholder={`Search for a ${isUsersMode ? "user" : "room"}`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              color="$color"
            />
            {!isUsersMode && (
              <Button
                size="$4"
                height="$5"
                color="$white"
                onPress={filterRooms}
                icon={<Filter size="$2" />}
              />
            )}
          </XStack>

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

          {/* Recommended Rooms Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isPopupVisible}
            onRequestClose={closePopup}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <YStack
                f={1}
                justifyContent="center"
                alignItems="center"
                backgroundColor="rgba(0, 0, 0, 0.5)"
              >
                <YStack
                  width="90%"
                  maxHeight="70%"
                  padding="$4"
                  borderRadius="$4"
                  backgroundColor="$background"
                  shadowColor="black"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.25}
                  shadowRadius={4}
                >
                  <Text fontSize="$7" marginBottom="$3" textAlign="center">
                    Recommended Rooms
                  </Text>
                  <ScrollView>
                    {recRooms.slice(0, 10).map((room) => (
                      <Pressable
                        key={room.id}
                        onPress={() => selectRoom(room.id)}
                        style={{
                          padding: 10,
                          borderBottomWidth: 1,
                          borderColor: "$gray4",
                        }}
                      >
                        <Text fontSize="$6">{room.roomName}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Button
                    onPress={closePopup}
                    size="$4"
                    color="$white"
                    backgroundColor="$gray8"
                    marginTop="$4"
                  >
                    Close
                  </Button>
                </YStack>
              </YStack>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Filter Overlay */}
          {isFilterOverlayVisible && (
            <TamaguiStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(0, 0, 0, 0.5)"
              justifyContent="center"
              alignItems="center"
              zIndex={10}
            >
              <YStack
                width="90%"
                padding="$4"
                borderRadius="$4"
                backgroundColor="$background"
                shadowColor="black"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.25}
                shadowRadius={4}
              >
                <Text fontSize="$7" marginBottom="$3">
                  Filter Rooms
                </Text>
                <YStack gap="$3">
                  <XStack alignItems="center" gap="$2">
                    <Checkbox
                      size="$4"
                      checked={selectedFilters.familyFriendly}
                      onCheckedChange={() => toggleFilter("familyFriendly")}
                    >
                      <Checkbox.Indicator />
                    </Checkbox>
                    <Text fontSize="$5">Family Friendly</Text>
                  </XStack>

                  <XStack alignItems="center" gap="$2">
                    <Checkbox
                      size="$4"
                      checked={selectedFilters.zanyShenanigans}
                      onCheckedChange={() => toggleFilter("zanyShenanigans")}
                    >
                      <Checkbox.Indicator />
                    </Checkbox>
                    <Text fontSize="$5">Zany Shenanigans</Text>
                  </XStack>

                  <XStack alignItems="center" gap="$2">
                    <Checkbox
                      size="$4"
                      checked={selectedFilters.closeCommunity}
                      onCheckedChange={() => toggleFilter("closeCommunity")}
                    >
                      <Checkbox.Indicator />
                    </Checkbox>
                    <Text fontSize="$5">Close Community</Text>
                  </XStack>
                </YStack>
                <XStack justifyContent="space-between" marginTop="$4">
                  <Button
                    onPress={applyFilters}
                    size="$4"
                    color="$white"
                    backgroundColor="$blue10"
                  >
                    Apply
                  </Button>
                  <Button
                    onPress={() => setIsFilterOverlayVisible(false)}
                    size="$4"
                    color="$white"
                    backgroundColor="$gray8"
                  >
                    Cancel
                  </Button>
                </XStack>
              </YStack>
            </TamaguiStack>
          )}
        </YStack>
      </TouchableWithoutFeedback>
    </>
  );
}