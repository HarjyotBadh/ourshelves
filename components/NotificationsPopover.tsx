import { useState, useEffect } from "react";
import { Popover, YStack, Text, Button, XStack, ScrollView } from "tamagui";
import { Bell, X, Trash2 } from "@tamagui/lucide-icons";
import { formatDistanceToNow } from "date-fns";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { auth, db } from "firebaseConfig";
import { Alert } from "react-native";

// Add these interfaces
interface BaseNotification {
  id: string;
  type: string;
  title: string;
  timestamp: any; // Firestore Timestamp
  read: boolean;
}

interface MessageNotification extends BaseNotification {
  type: "message";
  message: string;
}

interface RoomInviteNotification extends BaseNotification {
  type: "roomInvite";
  roomId: string;
  roomName: string;
  invitedBy: string;
  invitedById: string;
}

type Notification = MessageNotification | RoomInviteNotification;

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Subscribe to notifications in the user's document
    const unsubscribe = onSnapshot(doc(db, "Users", auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setNotifications(userData.notifications || []);
      }
    });

    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTimeAgo = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  const handleAcceptInvite = async (notification: any) => {
    try {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      const roomRef = doc(db, "Rooms", notification.roomId);

      // Add user to room
      await updateDoc(roomRef, {
        users: arrayUnion(userRef),
      });

      // Add room to user's rooms
      await updateDoc(userRef, {
        rooms: arrayUnion(roomRef),
        // Remove the notification
        notifications: arrayRemove(notification),
      });

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    } catch (error) {
      console.error("Error accepting invite:", error);
      Alert.alert("Error", "Failed to accept invitation");
    }
  };

  const handleRejectInvite = async (notification: any) => {
    try {
      // Just remove the notification
      const userRef = doc(db, "Users", auth.currentUser.uid);
      await updateDoc(userRef, {
        notifications: arrayRemove(notification),
      });

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    } catch (error) {
      console.error("Error rejecting invite:", error);
      Alert.alert("Error", "Failed to reject invitation");
    }
  };

  const handleClearAll = async () => {
    try {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      await updateDoc(userRef, {
        notifications: [],
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      Alert.alert("Error", "Failed to clear notifications");
    }
  };

  const handleClearOne = async (notificationId: string) => {
    try {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      await updateDoc(userRef, {
        notifications: notifications.filter((n) => n.id !== notificationId),
      });
    } catch (error) {
      console.error("Error clearing notification:", error);
      Alert.alert("Error", "Failed to clear notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      await updateDoc(userRef, {
        notifications: notifications.map((n) => ({ ...n, read: true })),
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Add this effect to mark notifications as read when popover opens
  useEffect(() => {
    if (open && notifications.some((n) => !n.read)) {
      markAllAsRead();
    }
  }, [open]);

  return (
    <Popover
      open={open && notifications.length > 0}
      onOpenChange={(isOpen) => {
        if (!notifications.length && isOpen) {
          return;
        }
        setOpen(isOpen);
      }}
      placement="bottom-end"
      allowFlip
    >
      <Popover.Trigger asChild>
        <Button size="$3.5" circular position="relative" icon={<Bell size="$3" />} mr="$3">
          {unreadCount > 0 && (
            <Button
              position="absolute"
              top={0}
              right={0}
              size="$1"
              circular
              backgroundColor="$red10"
              color="$white"
            >
              <Text color="$white" fontSize="$1">
                {unreadCount}
              </Text>
            </Button>
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        width={350}
        maxWidth="95%"
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <YStack gap="$3" padding="$4">
          <XStack justifyContent="space-between" alignItems="center" mb="$2">
            <Text fontWeight="bold" fontSize="$5">
              Notifications
            </Text>
            <Button
              size="$3"
              icon={<Trash2 size="$1.5" />}
              onPress={handleClearAll}
              theme="red"
              aria-label="Clear all notifications"
            >
              <Text fontSize="$2" ml="$2" mr="$1" color="$red10">
                Clear All
              </Text>
            </Button>
          </XStack>

          <ScrollView maxHeight={400}>
            <YStack gap="$4">
              {notifications.map((notification) => (
                <YStack
                  key={notification.id}
                  backgroundColor={notification.read ? "$background" : "$blue2"}
                  padding="$4"
                  borderRadius="$4"
                >
                  <XStack justifyContent="space-between" alignItems="flex-start" width="100%">
                    <YStack flex={1} mr="$3">
                      <Text fontWeight="bold" fontSize="$4" mb="$1">
                        {notification.title}
                      </Text>
                      <Text fontSize="$3" mb="$2">
                        {notification.type === "roomInvite"
                          ? `${notification.invitedBy} invited you to join '${notification.roomName}'`
                          : notification.message}
                      </Text>
                      {notification.type === "roomInvite" && (
                        <XStack gap="$3" mt="$2">
                          <Button
                            flex={1}
                            backgroundColor="$green8"
                            onPress={() => handleAcceptInvite(notification)}
                            size="$3"
                          >
                            <Text color="$white">Accept</Text>
                          </Button>
                          <Button
                            flex={1}
                            backgroundColor="$red8"
                            onPress={() => handleRejectInvite(notification)}
                            size="$3"
                          >
                            <Text color="$white">Decline</Text>
                          </Button>
                        </XStack>
                      )}
                      <Text color="$gray10" fontSize="$2" mt="$2">
                        {getTimeAgo(notification.timestamp.toDate())}
                      </Text>
                    </YStack>
                    <Button
                      size="$2"
                      circular
                      icon={<X size="$1" />}
                      onPress={() => handleClearOne(notification.id)}
                      theme="gray"
                      opacity={0.6}
                      hoverStyle={{ opacity: 1 }}
                      aria-label="Clear notification"
                    />
                  </XStack>
                </YStack>
              ))}
            </YStack>
          </ScrollView>
        </YStack>
      </Popover.Content>
    </Popover>
  );
}
