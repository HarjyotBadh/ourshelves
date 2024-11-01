import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, View, Animated, PanResponder, Dimensions, ScrollView } from "react-native";
import { Button, Text, YStack, XStack } from "tamagui";
import { useToastController } from "@tamagui/toast";
import {
  format,
  addDays,
  parseISO,
  startOfDay,
  isSameDay,
} from "date-fns";
import {
  CalendarItemComponent,
  Event,
} from "models/CalendarModel";
import { calendarStyles } from "styles/CalendarStyles";
import { AddEventModal } from "components/AddEventModal";
import { earnCoins } from "project-functions/shopFunctions";
import { auth } from "firebaseConfig";

const PulsingOutline = ({ children, isActive, style }) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  return (
    <Animated.View
      style={[
        {
          borderWidth: 2,
          borderColor: "#FFD700",
          borderRadius: 8,
          transform: [{ scale: pulseAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

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
  const [canBeRipped, setCanBeRipped] = useState(false);

  const toast = useToastController();

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

  // useEffect(() => {
  //   if (itemData.currentDate) {
  //     try {
  //       const parsedDate = parseISO(itemData.currentDate);
  //       setCurrentDate(parsedDate);
  //       setNextDate(addDays(parsedDate, 1));
  //     } catch (error) {
  //       console.error("Error parsing date:", error);
  //     }
  //   }
  // }, [itemData.currentDate]);

  
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
    // Update events if they exist in itemData
    if (itemData.events) {
      setEvents(itemData.events);
    }
  }, [itemData]);

  

  useEffect(() => {
    const newDate = addDays(currentDate, 1);
    const today = new Date();
    const isBeforeToday = newDate.getDate() <= today.getDate() &&
      newDate.getMonth() <= today.getMonth() &&
      newDate.getFullYear() <= today.getFullYear();
    setCanBeRipped(isBeforeToday);
  }, [currentDate]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    onClose();
  }, [onClose]);

  const handleAddEvent = async (newEvent: Event) => {
    try {
      // Validate the new event data
      if (!newEvent.title || !newEvent.date || !newEvent.createdBy) {
        throw new Error("Invalid event data");
      }

      // Create a sanitized event object with only the required fields
      const sanitizedEvent = {
        title: newEvent.title,
        date: newEvent.date,
        createdBy: newEvent.createdBy,
        isAllDay: Boolean(newEvent.isAllDay),
        time: newEvent.time || null, // Ensure time is never undefined
      };

      // Update local state with sanitized event
      const updatedEvents = [...events, sanitizedEvent];
      setEvents(updatedEvents);
      onDataUpdate({ ...itemData, events: updatedEvents });

      // Close the add event modal
      setIsAddEventModalVisible(false);

      // Show success message
      toast.show("Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error);
      toast.show("Failed to add event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventToDelete: Event) => {
    try {
      // Filter out the event to delete
      const updatedEvents = events.filter(
        event => !(
          event.title === eventToDelete.title &&
          event.date === eventToDelete.date &&
          event.createdBy === eventToDelete.createdBy
        )
      );
      
      // Update local state
      setEvents(updatedEvents);
      
      // Update parent component
      onDataUpdate({ ...itemData, events: updatedEvents });
      
      // Show success message
      toast.show("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.show("Failed to delete event. Please try again.");
    }
  };

  // Filter events for the current date
  const currentEvents = useMemo(() => {
    const startOfCurrentDate = startOfDay(currentDate);
    return events.filter((event) =>
      isSameDay(parseISO(event.date), startOfCurrentDate)
    );
  }, [events, currentDate]);

  const renderEventDetails = (event: Event) => (
    <View style={calendarStyles.eventListContainer}>
      <XStack alignItems="center" justifyContent="space-between">
        <YStack flex={1}>
          <Text style={calendarStyles.eventTitle}>{event.title}</Text>
          <Text style={calendarStyles.eventCreator}>Created by: {event.createdBy}</Text>
          <Text style={calendarStyles.eventTime}>
            {event.isAllDay ? 'All Day' : event.time}
          </Text>
        </YStack>
        {event.createdBy === auth.currentUser?.displayName && (
          <Button
            unstyled
            onPress={() => handleDeleteEvent(event)}
            backgroundColor="$red10"
            width={24}
            height={24}
            borderRadius={12}
            justifyContent="center"
            alignItems="center"
            marginLeft={8}
          >
            <Text color="white">X</Text>
          </Button>
        )}
      </XStack>
    </View>
  );

  const renderCalendarPreview = () => (
    <PulsingOutline isActive={canBeRipped} style={calendarStyles.previewContainer}>
      <View style={calendarStyles.previewInner}>
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
    </PulsingOutline>
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isRipMode,
    onPanResponderMove: (_, gestureState) => {
      if (isRipMode) {
        animation.setValue({ x: gestureState.dx, y: gestureState.dy });
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (isRipMode)  {
        const newDate = addDays(currentDate, 1);
        const today = new Date();
        const isBeforeToday = newDate.getDate() <= today.getDate() &&
          newDate.getMonth() <= today.getMonth() &&
          newDate.getFullYear() <= today.getFullYear();
        
        if (isBeforeToday) {
          // Immediately disable ripping and update canBeRipped
          setIsRipping(true);
          setIsRipMode(false);
          setCanBeRipped(false);
          
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
            earnCoins(auth.currentUser?.uid, 100);
            toast.show("You earned 100 coins for ripping the calendar!");
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

  const renderRipButton = () => (
    <Button
      onPress={() => setIsRipMode(!isRipMode)}
      backgroundColor={isRipMode ? "$blue8" : "$blue10"}
      style={[
        canBeRipped && !isRipMode && calendarStyles.ripButton
      ]}
      disabled={!canBeRipped}
      opacity={!canBeRipped ? 0.5 : 1}
    >
      {isRipMode ? "Cancel Rip" : "Rip Calendar"}
    </Button>
  );

  const renderCalendarView = () => (
    <View style={calendarStyles.calendarContainer}>
      <View style={[calendarStyles.calendarView, calendarStyles.nextCalendarView, { zIndex: 1 }]}>
        <View style={calendarStyles.headerContainer}>
          <Text style={calendarStyles.monthText}>
            {format(nextDate, "MMMM")}
          </Text>
          <Text style={calendarStyles.dayText}>
            {format(nextDate, "d")}
          </Text>
        </View>
        <ScrollView style={calendarStyles.eventsScrollContainer}>
          {events
            .filter((event) => isSameDay(parseISO(event.date), nextDate))
            .map((event, index) => (
              <View key={index} style={calendarStyles.eventItem}>
                <Text style={calendarStyles.eventTitle}>{event.title}</Text>
                <Text style={calendarStyles.eventDetails}>
                  By: {event.createdBy} • {event.isAllDay ? 'All Day' : event.time}
                </Text>
              </View>
            ))}
        </ScrollView>
      </View>
      
      <PulsingOutline isActive={isRipMode && canBeRipped} style={{ flex: 1, zIndex: 2 }}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            calendarStyles.calendarView,
            {
              transform: isRipping ? animation.getTranslateTransform() : [],
            },
          ]}
        >
          <View style={calendarStyles.headerContainer}>
            <Text style={calendarStyles.monthText}>
              {format(currentDate, "MMMM")}
            </Text>
            <Text style={calendarStyles.dayText}>
              {format(currentDate, "d")}
            </Text>
          </View>
          <ScrollView style={calendarStyles.eventsScrollContainer}>
            {currentEvents.map((event, index) => (
              <View key={index} style={calendarStyles.eventItem}>
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack flex={1}>
                    <Text style={calendarStyles.eventTitle}>{event.title}</Text>
                    <Text style={calendarStyles.eventDetails}>
                      By: {event.createdBy} • {event.isAllDay ? 'All Day' : event.time}
                    </Text>
                  </YStack>
                  {event.createdBy === auth.currentUser?.displayName && (
                    <Button
                      unstyled
                      onPress={() => handleDeleteEvent(event)}
                      backgroundColor="$red10"
                      width={24}
                      height={24}
                      borderRadius={12}
                      justifyContent="center"
                      alignItems="center"
                      marginLeft={8}
                    >
                      <Text color="white">X</Text>
                    </Button>
                  )}
                </XStack>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </PulsingOutline>
    </View>
  );

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
              {renderCalendarView()}
            </View>
            <XStack space justifyContent="center" marginVertical="$4">
              {renderRipButton()}
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
