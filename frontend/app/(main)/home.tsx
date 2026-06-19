import Button from '@/components/Button';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { StyleSheet, View } from 'react-native';

const Home = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };
  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Bonjour</Typo>

      <Button onPress={handleLogout}>
        <Typo>Déconnexion</Typo>
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({});
