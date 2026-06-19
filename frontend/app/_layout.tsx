import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/authContext';

const StackLayout = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};
const RootLayout = () => {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});
