import React, { useState, useEffect } from "react";
import { Pressable, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Text, YStack, Input, ScrollView } from "tamagui";
import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";
import { useRouter, Stack } from "expo-router";

interface User {
  id: string;
  displayName: string;
}

export default function NameList() {
  const [userNames, setUserNames] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setUserNames([]);
      return;
    }

    const fetchUserNames = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "Users");
        const querySnapshot = await getDocs(usersRef);

        const users: User[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          displayName: doc.data().displayName,
        }));

        setUserNames(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserNames();
  }, [searchQuery]);

  const filteredNames = userNames.filter((user) =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectUser = async (userId: string) => {
    router.push(`/other_user_page?profileId=${userId}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Search Users",
          headerBackTitle: "Home",
        }}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <YStack f={1} padding="$3">
          <Input
            size="$6"
            borderWidth={1}
            borderColor="$gray8"
            borderRadius="$2"
            marginBottom="$4"
            placeholder="Search for a user"
            value={searchQuery}
            onChangeText={setSearchQuery}
            color="$color"
          />

          <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
            {loading ? (
              <Text fontSize="$6" color="$color">
                Loading...
              </Text>
            ) : filteredNames.length > 0 ? (
              filteredNames.map((user) => (
                <Pressable key={user.id} onPress={() => selectUser(user.id)}>
                  <Text fontSize="$10" color="$color" marginBottom="$2">
                    {user.displayName}
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
