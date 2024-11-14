import { useState } from "react";
import { Popover, YStack, Text, Button, XStack, ScrollView } from "tamagui";
import { Bell, X } from "@tamagui/lucide-icons";
import { formatDistanceToNow } from "date-fns";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Message",
    message: "You have a new message from John Doe",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
  },
  {
    id: 2,
    title: "Order Update",
    message: "Your order #1234 has been shipped",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
  {
    id: 3,
    title: "Special Offer",
    message: "Get 20% off on all products today!",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    read: true,
  },
];

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const getTimeAgo = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <YStack space="$3" padding="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold">Notifications</Text>
            <Button size="$2" circular icon={<X size="$1" />} onPress={() => setOpen(false)} />
          </XStack>

          <ScrollView maxHeight={400}>
            <YStack gap="$3">
              {MOCK_NOTIFICATIONS.map((notification) => (
                <YStack
                  key={notification.id}
                  backgroundColor={notification.read ? "$background" : "$blue2"}
                  padding="$3"
                  borderRadius="$2"
                >
                  <Text fontWeight="bold">{notification.title}</Text>
                  <Text>{notification.message}</Text>
                  <Text color="$gray10" fontSize="$2">
                    {getTimeAgo(notification.timestamp)}
                  </Text>
                </YStack>
              ))}
            </YStack>
          </ScrollView>
        </YStack>
      </Popover.Content>
    </Popover>
  );
}
