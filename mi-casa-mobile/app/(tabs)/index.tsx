import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
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

export default function CatalogScreen() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchRooms() {
    try {
      const res = await fetch(`${API_URL}/rooms`)
      const data = await res.json()
      if (data.success) {
        setRooms(data.rooms)
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Re-fetch every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRooms()
    }, [])
  )

  function onRefresh() {
    setRefreshing(true)
    fetchRooms()
  }

  function renderRoom({ item }: { item: Room }) {
    const imageUrl = item.imageUrl
      ? `http://192.168.100.67:3000${item.imageUrl}`
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/room/${item.id}`)}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
        
        {item.status === 'BOOKED' && (
          <View style={styles.bookedBadge}>
            <Text style={styles.bookedText}>BOOKED</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.price}>₱{item.basePrice.toLocaleString()}<Text style={styles.priceNight}>/night</Text></Text>
          </View>
          
          <View style={styles.amenitiesRow}>
            <View style={styles.amenityBadge}>
              <Ionicons name="people-outline" size={12} color="#628B35" />
              <Text style={styles.amenityText}>Up to {item.capacity}</Text>
            </View>
            <View style={styles.amenityBadge}>
              <Ionicons name="business-outline" size={12} color="#628B35" />
              <Text style={styles.amenityText}>{item.category}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#628B35" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find your stay</Text>
        <Text style={styles.headerSubtitle}>Welcome to Mi Casa De Cagsawa</Text>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#628B35" />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF5' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFDF5',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: 'bold',
    color: '#103713',
  },
  headerSubtitle: { fontSize: 15, color: '#628B35', marginTop: 4 },
  list: { paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2DBD0',
    shadowColor: '#103713',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: { width: '100%', height: 200, backgroundColor: '#E2DBD0' },
  bookedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#103713',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bookedText: { color: '#FFFDF5', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  cardContent: { padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomName: { fontSize: 18, fontWeight: '600', color: '#103713', flex: 1, marginRight: 8 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#628B35' },
  priceNight: { fontSize: 12, fontWeight: 'normal', color: '#10371366' },
  amenitiesRow: { flexDirection: 'row', gap: 8 },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  amenityText: { fontSize: 11, color: '#628B35', fontWeight: '500' },
})