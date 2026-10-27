import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { API_URL, setStoredCustomer } from '@/lib/api'
import {
  isBiometricSupported,
  authenticateWithBiometrics,
  getBiometricCredentials,
  enableBiometrics,
} from '@/lib/biometrics'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)

  // 1. Check for biometrics on load
  useEffect(() => {
    async function checkBiometrics() {
      const supported = await isBiometricSupported()
      if (!supported) return

      const creds = await getBiometricCredentials()
      if (creds) {
        // Auto-trigger fingerprint prompt if they enabled it previously
        promptBiometrics()
      }
    }
    checkBiometrics()
  }, [])

  async function promptBiometrics() {
    setBiometricLoading(true)
    try {
      const success = await authenticateWithBiometrics()
      if (success) {
        const creds = await getBiometricCredentials()
        if (creds) {
          // Log in using saved credentials
          await performLogin(creds.email, creds.password, true)
        }
      }
    } catch (err) {
      console.log('Biometric login cancelled or failed')
    } finally {
      setBiometricLoading(false)
    }
  }

  async function performLogin(emailInput: string, passwordInput: string, isBiometric = false) {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      })
      
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      await setStoredCustomer(data.customer)

      // If this was a manual login, ask to enable biometrics
      if (!isBiometric) {
        const supported = await isBiometricSupported()
        const alreadyEnabled = await getBiometricCredentials()
        
        if (supported && !alreadyEnabled) {
          Alert.alert(
            'Enable Biometrics?',
            'Use your fingerprint or Face ID to log in faster next time.',
            [
              { 
                text: 'Not Now', 
                style: 'cancel', 
                onPress: () => router.replace('/(tabs)') 
              },
              { 
                text: 'Enable', 
                onPress: async () => {
                  await enableBiometrics(emailInput, passwordInput)
                  router.replace('/(tabs)')
                }
              }
            ]
          )
          return
        }
      }

      router.replace('/(tabs)')
    } catch (err: any) {
      if (!isBiometric) {
        Alert.alert('Login Failed', err.message)
      } else {
        Alert.alert('Biometric Login Failed', 'Please log in with your password.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleManualLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password')
      return
    }
    await performLogin(email, password)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Casa De Cagsawa</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="guest@micasa.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleManualLogin}
            disabled={loading || biometricLoading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFDF5" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Biometric Button */}
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={promptBiometrics}
            disabled={loading || biometricLoading}
          >
            {biometricLoading ? (
              <ActivityIndicator color="#628B35" />
            ) : (
              <>
                <Ionicons name="finger-print-outline" size={24} color="#628B35" />
                <Text style={styles.biometricText}>Login with Biometrics</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: 'bold',
    color: '#103713',
    textAlign: 'center',
  },
  subtitle: { fontSize: 16, color: '#628B35', marginTop: 8 },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#103713', marginLeft: 4 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DBD0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#103713',
  },
  button: {
    backgroundColor: '#628B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#FFFDF5', fontSize: 16, fontWeight: '600' },
  biometricButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginTop: 8,
  },
  biometricText: { color: '#628B35', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#10371366', fontSize: 14 },
  footerLink: { color: '#628B35', fontSize: 14, fontWeight: 'bold' },
})