import React, { useState, useEffect } from "react";
import { Modal, View } from "react-native";
import { Button, Text, YStack, Input, XStack, Switch, Label } from "tamagui";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Event } from "models/CalendarModel";
import { startOfDay, format } from "date-fns";
import { auth } from "firebaseConfig";

interface AddEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddEvent: (event: Event) => void;
  currentDate: Date;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isVisible,
  onClose,
  onAddEvent,
  currentDate,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(startOfDay(currentDate));
  const [isAllDay, setIsAllDay] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (isVisible) {
      setDate(startOfDay(currentDate));
      setTime(new Date());
    }
  }, [isVisible, currentDate]);

  const handleAddEvent = () => {
    if (title.trim()) {
      const eventData: Event = {
        title: title.trim().slice(0, 50),
        date: date.toISOString(),
        createdBy: auth.currentUser?.displayName || "Unknown User",
        isAllDay,
        time: isAllDay ? undefined : format(time, "HH:mm"),
      };

      onAddEvent(eventData);
      setTitle("");
      setIsAllDay(false);
      onClose();
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <YStack
          backgroundColor="$pink6"
          padding="$4"
          borderRadius="$4"
          width={300}
          alignItems="center"
        >
          <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
            Add Event
          </Text>
          <Input
            value={title}
            onChangeText={(text) => setTitle(text.slice(0, 50))}
            placeholder="Event Title (max 50 characters)"
            marginBottom="$4"
            maxLength={50}
            placeholderTextColor="$gray11"
          />

          <XStack alignItems="center" marginBottom="$4" space>
            <Label htmlFor="all-day">All Day</Label>
            <Switch
              id="all-day"
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
              size="$4"
              backgroundColor={isAllDay ? "$blue10" : "$gray5"}
              borderColor={isAllDay ? "transparent" : "$gray8"}
              borderWidth={1}
            >
              <Switch.Thumb
                animation="quick"
                backgroundColor="$background"
                scale={0.9}
              />
            </Switch>
          </XStack>

          <XStack>
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => setDate(selectedDate || date)}
              style={{ marginBottom: 16 }}
            />

            {!isAllDay && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={(event, selectedDate) =>
                  setDate(selectedDate || time)
                }
                style={{ marginBottom: 16 }}
              />
            )}
          </XStack>

          <Button
            onPress={handleAddEvent}
            width="100%"
            backgroundColor="$green10"
            disabled={!title.trim()}
            opacity={!title.trim() ? 0.5 : 1}
          >
            Add Event
          </Button>
          <Button
            onPress={onClose}
            marginTop="$2"
            width="100%"
            backgroundColor="$red10"
          >
            Cancel
          </Button>
        </YStack>
      </View>
    </Modal>
  );
};
