import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevApiUrl = () => {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:3000`;
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

export const API_URL = getDevApiUrl();

export const CLOUDINARY_CLOUD_NAME  = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;