import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function isBiometricSupported() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync()
  const isEnrolled = await LocalAuthentication.isEnrolledAsync()
  return hasHardware && isEnrolled
}

export async function authenticateWithBiometrics() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Log in to Mi Casa',
    fallbackLabel: 'Use Password',
    disableDeviceFallback: false,
  })
  
  return result.success
}

// Save credentials securely for next time
export async function enableBiometrics(email: string, password: string) {
  await AsyncStorage.setItem('biometric_email', email)
  await AsyncStorage.setItem('biometric_password', password)
  await AsyncStorage.setItem('biometrics_enabled', 'true')
}

export async function disableBiometrics() {
  await AsyncStorage.removeItem('biometric_email')
  await AsyncStorage.removeItem('biometric_password')
  await AsyncStorage.setItem('biometrics_enabled', 'false')
}

export async function getBiometricCredentials() {
  const enabled = await AsyncStorage.getItem('biometrics_enabled')
  if (enabled !== 'true') return null
  
  const email = await AsyncStorage.getItem('biometric_email')
  const password = await AsyncStorage.getItem('biometric_password')
  
  if (!email || !password) return null
  return { email, password }
}