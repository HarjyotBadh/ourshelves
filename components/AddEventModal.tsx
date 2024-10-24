import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import { Button, Text, YStack, Input } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Event } from 'models/CalendarModel';

interface AddEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddEvent: (event: Event) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isVisible, onClose, onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());

  const handleAddEvent = () => {
    if (title.trim()) {
      onAddEvent({ title: title.slice(0, 50), date: date.toISOString() });
      setTitle('');
      setDate(new Date());
      onClose();
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <YStack backgroundColor="#DEB887" padding="$4" borderRadius="$4" width={300}>
          <Text fontSize="$6" fontWeight="bold" marginBottom="$4">Add Event</Text>
          <Input
            value={title}
            onChangeText={(text) => setTitle(text.slice(0, 50))}
            placeholder="Event Title (max 50 characters)"
            marginBottom="$4"
            maxLength={50}
          />
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => setDate(selectedDate || date)}
          />
          <Button onPress={handleAddEvent}>Add Event</Button>
          <Button onPress={onClose} marginTop="$2">Cancel</Button>
        </YStack>
      </View>
    </Modal>
  );
};
