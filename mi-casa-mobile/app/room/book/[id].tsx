import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { API_URL, getStoredCustomer } from '@/lib/api'

export default function BookingFormScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleBook() {
    if (!checkIn || !checkOut) {
      Alert.alert('Missing Dates', 'Please enter check-in and check-out dates (YYYY-MM-DD)')
      return
    }

    setLoading(true)
    try {
      const customer = await getStoredCustomer()
      if (!customer) throw new Error('You must be logged in to book.')

      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          roomId: id,
          checkIn,
          checkOut,
          guestCount: parseInt(guests),
          guestFullName: customer.fullName,
          guestEmail: customer.email,
          guestPhone: customer.phone,
          notes,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Booking failed')
      }

      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your booking reference is ${data.booking.bookingRef}.`,
        [{ text: 'View My Bookings', onPress: () => router.replace('/(tabs)/bookings') }]
      )
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Complete your booking</Text>
      <Text style={styles.subtitle}>Enter your stay details below.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Check-in Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-12-15"
          value={checkIn}
          onChangeText={setCheckIn}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Check-out Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-12-17"
          value={checkOut}
          onChangeText={setCheckOut}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Number of Guests</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={guests}
          onChangeText={setGuests}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Special Requests (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Early check-in, birthday setup, etc."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleBook} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFDF5" />
        ) : (
          <Text style={styles.buttonText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  content: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: 'bold', fontFamily: 'serif', color: '#103713', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#628B35', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#103713', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DBD0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#103713',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#628B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#FFFDF5', fontSize: 16, fontWeight: '600' },
})