import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room Detail</Text>
      <Text style={styles.subtitle}>ID: {id}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#103713' },
  subtitle: { fontSize: 14, color: '#628B35', marginTop: 8 },
})