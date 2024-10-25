import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, View, Animated, PanResponder } from "react-native";
import { Button, Text, YStack, XStack, Image } from "tamagui";
import {
  format,
  addDays,
  isBefore,
  parseISO,
  startOfDay,
  isSameDay,
} from "date-fns";
import {
  CalendarItemProps,
  CalendarItemComponent,
  Event,
} from "models/CalendarModel";
import { calendarStyles } from "styles/CalendarStyles";
import { BOTTOM_BAR_HEIGHT } from "styles/WhiteboardStyles";
import { AddEventModal } from "components/AddEventModal";

const CalendarItem: CalendarItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (itemData.currentDate) {
      try {
        return parseISO(itemData.currentDate);
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
    return new Date();
  });
  const [events, setEvents] = useState<Event[]>(itemData.events || []);
  const [isRipMode, setIsRipMode] = useState(false);
  const [isAddEventModalVisible, setIsAddEventModalVisible] = useState(false);

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (itemData.currentDate) {
      try {
        const parsedDate = parseISO(itemData.currentDate);
        setCurrentDate(parsedDate);
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
  }, [itemData.currentDate]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    onClose();
  }, [onClose]);

  const handleAddEvent = (newEvent: Event) => {
    setEvents([...events, newEvent]);
    onDataUpdate({ ...itemData, events: [...events, newEvent] });
  };

  // Filter events for the current date
  const currentEvents = useMemo(() => {
    const startOfCurrentDate = startOfDay(currentDate);
    return events.filter((event) =>
      isSameDay(parseISO(event.date), startOfCurrentDate)
    );
  }, [events, currentDate]);

  const renderCalendarPreview = () => (
    <View style={calendarStyles.previewContainer}>
      <Text style={calendarStyles.monthText}>
        {format(currentDate, "MMMM")}
      </Text>
      <Text style={calendarStyles.dayText}>{format(currentDate, "d")}</Text>
      {currentEvents.length > 0 && (
        <View style={calendarStyles.eventContainer}>
          <Text style={calendarStyles.eventText}>{currentEvents[0].title}</Text>
          {currentEvents.length > 1 && (
            <View style={calendarStyles.eventIndicator}>
              <Text style={calendarStyles.eventIndicatorText}>
                +{currentEvents.length - 1}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isRipMode,
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -50 && isRipMode) {
        console.log("ripping calendar");
        const newDate = addDays(currentDate, 1);
        console.log("newDate", newDate);
        console.log(itemData.id);

        // Compare only the dates, ignoring the time
        const today = new Date();
        const isBeforeToday =
          newDate.getDate() <= today.getDate() &&
          newDate.getMonth() <= today.getMonth() &&
          newDate.getFullYear() <= today.getFullYear();

        console.log("isBeforeToday", isBeforeToday);

        if (isBeforeToday) {
          setCurrentDate(newDate);
          onDataUpdate({ ...itemData, currentDate: newDate.toISOString() });
        }
        setIsRipMode(false);
      }
    },
  });

  if (!isActive) {
    return renderCalendarPreview();
  }

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View style={calendarStyles.modalContainer}>
        <View style={[calendarStyles.modalWrapper]}>
          <YStack style={calendarStyles.modalContent}>
            <View
              {...panResponder.panHandlers}
              style={calendarStyles.calendarView}
            >
              <Text style={calendarStyles.monthText}>
                {format(currentDate, "MMMM")}
              </Text>
              <Text style={calendarStyles.dayText}>
                {format(currentDate, "d")}
              </Text>
              <View style={calendarStyles.eventListContainer}>
                {currentEvents.map((event, index) => (
                  <Text key={index} style={calendarStyles.eventListText}>
                    {event.title}
                  </Text>
                ))}
              </View>
            </View>
            <XStack space justifyContent="center" marginVertical="$4">
              <Button
                onPress={() => setIsRipMode(!isRipMode)}
                backgroundColor={isRipMode ? "$blue8" : "$blue10"}
              >
                {isRipMode ? "Cancel Rip" : "Rip Calendar"}
              </Button>
              <Button
                onPress={() => setIsAddEventModalVisible(true)}
                backgroundColor="$green10"
              >
                Add Event
              </Button>
            </XStack>
            <XStack space justifyContent="center" marginVertical="$4">
              <Button
                onPress={() => {
                  const newDate = addDays(currentDate, -1);
                  setCurrentDate(newDate);
                  onDataUpdate({
                    ...itemData,
                    currentDate: newDate.toISOString(),
                  });
                }}
                backgroundColor="$blue10"
              >
                Previous Day (Dev)
              </Button>
              <Button
                onPress={() => {
                  const newDate = addDays(currentDate, 1);
                  setCurrentDate(newDate);
                  onDataUpdate({
                    ...itemData,
                    currentDate: newDate.toISOString(),
                  });
                }}
                backgroundColor="$blue10"
              >
                Next Day (Dev)
              </Button>
            </XStack>
            <Button theme="red" onPress={handleCloseModal} marginBottom="$4">
              Close
            </Button>
          </YStack>
          <View style={calendarStyles.bottomBar} />
        </View>
      </View>
      <AddEventModal
        isVisible={isAddEventModalVisible}
        onClose={() => setIsAddEventModalVisible(false)}
        onAddEvent={handleAddEvent}
        currentDate={currentDate}
      />
    </Modal>
  );
};

CalendarItem.getInitialData = () => ({
  currentDate: new Date().toISOString(),
  events: [],
});

export default CalendarItem;
