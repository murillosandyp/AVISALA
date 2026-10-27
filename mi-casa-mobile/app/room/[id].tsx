import { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { API_URL } from '@/lib/api'

type Room = {
  id: string
  roomNumber: number
  name: string
  description: string
  capacity: number
  basePrice: number
  amenities: string[]
  category: string
  imageUrl: string | null
  status: string
}

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`${API_URL}/rooms`)
        const data = await res.json()
        if (data.success) {
          const found = data.rooms.find((r: Room) => r.id === id)
          setRoom(found || null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [id])

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#628B35" /></View>
  }

  if (!room) {
    return <View style={styles.center}><Text style={styles.error}>Room not found</Text></View>
  }

  const imageUrl = room.imageUrl
    ? `http://192.168.100.67:3000${room.imageUrl}`
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{room.name}</Text>
            <Text style={styles.price}>₱{room.basePrice.toLocaleString()}<Text style={styles.priceNight}>/night</Text></Text>
          </View>

          <Text style={styles.category}>{room.category} • Room {room.roomNumber}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={16} color="#628B35" />
            <Text style={styles.metaText}>Up to {room.capacity} guests</Text>
          </View>

          <Text style={styles.sectionTitle}>About this room</Text>
          <Text style={styles.description}>{room.description}</Text>

          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((a, i) => (
              <View key={i} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#628B35" />
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Book Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.bookButton, room.status === 'BOOKED' && styles.bookButtonDisabled]}
          disabled={room.status === 'BOOKED'}
          onPress={() => router.push(`/room/book/${room.id}`)}
        >
          <Text style={styles.bookButtonText}>
            {room.status === 'BOOKED' ? 'Currently Booked' : 'Book This Room'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF5' },
  error: { color: 'red', fontSize: 16 },
  heroImage: { width: '100%', height: 300, backgroundColor: '#E2DBD0' },
  content: { padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', fontFamily: 'serif', color: '#103713', flex: 1, marginRight: 16 },
  price: { fontSize: 22, fontWeight: 'bold', color: '#628B35' },
  priceNight: { fontSize: 14, fontWeight: 'normal', color: '#10371366' },
  category: { fontSize: 15, color: '#628B35', marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  metaText: { fontSize: 15, color: '#103713' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#103713', marginBottom: 12, marginTop: 8, fontFamily: 'serif' },
  description: { fontSize: 15, color: '#10371399', lineHeight: 24, marginBottom: 16 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  amenityText: { fontSize: 14, color: '#103713' },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFDF5',
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
  },
  bookButton: {
    backgroundColor: '#628B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: { backgroundColor: '#10371366' },
  bookButtonText: { color: '#FFFDF5', fontSize: 16, fontWeight: '600' },
})