import React, { useState, useEffect } from "react";
import { Modal, ScrollView, View } from "react-native";
import { YStack, Button, TextArea, Text } from "tamagui";
import { auth } from "../../firebaseConfig";
import { Timestamp } from "@firebase/firestore";
import { Alert } from "react-native";
import { NotepadText } from "@tamagui/lucide-icons";
import {
  noteboxStyles,
  NoteBoxView,
  ContentContainer,
  BottomBar,
} from "styles/NoteBoxStyles";

interface NoteBoxItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    notes: { sender: string; body: string; timestamp: Timestamp }[];
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
  };
}

interface NoteBoxItemComponent extends React.FC<NoteBoxItemProps> {
  getInitialData: () => { notes: { sender: string; body: string; timestamp: Timestamp }[] };
}

const NoteBoxItem: NoteBoxItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [notes, setNotes] = useState(itemData.notes || []);
  const [newNoteText, setNewNoteText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isOwner = itemData.placedUserId === auth.currentUser?.uid;

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

  const handleAddNote = () => {
    if (newNoteText.length === 0 || newNoteText.length > 1000) {
      Alert.alert("Error", "Note must be between 1 and 1000 characters.");
      return;
    }

    const sender = auth.currentUser?.displayName || "Unknown User";
    const newNote = {
      sender,
      body: newNoteText,
      timestamp: Timestamp.now(),
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    onDataUpdate({ ...itemData, notes: updatedNotes });
    setNewNoteText("");
    Alert.alert("Success", `Note added from ${sender}.`);
  };

  const handleDeleteNote = (sender: string, timestamp: Timestamp) => {
    const updatedNotes = notes.filter(
      (note) => !(note.sender === sender && note.timestamp.isEqual(timestamp))
    );
    setNotes(updatedNotes);
    onDataUpdate({ ...itemData, notes: updatedNotes });
    Alert.alert("Success", `Note from ${sender} deleted.`);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    onClose();
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleString();
  };

  if (!isActive) {
    return (
      <View style={noteboxStyles.inactiveContainer}>
        <View style={noteboxStyles.iconContainer}>
          <NotepadText 
            color={isOwner ? "#FFD700" : "#64b5f6"} 
            size={70} 
          />
        </View>
        {isOwner && notes.length > 0 && (
          <View style={noteboxStyles.noteCountContainer}>
            <Text style={noteboxStyles.noteCountText}>
              {notes.length}
            </Text>
          </View>
        )}
        <View style={noteboxStyles.ownerNameContainer}>
          <Text style={noteboxStyles.ownerNameText}>
            {isOwner ? "My Notebox" : `${roomInfo.users.find(user => user.id === itemData.placedUserId)?.displayName || 'Unknown'}'s Notebox`}
          </Text>
          {!isOwner && (
            <Text style={noteboxStyles.noteboxSubtext}>
              Tap to leave a note
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleModalClose}
    >
      <View style={noteboxStyles.modalContainer}>
        <NoteBoxView>
          <ContentContainer>
            <Text style={noteboxStyles.headerText}>
              {isOwner ? "Your Notes" : "Add a Note"}
            </Text>

            <YStack flex={1} mb="$4">
              {isOwner ? (
                <View style={noteboxStyles.scrollViewContainer}>
                  <ScrollView style={noteboxStyles.noteList}>
                    {notes.map((note, index) => (
                      <View key={index} style={noteboxStyles.noteItem}>
                        <Text style={noteboxStyles.noteSender}>{note.sender}</Text>
                        <Text style={noteboxStyles.noteBody}>{note.body}</Text>
                        <Text style={noteboxStyles.noteTimestamp}>
                          {formatTimestamp(note.timestamp)}
                        </Text>
                        <Button
                          onPress={() => handleDeleteNote(note.sender, note.timestamp)}
                          theme="red"
                          marginTop="$2"
                        >
                          Delete Note
                        </Button>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <>
                  <TextArea
                    value={newNoteText}
                    onChangeText={setNewNoteText}
                    placeholder="Write your note here..."
                    numberOfLines={4}
                    style={noteboxStyles.noteInput}
                    color="black"
                    placeholderTextColor="#666"
                  />
                  <View style={noteboxStyles.buttonContainer}>
                    <Button
                      theme="blue"
                      onPress={handleAddNote}
                      disabled={!newNoteText.trim()}
                      flex={1}
                    >
                      Add Note
                    </Button>
                  </View>
                </>
              )}
            </YStack>

            <Button onPress={handleModalClose} theme="red" mb="$4">
              Close
            </Button>
          </ContentContainer>
          <BottomBar />
        </NoteBoxView>
      </View>
    </Modal>
  );
};

NoteBoxItem.getInitialData = () => ({ notes: [] });

export default NoteBoxItem;