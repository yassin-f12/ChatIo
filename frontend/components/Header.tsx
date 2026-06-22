import { HeaderProps } from '@/types';
import { StyleSheet, View } from 'react-native';
import Typo from './Typo';
import { spacingY } from '@/constants/theme';

const Header = ({ title = '', leftIcon, rightIcon, style }: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

      {title && (
        <Typo size={22} fontWeight={'600'} style={styles.title}>
          {title}
        </Typo>
      )}

      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacingY._15,
  },
  title: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    zIndex: 10,
  },
  leftIcon: {
    alignSelf: 'flex-start',
    zIndex: 20,
  },
  rightIcon: {
    alignSelf: 'flex-end',
    zIndex: 30,
  },
});
