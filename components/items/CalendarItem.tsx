import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Animated, PanResponder } from 'react-native';
import { Button, Text, YStack, XStack, Image } from 'tamagui';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { CalendarItemProps, CalendarItemComponent, Event } from 'models/CalendarModel'
import { calendarStyles } from 'styles/CalendarStyles'
import { BOTTOM_BAR_HEIGHT } from 'styles/WhiteboardStyles';
import { AddEventModal } from 'components/AddEventModal';

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
        console.log(itemData.currentDate, parseISO(itemData.currentDate));
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
      console.log("Events when modal opens:", events);
    }
  }, [isActive]);

  useEffect(() => {
    if (itemData.currentDate) {
      try {
        const parsedDate = parseISO(itemData.currentDate);
        console.log("parsedDate", parsedDate);
        console.log(format(currentDate, 'MMMM'));
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

  const renderCalendarPreview = () => (
    <View style={calendarStyles.previewContainer}>
      <Text style={calendarStyles.monthText}>{format(currentDate, 'MMMM')}</Text>
      <Text style={calendarStyles.dayText}>{format(currentDate, 'd')}</Text>
      {events.length > 0 && (
        <View style={calendarStyles.eventContainer}>
          <Text style={calendarStyles.eventText}>{events[0].title}</Text>
          {events.length > 1 && (
            <View style={calendarStyles.eventIndicator}>
              <Text style={calendarStyles.eventIndicatorText}>+{events.length - 1}</Text>
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
        const newDate = addDays(currentDate, 1);
        if (isBefore(newDate, new Date())) {
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
        <View style={[calendarStyles.modalWrapper, { backgroundColor: '#DEB887' }]}>
          <YStack style={calendarStyles.modalContent}>
            <View {...panResponder.panHandlers}>
              <Text style={calendarStyles.monthText}>{format(currentDate, 'MMMM')}</Text>
              <Text style={calendarStyles.dayText}>{format(currentDate, 'd')}</Text>
              <View style={calendarStyles.eventListContainer}>
                {events.map((event, index) => (
                  <Text key={index} style={calendarStyles.eventListText}>{event.title}</Text>
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
            <Button
              theme="red"
              onPress={handleCloseModal}
              marginBottom="$4"
            >
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
      />
    </Modal>
  );
};

CalendarItem.getInitialData = () => ({
  currentDate: new Date().toISOString(),
  events: [],
});

export default CalendarItem;
