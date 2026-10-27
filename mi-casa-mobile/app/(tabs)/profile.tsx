import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getStoredCustomer, clearStoredCustomer } from '@/lib/api'

export default function ProfileScreen() {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const c = await getStoredCustomer()
      setCustomer(c)
    }
    load()
  }, [])

  async function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearStoredCustomer()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  if (!customer) return null

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{customer.fullName}</Text>
        <Text style={styles.email}>{customer.email}</Text>
        {customer.phone && <Text style={styles.phone}>{customer.phone}</Text>}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5', paddingTop: 60, paddingHorizontal: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontFamily: 'serif', fontWeight: 'bold', color: '#103713' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#628B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#FFFDF5', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#103713', marginBottom: 4 },
  email: { fontSize: 15, color: '#628B35', marginBottom: 4 },
  phone: { fontSize: 14, color: '#10371366' },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
})