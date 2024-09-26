import React, { useState } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { Text, YStack } from 'tamagui';

export default function NameList() {
  // Array of names
  const names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'David', 'Emily', 'Frank', 'Grace', 'Helen'];
  
  // State to handle the search query
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered names based on search query
  const filteredNames = names.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
          fontSize: 40
        }}
        placeholder="Search for a user"
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
      />

      {/* Scrollable List of Names */}
      <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
        {filteredNames.length > 0 ? (
          filteredNames.map((name, index) => (
            <Text
              key={index}
              fontSize="$9" // Tamagui font size
              color="$color"
              marginBottom="$2" // Tamagui spacing
            >
              {name}
            </Text>
          ))
        ) : (
          <Text fontSize="$4" color="$color">
            No results found
          </Text>
        )}
      </ScrollView>
    </YStack>
  );
}
