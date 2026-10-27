import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="room/[id]"
          options={{
            headerShown: true,
            title: 'Room Details',
            headerStyle: { backgroundColor: '#FFFDF5' },
            headerTintColor: '#103713',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  )
}