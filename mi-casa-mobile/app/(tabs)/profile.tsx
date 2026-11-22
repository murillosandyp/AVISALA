
import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
  Modal, TextInput, ActivityIndicator, Switch,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  API_URL, getStoredCustomer, setStoredCustomer, clearStoredCustomer,
} from '@/lib/api'

const GREEN = '#103713'
const OLIVE = '#628B35'
const CREAM = '#FFFDF5'
const BEIGE = '#F1EFE6'
const BORDER = '#E2DBD0'
const PREF_KEY = 'micasa_notification_preferences'

const defaultPrefs = {
  bookingUpdates: true,
  paymentReminders: true,
  promotions: false,
}

type ModalName = 'profile' | 'notifications' | 'security' | 'about' | null

function SettingsItem({ icon, title, subtitle, onPress, danger = false }: any) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={[styles.itemIcon, danger && { backgroundColor: '#FBEAEA' }]}>
        <Ionicons name={icon} size={20} color={danger ? '#C0392B' : GREEN} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, danger && { color: '#C0392B' }]}>{title}</Text>
        {!!subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color="#999" />}
    </TouchableOpacity>
  )
}

function Field({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
    </View>
  )
}

function ModalShell({ visible, title, onClose, children }: any) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={GREEN} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  )
}

function Button({ title, onPress, loading = false }: any) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} disabled={loading}>
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={styles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const router = useRouter()

  const [customer, setCustomer] = useState<any>(null)
  const [modal, setModal] = useState<ModalName>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  const [prefs, setPrefs] = useState(defaultPrefs)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const saved = await getStoredCustomer()
      if (saved) {
        setCustomer(saved)
        setName(saved.fullName || saved.name || '')
        setEmail(saved.email || '')
        setPhone(saved.phone || '')
      }

      const savedPrefs = await AsyncStorage.getItem(PREF_KEY)
      if (savedPrefs) setPrefs({ ...defaultPrefs, ...JSON.parse(savedPrefs) })
    } catch {
      Alert.alert('Error', 'Unable to load profile information.')
    }
  }

  function closeModal() {
    setModal(null)
  }

  async function saveProfile() {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Required', 'Please enter your name and email.')
      return
    }

    if (!customer?.id) {
      Alert.alert('Error', 'Customer information is missing.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          fullName: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Update failed.')

      const updated = {
        ...customer,
        ...(data.customer || {}),
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      }

      await setStoredCustomer(updated)
      setCustomer(updated)
      closeModal()
      Alert.alert('Success', 'Your information has been updated.')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  async function saveNotifications(key: keyof typeof defaultPrefs, value: boolean) {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)
    await AsyncStorage.setItem(PREF_KEY, JSON.stringify(updated))
  }

  async function changePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Required', 'Please complete all password fields.')
      return
    }

    if (newPassword.length < 8) {
      Alert.alert('Invalid Password', 'Your new password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Your new passwords do not match.')
      return
    }

    if (newPassword === currentPassword) {
      Alert.alert('Invalid Password', 'Your new password must be different.')
      return
    }

    if (!customer?.id) {
      Alert.alert('Error', 'Customer information is missing.')
      return
    }

    setSavingPassword(true)
    try {
      const response = await fetch(`${API_URL}/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Password update failed.')

      closeModal()
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      Alert.alert('Success', 'Your password has been changed.')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  function logout() {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearStoredCustomer()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  const displayName = customer?.fullName || customer?.name || 'Guest'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'G'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>My Profile</Text>
      <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{customer?.email || ''}</Text>
        <View style={styles.guestTag}>
          <Ionicons name="person-outline" size={14} color={OLIVE} />
          <Text style={styles.guestText}>Guest Account</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <View style={styles.section}>
        <SettingsItem
          icon="person-outline"
          title="Personal Information"
          subtitle="Manage your personal details"
          onPress={() => setModal('profile')}
        />
        <SettingsItem
          icon="calendar-outline"
          title="My Bookings"
          subtitle="View your reservations"
          onPress={() => router.push('/(tabs)/bookings')}
        />
      </View>

      <Text style={styles.sectionTitle}>PREFERENCES</Text>
      <View style={styles.section}>
        <SettingsItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage notification preferences"
          onPress={() => setModal('notifications')}
        />
        <SettingsItem
          icon="shield-checkmark-outline"
          title="Privacy & Security"
          subtitle="Manage your account security"
          onPress={() => setModal('security')}
        />
      </View>

      <Text style={styles.sectionTitle}>MORE</Text>
      <View style={styles.section}>
        <SettingsItem
          icon="information-circle-outline"
          title="About Mi Casa"
          subtitle="Learn more about us"
          onPress={() => setModal('about')}
        />
        <SettingsItem
          icon="log-out-outline"
          title="Logout"
          onPress={logout}
          danger
        />
      </View>

      <Text style={styles.version}>Mi Casa Guest App · Version 1.0.0</Text>

      {/* PERSONAL INFORMATION */}
      <ModalShell visible={modal === 'profile'} title="Personal Information" onClose={closeModal}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Field label="Full Name" value={name} onChangeText={setName} />
          <Field label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Button title="Save Changes" onPress={saveProfile} loading={saving} />
          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </ModalShell>

      {/* NOTIFICATIONS */}
      <ModalShell visible={modal === 'notifications'} title="Notifications" onClose={closeModal}>
        <Text style={styles.modalDescription}>
          Choose which updates you would like to receive.
        </Text>

        {([
          ['bookingUpdates', 'Booking Updates', 'Updates about your reservations'],
          ['paymentReminders', 'Payment Reminders', 'Reminders about your payments'],
          ['promotions', 'Promotions', 'Offers and special announcements'],
        ] as const).map(([key, title, subtitle]) => (
          <View style={styles.notificationRow} key={key}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{title}</Text>
              <Text style={styles.itemSubtitle}>{subtitle}</Text>
            </View>
            <Switch
              value={prefs[key]}
              onValueChange={(value) => saveNotifications(key, value)}
              trackColor={{ false: '#D5D5D5', true: OLIVE }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={18} color={OLIVE} />
          <Text style={styles.noteText}>
            Notification preferences are saved on this device. Push notifications are not yet enabled.
          </Text>
        </View>

        <Button title="Done" onPress={closeModal} />
      </ModalShell>

      {/* PRIVACY & SECURITY */}
      <ModalShell visible={modal === 'security'} title="Privacy & Security" onClose={closeModal}>
        <Text style={styles.modalDescription}>Change your account password.</Text>

        <Field
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showPasswords}
        />
        <Field
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPasswords}
        />
        <Field
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPasswords}
        />

        <TouchableOpacity style={styles.showPassword} onPress={() => setShowPasswords(!showPasswords)}>
          <Ionicons name={showPasswords ? 'eye-off-outline' : 'eye-outline'} size={18} color={GREEN} />
          <Text style={styles.showPasswordText}>{showPasswords ? 'Hide Passwords' : 'Show Passwords'}</Text>
        </TouchableOpacity>

        <Button title="Change Password" onPress={changePassword} loading={savingPassword} />
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            closeModal()
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setShowPasswords(false)
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ModalShell>

      {/* ABOUT MI CASA */}
      <ModalShell visible={modal === 'about'} title="About Mi Casa" onClose={closeModal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.aboutLogo}>
            <Ionicons name="home-outline" size={36} color={GREEN} />
          </View>

          <Text style={styles.aboutTitle}>Welcome to Mi Casa</Text>
          <Text style={styles.aboutText}>
            Mi Casa is designed to make your stay more comfortable and convenient.
            We want every guest to feel welcome, relaxed, and at home.
          </Text>

          <View style={styles.aboutCard}>
            <Ionicons name="bed-outline" size={24} color={OLIVE} />
            <Text style={styles.aboutCardTitle}>Comfortable Stay</Text>
            <Text style={styles.aboutText}>
              Enjoy a relaxing space designed for comfort and a pleasant guest experience.
            </Text>
          </View>

          <View style={styles.aboutCard}>
            <Ionicons name="location-outline" size={24} color={OLIVE} />
            <Text style={styles.aboutCardTitle}>Our Location</Text>
            <Text style={styles.aboutText}>Cagsawa, Albay, Philippines</Text>
          </View>

          <View style={styles.aboutCard}>
            <Ionicons name="heart-outline" size={24} color={OLIVE} />
            <Text style={styles.aboutCardTitle}>Hospitality</Text>
            <Text style={styles.aboutText}>
              Your comfort and satisfaction are important to us. Thank you for choosing Mi Casa.
            </Text>
          </View>

          <Text style={styles.aboutFooter}>MI CASA GUEST APP</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Button title="Close" onPress={closeModal} />
        </ScrollView>
      </ModalShell>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 26, fontWeight: 'bold', color: GREEN },
  headerSubtitle: { color: '#777', marginTop: 4, marginBottom: 20 },
  profileCard: {
    backgroundColor: GREEN, borderRadius: 18, alignItems: 'center',
    padding: 24, marginBottom: 25,
  },
  avatar: {
    width: 75, height: 75, borderRadius: 40, backgroundColor: '#E8EEDB',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: GREEN },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  profileEmail: { fontSize: 13, color: '#E1E8D8', marginTop: 4 },
  guestTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EEDB',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginTop: 12,
  },
  guestText: { color: OLIVE, fontSize: 12, marginLeft: 5, fontWeight: '600' },
  sectionTitle: { fontSize: 12, color: OLIVE, fontWeight: 'bold', marginBottom: 10, marginTop: 8 },
  section: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 18, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  itemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: BEIGE, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: GREEN },
  itemSubtitle: { fontSize: 12, color: '#888', marginTop: 3 },
  version: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 18 },
  modal: { backgroundColor: CREAM, borderRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: GREEN },
  modalDescription: { fontSize: 13, color: '#777', marginBottom: 15 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, color: GREEN, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: GREEN },
  button: { backgroundColor: GREEN, padding: 14, alignItems: 'center', borderRadius: 12, marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cancelButton: { alignItems: 'center', padding: 13 },
  cancelText: { color: '#777', fontWeight: '600' },
  notificationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  note: { flexDirection: 'row', backgroundColor: BEIGE, padding: 12, borderRadius: 10, marginVertical: 15, gap: 8 },
  noteText: { color: '#777', fontSize: 12, flex: 1, lineHeight: 18 },
  showPassword: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  showPasswordText: { color: GREEN, fontSize: 13 },
  aboutLogo: { alignItems: 'center', justifyContent: 'center', backgroundColor: BEIGE, width: 75, height: 75, borderRadius: 40, alignSelf: 'center', marginBottom: 14 },
  aboutTitle: { fontSize: 21, fontWeight: 'bold', color: GREEN, textAlign: 'center', marginBottom: 10 },
  aboutText: { color: '#777', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  aboutCard: { backgroundColor: '#fff', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 14 },
  aboutCardTitle: { color: GREEN, fontWeight: 'bold', fontSize: 15, marginVertical: 8 },
  aboutFooter: { color: OLIVE, textAlign: 'center', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginTop: 20 },
})
