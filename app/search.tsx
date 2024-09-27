import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, YStack } from 'tamagui';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, functions } from "firebaseConfig";


export default function NameList() {
  // Array of names
  const names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'David', 'Emily', 'Frank', 'Grace', 'Helen'];
  
  // State to store the list of users
  const [userNames, setUserNames] = useState(['']);
  const [loading, setLoading] = useState(true);

  // State to handle the search query
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user names from Firestore
  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const usersRef = collection(db, 'Users');
        const querySnapshot = await getDocs(usersRef);
        
        // Extracting the displayName field from each document
        const users = querySnapshot.docs.map(doc => doc.data().displayName);

        setUserNames(users);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUserNames();
  }, []);

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
            color: 'white' // TODO, fix this color scheming
          
          }}
          placeholder="Search for a user"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />

        {/* Scrollable List of Names */}
        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
          {filteredNames.length > 0 ? (
            filteredNames.map((name, index) => (
              <Pressable
              key={index}
              onPress={() => alert("hello!")}
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
              -- No results found --
            </Text>
          )}
        </ScrollView>
      </YStack>
    </TouchableWithoutFeedback>
  );
}
