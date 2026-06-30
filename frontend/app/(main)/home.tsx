import Button from '@/components/Button';
import ConversationItem from '@/components/ConversationItem';
import Loading from '@/components/Loading';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import {
  getConversations,
  newConversation,
  newMessage,
} from '@/socket/socketEvents';
import {
  ConversationProps,
  LastMessageProps,
  MessageProps,
  ResponseProps,
} from '@/types';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import { GearSixIcon, PlusIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const Home = () => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationProps[]>([]);

  useEffect(() => {
    getConversations(processGetConversations);
    newConversation(newConversationHandler);
    newMessage(newMessageHandler);
    getConversations(null);
    return () => {
      getConversations(processGetConversations, true);
      newConversation(newConversationHandler, true);
      newMessage(newMessageHandler, true);
    };
  }, []);

  const newMessageHandler = (
    res: ResponseProps<MessageProps & { conversationId: string }>,
  ) => {
    if (res.success && res.data) {
      let conversationId = res.data.conversationId;
      setConversations((prev) => {
        let updatedConversations = prev.map((item) => {
          if (item._id == conversationId)
            item.lastMessage = res.data as LastMessageProps;
          return item;
        });

        return updatedConversations;
      });
    }
  };

  const processGetConversations = (res: ResponseProps<ConversationProps[]>) => {
    setLoading(false);
    if (res.success && res.data) {
      setConversations(res.data);
    }
  };

  const newConversationHandler = (
    res: ResponseProps<ConversationProps & { isNew?: boolean }>,
  ) => {
    if (res.success && res.data?.isNew) {
      setConversations((prev) => [...prev, res.data!]);
    }
  };

  let directConversations = conversations
    .filter((item: ConversationProps) => item.type == 'direct')
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  let groupConversations = conversations
    .filter((item: ConversationProps) => item.type == 'group')
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typo
              color={colors.neutral200}
              size={19}
              textProps={{ numberOfLines: 1 }}
            >
              Bienvenue,{' '}
              <Typo size={20} color={colors.white} fontWeight={'800'}>
                {currentUser?.name} 🤙
              </Typo>
            </Typo>
          </View>
          <TouchableOpacity
            style={styles.settingIcon}
            onPress={() => {
              router.push('/(main)/profileModal');
            }}
          >
            <GearSixIcon
              color={colors.white}
              weight="fill"
              size={verticalScale(22)}
            ></GearSixIcon>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacingY._20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.navBar}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  onPress={() => setSelectedTab(0)}
                  style={[
                    styles.tabStyle,
                    selectedTab == 0 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Messages</Typo>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedTab(1)}
                  style={[
                    styles.tabStyle,
                    selectedTab == 1 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Groupe</Typo>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.conversationList}>
              {selectedTab == 0 &&
                directConversations.map((item: ConversationProps, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversations.length != index + 1}
                    />
                  );
                })}
              {selectedTab == 1 &&
                groupConversations.map((item: ConversationProps, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversations.length != index + 1}
                    />
                  );
                })}
            </View>

            {!loading &&
              selectedTab == 0 &&
              directConversations.length == 0 && (
                <Typo style={{ textAlign: 'center' }}>
                  Vous n'avez aucun message.
                </Typo>
              )}
            {!loading && selectedTab == 1 && groupConversations.length == 0 && (
              <Typo style={{ textAlign: 'center' }}>
                Vous n'avez rejoint aucun groupe.
              </Typo>
            )}

            {loading && <Loading />}
          </ScrollView>
        </View>
      </View>

      <Button
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: '/(main)/newConversationModal',
            params: { isGroup: selectedTab },
          })
        }
      >
        <PlusIcon color={colors.black} weight="bold" size={verticalScale(24)} />
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    gap: spacingY._15,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  row: {
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
    overflow: 'hidden',
    paddingHorizontal: spacingX._20,
  },
  navBar: {
    flexDirection: 'row',
    gap: spacingX._15,
    alignItems: 'center',
    paddingHorizontal: spacingX._10,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacingX._10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabStyle: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
  },
  activeTabStyle: {
    backgroundColor: colors.primaryLight,
  },
  conversationList: {
    paddingVertical: spacingY._20,
  },
  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: 'absolute',
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
