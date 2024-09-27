import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, YStack } from 'tamagui';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";


export default function NameList() {
  // State to store the list of users
  const [userNames, setUserNames] = useState(['']);
  const [loading, setLoading] = useState(false);

  // State to handle the search query
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user names from Firestore when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If search query is empty, don't fetch users
      setUserNames([]);
      return;
    }

    const fetchUserNames = async () => {
      setLoading(true); // Show loading state while fetching
      try {
        const usersRef = collection(db, 'Users');
        // Optionally, you could filter by displayName that starts with the search query
        const querySnapshot = await getDocs(usersRef);
        
        // Extracting the displayName field from each document
        const users = querySnapshot.docs.map(doc => doc.data().displayName);

        setUserNames(users);

      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false); // Stop loading state after fetching
      }
    };

    fetchUserNames();
  }, [searchQuery]);

  // Filtered names based on search query
  const filteredNames = userNames.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <YStack f={1} padding="$3"> 
        {/* Search Bar */}
        <TextInput
          style={{
            height: 60,
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            marginBottom: 20,
            fontSize: 40,
            color: 'white' // Text color
          }}
          placeholder="Search for a user"
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />

        {/* Scrollable List of Names */}
        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
          {loading ? (
            <Text fontSize="$6" color="$color">
              Loading...
            </Text>
          ) : filteredNames.length > 0 ? (
            filteredNames.map((name, index) => (
              <Pressable
                key={index}
                onPress={() => alert(`Hello, ${name}!`)}
              >
                <Text
                  fontSize="$10" // Tamagui font size
                  color="$color"
                  marginBottom="$2" // Tamagui spacing
                >
                  {name}
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
  );
}
