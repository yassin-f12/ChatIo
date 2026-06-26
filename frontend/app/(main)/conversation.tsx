import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors } from '@/constants/theme'
import { StyleSheet, Text, View } from 'react-native'

const Conversation = () => {
  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Conversation</Typo>
    </ScreenWrapper>
  )
}

export default Conversation

const styles = StyleSheet.create({})