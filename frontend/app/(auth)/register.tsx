import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { verticalScale } from '@/utils/styling';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AtIcon, LockIcon, UserIcon } from 'phosphor-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || !name) {
      Alert.alert(
        "Erreur d'enregistrement",
        'Veuillez remplir tous les champs',
      );
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, password, name, '');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Enregistrement échoué';
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenWrapper showPattern={true} bgOpacity={0.5}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton iconSize={28} />
            <Typo size={17} color={colors.white}>
              Besoin d'aide ?
            </Typo>
          </View>

          <View style={styles.content}>
            <ScrollView
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: spacingY._10, marginBottom: spacingY._15 }}>
                <Typo size={28} fontWeight={'600'}>
                  Démarrer
                </Typo>
                <Typo color={colors.neutral600}>
                  Créez un compte pour continuer
                </Typo>
              </View>

              <Input
                placeholder="Pseudo"
                value={name}
                returnKeyType="next"
                textContentType="username"
                autoComplete="username"
                onChangeText={setName}
                icon={
                  <UserIcon
                    size={verticalScale(26)}
                    color={colors.neutral600}
                  />
                }
              />
              <Input
                placeholder="Email"
                value={email}
                keyboardType="email-address"
                returnKeyType="next"
                autoCapitalize="none"
                textContentType="emailAddress"
                autoComplete="email"
                onChangeText={setEmail}
                icon={
                  <AtIcon size={verticalScale(26)} color={colors.neutral600} />
                }
              />
              <Input
                placeholder="Mot de passe ultra secret"
                value={password}
                secureTextEntry
                returnKeyType="done"
                textContentType="password"
                onChangeText={setPassword}
                icon={
                  <LockIcon
                    size={verticalScale(26)}
                    color={colors.neutral600}
                  />
                }
              />

              <View style={{ marginTop: spacingY._25, gap: spacingY._15 }}>
                <Button loading={isLoading} onPress={handleSubmit}>
                  <Typo fontWeight={'bold'} size={20} color={colors.black}>
                    S'inscrire
                  </Typo>
                </Button>

                <View style={styles.footer}>
                  <Typo>Vous avez déjà un compte ?</Typo>
                  <Pressable onPress={() => router.push('/(auth)/login')}>
                    <Typo fontWeight={'bold'} color={colors.primaryDark}>
                      Se connecter
                    </Typo>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
  },
  form: {
    gap: spacingY._25,
    marginTop: spacingY._20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
});
