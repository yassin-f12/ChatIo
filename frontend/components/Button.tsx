import { colors, radius } from '@/constants/theme';
import { ButtonProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Loading from './Loading';

const Button = ({
  style,
  children,
  loading = false,
  ...props
}: ButtonProps) => {
  if (loading) {
    return (
      <View style={[styles.button, style, { backgroundColor: 'transparent' }]}>
        <Loading />
      </View>
    );
  }
  return (
    <TouchableOpacity style={[styles.button, style]} {...props}>
      {children}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    borderCurve: 'continuous',
    height: verticalScale(56),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
