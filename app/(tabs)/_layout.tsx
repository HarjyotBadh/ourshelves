import { Link, Tabs } from 'expo-router'
import { Button, useTheme } from 'tamagui'
import { Atom, AudioWaveform, Home, ShoppingBag, User } from '@tamagui/lucide-icons'


export default function TabLayout() {
    const theme = useTheme();

  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.red10.val,
          headerShown: true, // This ensures headers are shown
          headerStyle: {
              backgroundColor: theme.background.val, // Use theme background color
          },
          headerTintColor: theme.color.val, // Use theme text color for header text
      }}
        >
      <Tabs.Screen
        name="profile_page"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <ShoppingBag color={color} />,
        }}
      />
      <Tabs.Screen
          name="index"
          options={{
              title: "Home",
              tabBarIcon: ({ color }) => <Home color={color} />,
          }}
      />
    </Tabs>
  )
}
