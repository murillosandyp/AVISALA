import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ CHANGE THIS IP ADDRESS TO MATCH YOUR COMPUTER'S WIFI IPV4 ADDRESS
// We found yours earlier: 192.168.100.67
export const API_URL = 'http://192.168.100.67:3000/api/mobile';

// --- AUTH HELPERS ---

export async function getStoredCustomer() {
  try {
    const data = await AsyncStorage.getItem('customer');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting stored customer:', error);
    return null;
  }
}

export async function setStoredCustomer(customer: any) {
  try {
    await AsyncStorage.setItem('customer', JSON.stringify(customer));
  } catch (error) {
    console.error('Error saving customer:', error);
  }
}

export async function clearStoredCustomer() {
  try {
    await AsyncStorage.removeItem('customer');
  } catch (error) {
    console.error('Error clearing customer:', error);
  }
}