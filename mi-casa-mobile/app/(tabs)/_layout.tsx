import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#628B35',
        tabBarInactiveTintColor: '#10371366',
        tabBarStyle: {
          backgroundColor: '#FFFDF5',
          borderTopColor: '#E2DBD0',
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Rooms',
          tabBarIcon: (props) => (
            <Ionicons name="home-outline" size={props.size} color="#628B35" />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: (props) => (
            <Ionicons name="calendar-outline" size={props.size} color="#628B35" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: (props) => (
            <Ionicons name="person-outline" size={props.size} color="#628B35" />
          ),
        }}
      />
    </Tabs>
  )
}