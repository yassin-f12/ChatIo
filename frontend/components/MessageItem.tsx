import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { MessageProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import {
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRef, useState } from 'react';
import Avatar from './Avatar';
import Typo from './Typo';
import moment from 'moment';
import { Image } from 'expo-image';
import { toggleReaction } from '@/socket/socketEvents';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const BAR_HEIGHT = verticalScale(60);
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MessageItem = ({
  item,
  isDirect,
}: {
  item: MessageProps;
  isDirect: boolean;
}) => {
  const { user: currentUser } = useAuth();
  const isMe = currentUser?.id == item?.sender?.id;
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [barPosition, setBarPosition] = useState({ top: 0, left: 0 });
  const bubbleRef = useRef<View>(null);

  moment.locale('fr');
  const formattedDate = moment(item.createdAt).isSame(moment(), 'day')
    ? moment(item.createdAt).format('HH:mm')
    : moment(item.createdAt).format('D MMM, HH:mm');

  const handleLongPress = () => {
    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      let top = y - BAR_HEIGHT - spacingY._7;
      if (top < 40) top = y + height + spacingY._7; // pas de place au-dessus -> en dessous

      let left = x;
      const barWidth = REACTION_EMOJIS.length * 44 + spacingX._15 * 2;
      if (left + barWidth > SCREEN_WIDTH) left = SCREEN_WIDTH - barWidth - 10;
      if (left < 10) left = 10;

      setBarPosition({ top, left });
      setShowReactionBar(true);
    });
  };

  const handleReact = (emoji: string) => {
    if (!currentUser?.id) return;
    toggleReaction({ messageId: item.id, emoji, userId: currentUser.id });
    setShowReactionBar(false);
  };

  const groupedReactions = (item.reactions ?? []).reduce<
    Record<string, number>
  >((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  const myReactionEmoji = item.reactions?.find(
    (r) => r.userId === currentUser?.id,
  )?.emoji;

  return (
    <View
      style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {!isMe && !isDirect && (
        <Avatar
          size={30}
          uri={item?.sender?.avatar}
          style={styles.messageAvatar}
        />
      )}

      <View>
        <TouchableOpacity
          ref={bubbleRef}
          activeOpacity={0.8}
          onLongPress={handleLongPress}
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

          {item.attachement && (
            <Image
              source={item.attachement}
              contentFit="cover"
              style={styles.attachment}
              transition={100}
            />
          )}

          {item.content && <Typo size={15}>{item.content}</Typo>}

          <Typo
            style={{ alignSelf: 'flex-end' }}
            size={11}
            fontWeight={'500'}
            color={colors.neutral600}
          >
            {formattedDate}
          </Typo>
        </TouchableOpacity>

        {Object.keys(groupedReactions).length > 0 && (
          <View
            style={[
              styles.reactionsDisplay,
              isMe ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' },
            ]}
          >
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <View
                key={emoji}
                style={[
                  styles.reactionBadge,
                  emoji === myReactionEmoji && styles.reactionBadgeActive,
                ]}
              >
                <Typo size={14}>
                  {emoji} {count}
                </Typo>
              </View>
            ))}
          </View>
        )}
      </View>

      <Modal
        visible={showReactionBar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionBar(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReactionBar(false)}
        >
          <View
            style={[
              styles.reactionBar,
              { top: barPosition.top, left: barPosition.left },
            ]}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleReact(emoji)}
                style={[
                  styles.emojiButton,
                  emoji === myReactionEmoji && styles.emojiButtonActive,
                ]}
              >
                <Typo size={28}>{emoji}</Typo>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  reactionBar: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._7,
    gap: spacingX._5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emojiButton: {
    padding: 4,
    borderRadius: radius.full,
  },
  emojiButtonActive: {
    backgroundColor: colors.neutral200,
  },
  reactionsDisplay: {
    flexDirection: 'row',
    gap: spacingX._5,
    marginTop: 2,
  },
  reactionBadge: {
    backgroundColor: colors.neutral200,
    borderRadius: radius.full,
    paddingHorizontal: spacingX._7,
    paddingVertical: 2,
  },
  reactionBadgeActive: {
    backgroundColor: colors.primary,
  },
});
