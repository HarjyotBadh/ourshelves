import React, { useState, useEffect } from "react";
import {
  View,
  styled,
  YStack,
  Input,
  Button,
  Text,
  Dialog,
  XStack,
  ScrollView,
  Image,
} from "tamagui";
import { Search, Calendar, Users, MapPin, X, AlertTriangle, Filter } from "@tamagui/lucide-icons";
import Constants from "expo-constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, SafeAreaView, StatusBar } from "react-native";

interface EventPlannerItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    [key: string]: any;

    attendingEvents: Array<{
      id: string;
      name: string;
      date: string;
      time?: string;
      venue: string;
      city?: string;
      state?: string;
      image: string;
      attendees: Array<{
        userId: string;
        displayName: string;
        profilePicture?: string;
      }>;
    }>;
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  };
}

interface EventPlannerItemComponent extends React.FC<EventPlannerItemProps> {
  getInitialData: () => { attendingEvents: Array<any> };
}

export const BACKGROUND_COLOR = "$yellow2Light";
export const HEADER_BACKGROUND = "#8B4513";

export const Container = styled(YStack, {
  flex: 1,
  backgroundColor: BACKGROUND_COLOR,
});

export const Content = styled(View, {
  flex: 1,
});

export const Header = styled(XStack, {
  height: 60,
  backgroundColor: HEADER_BACKGROUND,
  alignItems: "center",
  paddingHorizontal: "$4",
});

export const SafeAreaWrapper = styled(SafeAreaView, {
  flex: 1,
  backgroundColor: HEADER_BACKGROUND,
  paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
});

interface Event {
  id: string;
  name: string;
  date: string;
  time?: string;
  venue: string;
  city?: string;
  state?: string;
  image: string;
  attendees: Array<{
    userId: string;
    displayName: string;
    profilePicture?: string;
  }>;
}

const StyledDialogContent = styled(Dialog.Content, {
  backgroundColor: "$yellow2Light",
  borderRadius: "$6",
  width: "94%",
  maxWidth: 600,
  borderWidth: 2,
  borderColor: "#8B4513",
  shadowColor: "$shadowColor",
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
});

const StyledHeader = styled(XStack, {
  height: 60,
  backgroundColor: "#8B4513",
  alignItems: "center",
  paddingHorizontal: "$4",
  borderTopLeftRadius: "$4",
  borderTopRightRadius: "$4",
  marginTop: -20,
  marginHorizontal: -20,
});

const StyledTabContainer = styled(XStack, {
  backgroundColor: "rgba(139, 69, 19, 0.1)",
  padding: "$2",
  borderRadius: "$4",
  space: "$2",
  marginTop: "$4",
});

const StyledEventCard = styled(YStack, {
  backgroundColor: "white",
  borderRadius: "$4",
  overflow: "hidden",
  elevation: 2,
  borderWidth: 1,
  borderColor: "#8B4513",
});

const EventPlannerView = styled(YStack, {
  alignItems: "center",
  justifyContent: "center",
  padding: "$2",
  backgroundColor: "white",
  borderRadius: "$4",
  borderWidth: 1,
  borderColor: "#8B4513",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  margin: "$1",
});

const StyledInput = styled(Input, {
  backgroundColor: "white",
  borderWidth: 1,
  borderColor: "#8B4513",
  color: "black",

  hoverStyle: {
    borderColor: "#A0522D",
  },
  focusStyle: {
    borderColor: "#A0522D",
    borderWidth: 2,
  },
});

const StyledSearchButton = styled(Button, {
  backgroundColor: "#8B4513",
  borderWidth: 1,
  borderColor: "#6B3410",

  hoverStyle: {
    backgroundColor: "#A0522D",
  },
  pressStyle: {
    backgroundColor: "#6B3410",
  },
});

const StyledFilterButton = styled(Button, {
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: "#8B4513",
  color: "#8B4513",

  variants: {
    active: {
      true: {
        backgroundColor: "#8B4513",
        color: "white",
      },
    },
  },
});

const FilterContainer = styled(YStack, {
  backgroundColor: "rgba(139, 69, 19, 0.08)",
  padding: "$4",
  borderRadius: "$4",
  borderWidth: 1,
  borderColor: "#8B4513",
  marginTop: "$2",
});

const EventPlannerItem: EventPlannerItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "attending">("attending");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmUnattendEvent, setConfirmUnattendEvent] = useState<Event | null>(null);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState<Event | null>(null);
  const [cityFilter, setCityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  useEffect(() => {
    if (!itemData.hasOwnProperty("attendingEvents")) {
      const initialData = EventPlannerItem.getInitialData();
      onDataUpdate({
        ...itemData,
        ...initialData,
      });
    }
  }, []);

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (itemData.attendingEvents?.length) {
      const now = new Date();
      const filteredEvents = itemData.attendingEvents.filter((event) => {
        const eventDate = new Date(`${event.date}${event.time ? `T${event.time}` : "T00:00:00"}`);
        const hoursSinceEvent = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
        return hoursSinceEvent < 48;
      });

      if (filteredEvents.length !== itemData.attendingEvents.length) {
        console.log("An event was removed from the list");
        onDataUpdate({
          ...itemData,
          attendingEvents: filteredEvents,
        });
      }
    }
  }, [itemData.attendingEvents]);

  const handleSearch = async () => {
    if (!searchQuery.trim() && !cityFilter && !dateFilter) return;

    setIsLoading(true);
    setError(null);

    try {
      let searchParams = new URLSearchParams();
      if (searchQuery.trim()) {
        searchParams.append("keyword", searchQuery);
      }
      if (cityFilter) {
        searchParams.append("city", cityFilter);
      }
      if (dateFilter) {
        const formattedDate = new Date(dateFilter).toISOString().split("T")[0];
        searchParams.append("startDateTime", `${formattedDate}T00:00:00Z`);
        searchParams.append("endDateTime", `${formattedDate}T23:59:59Z`);
      }
      searchParams.append("apikey", Constants.expoConfig?.extra?.ticketmasterApiKey);
      searchParams.append("size", "10");
      searchParams.append("sort", "date,asc");

      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?${searchParams.toString()}`
      );

      const data = await response.json();

      if (data._embedded && data._embedded.events) {
        const formattedEvents: Event[] = data._embedded.events.map((event: any) => ({
          id: event.id,
          name: event.name,
          date: event.dates.start.localDate,
          time: event.dates.start.localTime,
          venue: event._embedded?.venues?.[0]?.name || "Venue TBA",
          city: event._embedded?.venues?.[0]?.city?.name,
          state: event._embedded?.venues?.[0]?.state?.stateCode,
          image:
            event.images.find((img: any) => img.ratio === "16_9" && img.width > 500)?.url ||
            event.images[0]?.url,
          attendees: [],
        }));
        setSearchResults(formattedEvents);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setError("Failed to search events. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsAttending = (event: any) => {
    const newAttendee = {
      userId: itemData.placedUserId,
      displayName:
        roomInfo.users.find((u) => u.id === itemData.placedUserId)?.displayName || "Unknown User",
      profilePicture: roomInfo.users.find((u) => u.id === itemData.placedUserId)?.profilePicture,
    };

    const updatedEvents = [...(itemData.attendingEvents || [])];
    const existingEventIndex = updatedEvents.findIndex((e) => e.id === event.id);

    if (existingEventIndex >= 0) {
      if (
        !updatedEvents[existingEventIndex].attendees.some((a) => a.userId === newAttendee.userId)
      ) {
        updatedEvents[existingEventIndex].attendees.push(newAttendee);
      }
    } else {
      updatedEvents.push({
        id: event.id,
        name: event.name || "Untitled Event",
        date: event.date || "Unknown Date",
        time: event.time || "",
        venue: event.venue || "Unknown Venue",
        city: event.city || "",
        state: event.state || "",
        image: event.image || "",
        attendees: [newAttendee],
      });
    }

    const updatedItemData = {
      ...itemData,
      attendingEvents: updatedEvents,
    };

    console.log("updatedItemData", updatedItemData);

    onDataUpdate(updatedItemData);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose();
  };

  const handleUnattendEvent = (event: Event) => {
    const updatedEvents = itemData.attendingEvents.filter((e) => e.id !== event.id);

    const updatedItemData = {
      ...itemData,
      attendingEvents: updatedEvents,
    };

    onDataUpdate(updatedItemData);
    setConfirmUnattendEvent(null);
  };

  const openFiltersDialog = () => {
    setFiltersDialogOpen(true);
  };

  const closeFiltersDialog = () => {
    setFiltersDialogOpen(false);
  };

  const applyFilters = () => {
    setFiltersDialogOpen(false);
    handleSearch();
  };

  const filtersDialogContent = (
    <StyledDialogContent>
      <StyledHeader>
        <Text color="white" fontSize="$6" flex={1} textAlign="center" fontWeight="bold">
          Filters
        </Text>
        <Dialog.Close asChild>
          <Button
            size="$3"
            circular
            icon={X}
            backgroundColor="transparent"
            hoverStyle={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
        </Dialog.Close>
      </StyledHeader>

      <YStack space="$4" padding="$4">
        <StyledInput
          placeholder="Filter by city..."
          value={cityFilter}
          onChangeText={setCityFilter}
        />
        <XStack alignItems="center" space="$2">
          <Text color="#8B4513">Date: </Text>
          <DateTimePicker
            value={dateFilter ? new Date(dateFilter) : new Date()}
            mode="date"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setDateFilter(selectedDate.toISOString().split("T")[0]);
              }
            }}
          />
          {dateFilter && (
            <Button size="$2" icon={X} onPress={() => setDateFilter("")} backgroundColor="#8B4513">
              <Text color="white">Clear</Text>
            </Button>
          )}
        </XStack>
        <XStack justifyContent="flex-end" space="$2">
          <Button onPress={closeFiltersDialog} backgroundColor="$gray5">
            <Text>Cancel</Text>
          </Button>
          <Button onPress={applyFilters} backgroundColor="#8B4513">
            <Text color="white">Apply</Text>
          </Button>
        </XStack>
      </YStack>
    </StyledDialogContent>
  );

  const searchFiltersJsx = (
    <XStack justifyContent="flex-end">
      <StyledFilterButton
        size="$2"
        icon={Filter}
        onPress={openFiltersDialog}
        active={filtersDialogOpen}
      >
        <Text color={filtersDialogOpen ? "white" : "#8B4513"}>Filters</Text>
      </StyledFilterButton>
    </XStack>
  );

  if (!isActive) {
    return (
      <YStack flex={1}>
        <EventPlannerView>
          <Image source={{ uri: itemData.imageUri }} width={24} height={24} resizeMode="contain" />
          <Text color="$blue11" fontSize="$3" marginTop="$2">
            {itemData.attendingEvents?.length ?? 0} Events
          </Text>
        </EventPlannerView>
      </YStack>
    );
  }

  return (
    <Dialog modal open={dialogOpen} onOpenChange={handleDialogClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <StyledDialogContent
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
        >
          <YStack space="$4">
            <StyledHeader>
              <Text color="white" fontSize="$6" flex={1} textAlign="center" fontWeight="bold">
                Event Planner
              </Text>
              <Dialog.Close asChild>
                <Button
                  size="$3"
                  circular
                  icon={X}
                  backgroundColor="transparent"
                  hoverStyle={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                />
              </Dialog.Close>
            </StyledHeader>

            <StyledTabContainer>
              <Button
                flex={1}
                size="$3"
                backgroundColor={activeTab === "search" ? "#8B4513" : "transparent"}
                borderColor="#8B4513"
                borderWidth={1}
                color={activeTab === "search" ? "white" : "#8B4513"}
                onPress={() => setActiveTab("search")}
                icon={Search}
                pressStyle={{
                  backgroundColor: activeTab === "search" ? "#6B3410" : "rgba(139, 69, 19, 0.2)",
                }}
              >
                <Text color={activeTab === "search" ? "white" : "#8B4513"}>Search Events</Text>
              </Button>
              <Button
                flex={1}
                size="$3"
                backgroundColor={activeTab === "attending" ? "#8B4513" : "transparent"}
                borderColor="#8B4513"
                borderWidth={1}
                color={activeTab === "attending" ? "white" : "#8B4513"}
                onPress={() => setActiveTab("attending")}
                icon={Users}
                pressStyle={{
                  backgroundColor: activeTab === "attending" ? "#6B3410" : "rgba(139, 69, 19, 0.2)",
                }}
              >
                <Text color={activeTab === "attending" ? "white" : "#8B4513"}>
                  Attending ({itemData.attendingEvents?.length ?? 0})
                </Text>
              </Button>
            </StyledTabContainer>

            {activeTab === "search" && (
              <YStack space="$4">
                <XStack space="$2">
                  <StyledInput
                    flex={1}
                    placeholder="Search for events..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <StyledSearchButton
                    size="$3"
                    icon={Search}
                    onPress={handleSearch}
                    disabled={isLoading}
                  >
                    <Text color="white">Search</Text>
                  </StyledSearchButton>
                </XStack>

                {searchFiltersJsx}

                {isLoading && (
                  <Text textAlign="center" color="$blue11">
                    Loading...
                  </Text>
                )}

                {error && (
                  <Text color="$red10" textAlign="center">
                    {error}
                  </Text>
                )}

                <ScrollView maxHeight={400} bounces={false}>
                  <YStack space="$4" padding="$2">
                    {searchResults.map((event) => (
                      <StyledEventCard
                        key={event.id}
                        backgroundColor="white"
                        borderRadius="$4"
                        overflow="hidden"
                        elevation={2}
                      >
                        <Image
                          source={{ uri: event.image }}
                          width="100%"
                          height={200}
                          resizeMode="cover"
                        />
                        <YStack padding="$4" space="$2">
                          <Text fontSize="$5" fontWeight="bold" color="$blue11">
                            {event.name}
                          </Text>
                          <XStack space="$2" alignItems="center">
                            <Calendar size={16} color="blue" />
                            <Text color="$blue11">
                              {new Date(event.date).toLocaleDateString()}{" "}
                              {event.time && `at ${event.time}`}
                            </Text>
                          </XStack>
                          <XStack space="$2" alignItems="center">
                            <MapPin size={16} color="blue" />
                            <Text color="$blue11">
                              {event.venue} {event.city && `, ${event.city}`}{" "}
                              {event.state && `, ${event.state}`}
                            </Text>
                          </XStack>
                          <Button
                            marginTop="$2"
                            backgroundColor="$blue8"
                            color="white"
                            onPress={() => handleMarkAsAttending(event)}
                            disabled={itemData.attendingEvents?.some((e) => e.id === event.id)}
                          >
                            <Text>
                              {itemData.attendingEvents?.some((e) => e.id === event.id)
                                ? "Already Attending"
                                : "Mark as Attending"}
                            </Text>
                          </Button>
                        </YStack>
                      </StyledEventCard>
                    ))}
                  </YStack>
                </ScrollView>
              </YStack>
            )}

            {activeTab === "attending" && (
              <ScrollView maxHeight={400} bounces={false}>
                <YStack space="$4" padding="$2">
                  {itemData.attendingEvents?.map((event) => (
                    <StyledEventCard
                      key={event.id}
                      backgroundColor="white"
                      borderRadius="$4"
                      overflow="hidden"
                      elevation={2}
                    >
                      <Image
                        source={{ uri: event.image }}
                        width="100%"
                        height={200}
                        resizeMode="cover"
                      />
                      <YStack padding="$4" space="$2">
                        <Text fontSize="$5" fontWeight="bold" color="$blue11">
                          {event.name}
                        </Text>
                        <XStack space="$2" alignItems="center">
                          <Calendar size={16} color="blue" />
                          <Text color="$blue11">
                            {new Date(event.date).toLocaleDateString()}{" "}
                            {event.time && `at ${event.time}`}
                          </Text>
                        </XStack>
                        <XStack space="$2" alignItems="center">
                          <MapPin size={16} color="blue" />
                          <Text color="$blue11">
                            {event.venue} {event.city && `, ${event.city}`}{" "}
                            {event.state && `, ${event.state}`}
                          </Text>
                        </XStack>

                        <YStack space="$2" marginTop="$2">
                          <Text fontSize="$4" fontWeight="bold" color="$blue11">
                            Attendees
                          </Text>
                          <XStack flexWrap="wrap" gap="$2">
                            {event.attendees.slice(0, 2).map((attendee) => (
                              <XStack
                                key={attendee.userId}
                                space="$1"
                                backgroundColor="$blue2"
                                padding="$2"
                                borderRadius="$4"
                                alignItems="center"
                              >
                                {attendee.profilePicture ? (
                                  <Image
                                    source={{ uri: attendee.profilePicture }}
                                    width={24}
                                    height={24}
                                    borderRadius={12}
                                  />
                                ) : (
                                  <View
                                    width={24}
                                    height={24}
                                    borderRadius={12}
                                    backgroundColor="$blue8"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Text color="white" fontSize="$2">
                                      {attendee.displayName.charAt(0)}
                                    </Text>
                                  </View>
                                )}
                                <Text color="$blue11">{attendee.displayName}</Text>
                              </XStack>
                            ))}
                            {event.attendees.length > 2 && (
                              <Button
                                size="$3"
                                backgroundColor="$blue2"
                                padding="$2"
                                borderRadius="$4"
                                onPress={() => setSelectedEventAttendees(event)}
                              >
                                <Text color="$blue11">+{event.attendees.length - 2}</Text>
                              </Button>
                            )}
                          </XStack>
                        </YStack>

                        <Button
                          marginTop="$2"
                          backgroundColor={
                            event.attendees.some((a) => a.userId === itemData.placedUserId)
                              ? "$red10"
                              : "$blue8"
                          }
                          color="white"
                          onPress={() => {
                            if (event.attendees.some((a) => a.userId === itemData.placedUserId)) {
                              setConfirmUnattendEvent(event);
                            } else {
                              handleMarkAsAttending(event);
                            }
                          }}
                        >
                          <Text>
                            {event.attendees.some((a) => a.userId === itemData.placedUserId)
                              ? "Unattend Event"
                              : "Mark as Attending"}
                          </Text>
                        </Button>
                      </YStack>
                    </StyledEventCard>
                  ))}
                </YStack>
              </ScrollView>
            )}
          </YStack>
        </StyledDialogContent>
      </Dialog.Portal>

      {/* Filters Dialog */}
      <Dialog modal open={filtersDialogOpen} onOpenChange={setFiltersDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            key="filters-overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          {filtersDialogContent}
        </Dialog.Portal>
      </Dialog>

      {/* Confirm Unattend Dialog */}
      <Dialog
        modal
        open={!!confirmUnattendEvent}
        onOpenChange={() => setConfirmUnattendEvent(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            key="confirm-overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="confirm-content"
            animation="quick"
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            style={{ maxWidth: 400, width: "90%" }}
          >
            <YStack space="$4" padding="$4">
              <XStack space="$2" alignItems="center">
                <AlertTriangle color="$red10" />
                <Dialog.Title>Confirm Unattend</Dialog.Title>
              </XStack>
              <Text color="$gray11">
                Are you sure you want to unattend "{confirmUnattendEvent?.name}"?
              </Text>
              <XStack space="$3" justifyContent="flex-end">
                <Button onPress={() => setConfirmUnattendEvent(null)} backgroundColor="$gray5">
                  <Text>Cancel</Text>
                </Button>
                <Button
                  onPress={() => handleUnattendEvent(confirmUnattendEvent!)}
                  backgroundColor="$red10"
                >
                  <Text color="white">Unattend</Text>
                </Button>
              </XStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog
        modal
        open={!!selectedEventAttendees}
        onOpenChange={() => setSelectedEventAttendees(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            key="attendees-overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="attendees-content"
            animation="quick"
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            style={{ maxWidth: 500, width: "90%" }}
          >
            <YStack space="$4" padding="$4">
              <XStack justifyContent="space-between" alignItems="center">
                <Dialog.Title>Event Attendees</Dialog.Title>
                <Dialog.Close asChild>
                  <Button size="$3" circular icon={X} />
                </Dialog.Close>
              </XStack>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack space="$2" padding="$2">
                  {selectedEventAttendees?.attendees.map((attendee) => (
                    <YStack
                      key={attendee.userId}
                      space="$2"
                      alignItems="center"
                      backgroundColor="$blue2"
                      padding="$3"
                      borderRadius="$4"
                      width={80}
                    >
                      {attendee.profilePicture ? (
                        <Image
                          source={{ uri: attendee.profilePicture }}
                          width={50}
                          height={50}
                          borderRadius={25}
                        />
                      ) : (
                        <View
                          width={50}
                          height={50}
                          borderRadius={25}
                          backgroundColor="$blue8"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text color="white" fontSize="$4">
                            {attendee.displayName.charAt(0)}
                          </Text>
                        </View>
                      )}
                      <Text color="$blue11" fontSize="$2" textAlign="center" numberOfLines={2}>
                        {attendee.displayName}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </Dialog>
  );
};

EventPlannerItem.getInitialData = () => ({
  attendingEvents: [],
});

export default EventPlannerItem;
