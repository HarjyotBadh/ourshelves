import { Link, Tabs } from "expo-router";
import { Button, useTheme } from "tamagui";
import { Search, Home, ShoppingBag, User } from "@tamagui/lucide-icons";
import { NotificationsPopover } from "../../components/NotificationsPopover";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.red10.val,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerTintColor: theme.color.val,
      }}
    >
      <Tabs.Screen
        name="profile_page"
        options={{
          title: "Profile",
          headerShown: true,
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} />,
          headerLeft: () => (
            <Link href="/search" asChild>
              <Button
                size="$3.5"
                circular
                color="$white"
                justifyContent="center"
                alignItems="center"
                display="flex"
                icon={<Search size="$3" />}
              />
            </Link>
          ),
          headerRight: () => <NotificationsPopover />,
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => <ShoppingBag color={color} />,
        }}
      />
    </Tabs>
  );
}
