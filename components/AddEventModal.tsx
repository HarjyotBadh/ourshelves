import React, { useState, useEffect } from 'react';
import { Modal, View } from 'react-native';
import { Button, Text, YStack, Input } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Event } from 'models/CalendarModel';
import { startOfDay } from 'date-fns';

interface AddEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddEvent: (event: Event) => void;
  currentDate: Date;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isVisible, onClose, onAddEvent, currentDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(startOfDay(currentDate));

  useEffect(() => {
    if (isVisible) {
      setDate(startOfDay(currentDate));
    }
  }, [isVisible, currentDate]);

  const handleAddEvent = () => {
    if (title.trim()) {
      onAddEvent({ title: title.trim().slice(0, 50), date: date.toISOString() });
      setTitle('');
      onClose();
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <YStack backgroundColor="$pink6" padding="$4" borderRadius="$4" width={300} alignItems='center'>
          <Text fontSize="$6" fontWeight="bold" marginBottom="$4">Add Event</Text>
          <Input
            value={title}
            onChangeText={(text) => setTitle(text.slice(0, 50))}
            placeholder="Event Title (max 50 characters)"
            marginBottom="$4"
            maxLength={50}
            placeholderTextColor="$gray11"
          />
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => setDate(selectedDate || date)}
            style={{ marginBottom: 16 }}
          />
          <Button 
            onPress={handleAddEvent} 
            width="100%" 
            backgroundColor="$green10" 
            disabled={!title.trim()}
            opacity={!title.trim() ? 0.5 : 1}
          >
            Add Event
          </Button>
          <Button onPress={onClose} marginTop="$2" width="100%" backgroundColor="$red10">Cancel</Button>
        </YStack>
      </View>
    </Modal>
  );
};
