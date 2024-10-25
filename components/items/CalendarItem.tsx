import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, View, Animated, PanResponder, Dimensions } from "react-native";
import { Button, Text, YStack, XStack, Image } from "tamagui";
import { useToastController } from "@tamagui/toast";
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
  const [animation] = useState(new Animated.ValueXY());
  const [isRipping, setIsRipping] = useState(false);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  const [nextDate, setNextDate] = useState(addDays(currentDate, 1));

  const toast = useToastController();

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
        setNextDate(addDays(parsedDate, 1));
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
    onPanResponderMove: (_, gestureState) => {
      if (isRipMode) {
        animation.setValue({ x: gestureState.dx, y: gestureState.dy });
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (isRipMode && (Math.abs(gestureState.dx) > 50 || Math.abs(gestureState.dy) > 50)) {
        const newDate = addDays(currentDate, 1);
        const today = new Date();
        const isBeforeToday = newDate.getDate() <= today.getDate() &&
        newDate.getMonth() <= today.getMonth() &&
        newDate.getFullYear() <= today.getFullYear();
        console.log("isBeforeToday", isBeforeToday);
        
        if (isBeforeToday) {
          setIsRipping(true);
          const velocity = Math.sqrt(gestureState.vx ** 2 + gestureState.vy ** 2);
          const toValue = {
            x: gestureState.vx * 200,
            y: gestureState.vy * 200,
          };
          Animated.decay(animation, {
            velocity: { x: gestureState.vx, y: gestureState.vy },
            deceleration: 0.997,
            useNativeDriver: true,
          }).start(() => {
            setIsRipping(false);
            animation.setValue({ x: 0, y: 0 });
            setCurrentDate(newDate);
            setNextDate(addDays(newDate, 1));
            onDataUpdate({ ...itemData, currentDate: newDate.toISOString() });
            setIsRipMode(false);
          });
        } else {
          // If ripping is not allowed, just reset the animation
          Animated.spring(animation, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
          toast.show("You cannot rip to a date before today");
        }
      } else {
        // Reset animation if the gesture is not strong enough
        Animated.spring(animation, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
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
            <View style={calendarStyles.calendarContainer}>
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  calendarStyles.calendarView,
                  {
                    transform: isRipping ? animation.getTranslateTransform() : [],
                    zIndex: 2,
                  },
                ]}
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
              </Animated.View>
              <View
                style={[
                  calendarStyles.calendarView,
                  calendarStyles.nextCalendarView,
                  { zIndex: 1 },
                ]}
              >
                <Text style={calendarStyles.monthText}>
                  {format(nextDate, "MMMM")}
                </Text>
                <Text style={calendarStyles.dayText}>
                  {format(nextDate, "d")}
                </Text>
                <View style={calendarStyles.eventListContainer}>
                  {events
                    .filter((event) => isSameDay(parseISO(event.date), nextDate))
                    .map((event, index) => (
                      <Text key={index} style={calendarStyles.eventListText}>
                        {event.title}
                      </Text>
                    ))}
                </View>
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
