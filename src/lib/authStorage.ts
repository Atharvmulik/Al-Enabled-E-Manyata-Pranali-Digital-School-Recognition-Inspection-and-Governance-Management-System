import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  access_token: string;
  token_type: string;
}

const TOKEN_KEY = 'inspection_token';
const USER_KEY = 'inspection_user';

export const saveAuthData = async (userData: AuthUser) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, userData.access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save auth data', error);
  }
};

export const getAuthData = async (): Promise<{ token: string | null; user: AuthUser | null }> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userJson = await AsyncStorage.getItem(USER_KEY);
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user };
  } catch (error) {
    console.error('Failed to load auth data', error);
    return { token: null, user: null };
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error('Failed to clear auth data', error);
  }
};