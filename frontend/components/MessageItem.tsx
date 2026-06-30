import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { MessageProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import { StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import Typo from './Typo';

const MessageItem = ({
  item,
  isDirect,
}: {
  item: MessageProps;
  isDirect: boolean;
}) => {
  const { user: currentUser } = useAuth();
  const isMe = item.isMe;
  return (
    <View
      style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {!isMe && !isDirect && (
        <Avatar size={30} uri={null} style={styles.messageAvatar} />
      )}

      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.theirBubble,
        ]}
      >
        {!isMe && !isDirect && (
          <Typo color={colors.neutral900} size={13} fontWeight={'600'}>
            {item.sender.name}
          </Typo>
        )}

        {item.content && <Typo size={15}>{item.content}</Typo>}

        <Typo
          style={{ alignSelf: 'flex-end' }}
          size={11}
          fontWeight={'500'}
          color={colors.neutral600}
        >
            {item.createdAt}
        </Typo>
      </View>
    </View>
  );
};

export default MessageItem;

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    gap: spacingX._7,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    alignSelf: 'flex-end',
  },
  attachment: {
    height: verticalScale(180),
    width: verticalScale(180),
    borderRadius: radius._10,
  },
  messageBubble: {
    padding: spacingX._10,
    borderRadius: radius._15,
    gap: spacingY._5,
  },
  myBubble: {
    backgroundColor: colors.myBubble,
  },
  theirBubble: {
    backgroundColor: colors.otherBubble,
  },
});
