import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/authContext';

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(main)/profileModal"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  );
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
