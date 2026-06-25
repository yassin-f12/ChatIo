import { colors, spacingY } from '@/constants/theme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from './Avatar';
import Typo from './Typo';
import moment from 'moment';

const ConversationItem = ({ item, showDivider, router }: any) => {
  const openConversation = () => {};

  const lastMessage: any = item.lastMessage;
  const isDirect = item.type == 'direct';

  const getLastMessageContent = () => {
    if (!lastMessage) return 'Dire bonjour 👋';

    return lastMessage?.attachement ? 'Image' : lastMessage.content;
  };

  const getLastMessageDate = () => {
    if (!lastMessage?.createdAt) return null;

    const messageDate = moment(lastMessage.createdAt);

    const today = moment();

    if (messageDate.isSame(today, 'day')) {
      return messageDate.format('HH:mm');
    }
    if (messageDate.isSame(today, 'year')) {
      return messageDate.format('D MMM');
    }
    return messageDate.format('D MMM, YYYY');
  };
  return (
    <View>
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={openConversation}
      >
        <View>
          <Avatar uri={null} size={47} isGroup={item.type == 'group'} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Typo size={17} fontWeight={'600'}>
              {item?.name}
            </Typo>

            {item.lastMessage && <Typo size={15}>{getLastMessageDate()}</Typo>}
          </View>

          <Typo
            size={15}
            color={colors.neutral500}
            textProps={{ numberOfLines: 1 }}
          >
            {getLastMessageContent()}
          </Typo>
        </View>
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </View>
  );
};

export default ConversationItem;

const styles = StyleSheet.create({
  conversationItem: {
    gap: spacingY._10,
    marginVertical: spacingY._12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
});
