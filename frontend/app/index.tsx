import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral900} />
      <Animated.Image
        source={require('@/assets/images/splashImage.png')}
        entering={FadeInDown.duration(700).springify()}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={{ color: colors.white, fontSize: 24, marginTop: 20 }}>
        Welcome to MyApp
      </Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral900,
  },
  logo: {
    height: '23%',
    aspectRatio: 1,
  },
});
