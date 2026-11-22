import AsyncStorage from '@react-native-async-storage/async-storage'

// Your computer's current Wi-Fi IPv4 address
export const API_URL = 'http://192.168.100.118:3000/api/mobile'

// --- AUTH HELPERS ---

export async function getStoredCustomer() {
  try {
    const data = await AsyncStorage.getItem('customer')

    if (!data) return null

    return JSON.parse(data)
  } catch (error) {
    console.error('Error getting stored customer:', error)
    return null
  }
}

export async function setStoredCustomer(customer: any) {
  try {
    await AsyncStorage.setItem('customer', JSON.stringify(customer))
    return true
  } catch (error) {
    console.error('Error saving customer:', error)
    return false
  }
}

export async function clearStoredCustomer() {
  try {
    await AsyncStorage.removeItem('customer')
    return true
  } catch (error) {
    console.error('Error clearing customer:', error)
    return false
  }
}

// --- CONNECTION HELPERS ---

export function getConnectionErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return 'Unable to connect to Mi Casa server. Please check your internet or Wi-Fi connection and try again.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}