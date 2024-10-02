import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Text, YStack } from "tamagui";
import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";
import { useRouter, Stack } from "expo-router";

interface User {
  id: string;
  displayName: string;
}

export default function NameList() {
  // State to store the list of users (with document IDs)
  const [userNames, setUserNames] = useState<User[]>([]); // Explicitly typing as an array of User objects
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // State to handle the search query
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user names and their document IDs from Firestore when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      // If search query is empty, don't fetch users
      setUserNames([]);
      return;
    }

    const fetchUserNames = async () => {
      setLoading(true); // Show loading state while fetching
      try {
        const usersRef = collection(db, "Users");
        const querySnapshot = await getDocs(usersRef);

        // Extracting the displayName and document ID from each document
        const users: User[] = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Grab the document ID
          displayName: doc.data().displayName,
        }));

        setUserNames(users); // Correct typing for state
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false); // Stop loading state after fetching
      }
    };

    fetchUserNames();
  }, [searchQuery]);

  // Filtered names based on search query
  const filteredNames = userNames.filter((user) =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigating to profile screen of the selected user using document ID
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
          {/* Search Bar */}
          <TextInput
            style={{
              height: 60,
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              marginBottom: 20,
              fontSize: 40,
              color: "white", // Text color
            }}
            placeholder="Search for a user"
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />

          {/* Scrollable List of Names */}
          <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
            {loading ? (
              <Text fontSize="$6" color="$color">
                Loading...
              </Text>
            ) : filteredNames.length > 0 ? (
              filteredNames.map((user) => (
                <Pressable
                  key={user.id} // Use document ID as the key
                  onPress={
                    () => selectUser(user.id) // Pass the document ID to selectUser
                  }
                >
                  <Text
                    fontSize="$10" // Tamagui font size
                    color="$color"
                    marginBottom="$2" // Tamagui spacing
                  >
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
