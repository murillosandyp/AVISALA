import { useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { API_URL, getStoredCustomer } from '@/lib/api'

type Booking = {
  id: string
  bookingRef: string
  roomName: string
  checkIn: string
  checkOut: string
  guestCount: number
  totalPrice: number
  status: string
}

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchBookings() {
    try {
      const customer = await getStoredCustomer()
      if (!customer) return

      const res = await fetch(`${API_URL}/bookings?customerId=${customer.id}`)
      const data = await res.json()
      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchBookings()
    }, [])
  )

  function onRefresh() {
    setRefreshing(true)
    fetchBookings()
  }

  function renderBooking({ item }: { item: Booking }) {
    // Status Badge Colors
    let badgeStyle = styles.badgePending
    let badgeText = item.status
    
    if (item.status === 'CONFIRMED') badgeStyle = styles.badgeConfirmed
    if (item.status === 'CHECKED_IN') badgeStyle = styles.badgeCheckedIn
    if (item.status === 'CANCELLED') badgeStyle = styles.badgeCancelled

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.ref}>{item.bookingRef}</Text>
          <View style={[styles.badge, badgeStyle]}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        </View>
        
        <Text style={styles.roomName}>{item.roomName}</Text>
        
        <View style={styles.datesRow}>
          <View>
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateText}>{new Date(item.checkIn).toLocaleDateString()}</Text>
          </View>
          <View>
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateText}>{new Date(item.checkOut).toLocaleDateString()}</Text>
          </View>
          <View>
            <Text style={styles.dateLabel}>Guests</Text>
            <Text style={styles.dateText}>{item.guestCount}</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>₱{item.totalPrice.toLocaleString()}</Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#628B35" /></View>
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>Your upcoming and past stays</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#628B35" />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>You have no bookings yet.</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF5' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 32, fontFamily: 'serif', fontWeight: 'bold', color: '#103713' },
  headerSubtitle: { fontSize: 15, color: '#628B35', marginTop: 4 },
  list: { paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
  emptyText: { textAlign: 'center', color: '#10371366', marginTop: 40, fontSize: 16 },
  
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ref: { fontSize: 12, fontFamily: 'monospace', color: '#628B35', fontWeight: 'bold' },
  roomName: { fontSize: 18, fontWeight: '600', color: '#103713', marginBottom: 16 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFDF5' },
  badgePending: { backgroundColor: '#f59e0b' }, // Amber
  badgeConfirmed: { backgroundColor: '#628B35' }, // Green
  badgeCheckedIn: { backgroundColor: '#103713' }, // Dark Green
  badgeCancelled: { backgroundColor: '#ef4444' }, // Red

  datesRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F5F0E2', padding: 12, borderRadius: 8, marginBottom: 16 },
  dateLabel: { fontSize: 11, color: '#628B35', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  dateText: { fontSize: 14, color: '#103713', fontWeight: '500' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2DBD0', paddingTop: 12 },
  totalLabel: { fontSize: 14, color: '#10371366' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#628B35' },
})