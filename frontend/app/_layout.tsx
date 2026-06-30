import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/authContext';
import '@/utils/momentConfig';

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(main)/profileModal"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="(main)/newConversationModal"
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
