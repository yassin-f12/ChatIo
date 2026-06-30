import Avatar from '@/components/Avatar';
import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import Input from '@/components/Input';
import MessageItem from '@/components/MessageItem';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { ConversationProps, MessageProps, ReactionProps, ResponseProps } from '@/types';
import { scale, verticalScale } from '@/utils/styling';
import { useLocalSearchParams } from 'expo-router';
import {
  DotsThreeOutlineVerticalIcon,
  PaperPlaneIcon,
  PaperPlaneTiltIcon,
  PlanetIcon,
  PlusIcon,
} from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Loading from '@/components/Loading';
import { uploadFileToCloudinary } from '@/services/imageService';
import { getMessages, newMessage, reactionUpdated } from '@/socket/socketEvents';

const Conversation = () => {
  const { user: currentUser } = useAuth();
  const {
    id: conversationId,
    name,
    participants: stringifiedParticipants,
    avatar,
    type,
  } = useLocalSearchParams(); // viens du composants conversationsItem -> params

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ uri: string } | null>(
    null,
  );
  const participants = JSON.parse(
    stringifiedParticipants as string,
  ) as ConversationProps['participants'];

  let conversationAvatar = avatar;
  let isDirect = type == 'direct';
  const otherParticipant = isDirect
    ? participants.find((p) => p._id != currentUser?.id)
    : null;

  if (isDirect && otherParticipant) {
    conversationAvatar = otherParticipant.avatar;
  }

  let conversationName = isDirect ? otherParticipant?.name : name;

  useEffect(() => {
    newMessage(newMessageHandler);
    getMessages(messagesHandler);
    reactionUpdated(reactionHandler);
    getMessages({ conversationId });
    return () => {
      newMessage(newMessageHandler, true);
      getMessages(messagesHandler, true);
      reactionUpdated(reactionHandler, true);
    };
  }, []);

  const newMessageHandler = (
    res: ResponseProps<MessageProps & { conversationId: string }>,
  ) => {
    setLoading(false);
    if (res.success && res.data) {
      if (res.data.conversationId == conversationId) {
        setMessages((prev) => [res.data as MessageProps, ...prev]);
      }
    } else {
      Alert.alert('Erreur', res.msg);
    }
  };

  const reactionHandler = (
    res: ResponseProps<{ messageId: string; reactions: ReactionProps[] }>,
  ) => {
    if (!res.success || !res.data) return;
    const { messageId, reactions } = res.data;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id.toString() === messageId.toString()
          ? { ...msg, reactions }
          : msg,
      ),
    );
  };

  const messagesHandler = (res: ResponseProps<MessageProps[]>) => {
    if (res.success && res.data) setMessages(res.data);
  };

  const onPickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
    }
  };

  const onSend = async () => {
    if (!message.trim() && !selectedFile) return;

    if (!currentUser) return;

    setLoading(true);

    try {
      let attachement = null;
      if (selectedFile) {
        const uploadResult = await uploadFileToCloudinary(
          selectedFile,
          'message-attachements',
        );

        if (uploadResult.success) {
          attachement = uploadResult.data;
        } else {
          setLoading(false);
          Alert.alert('Erreur', "Impossible d'envoyer l'image");
        }
      }

      newMessage({
        conversationId,
        sender: {
          id: currentUser?.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        content: message.trim(),
        attachement,
      });

      setMessage('');
      setSelectedFile(null);
    } catch (error) {
      Alert.alert('Erreur', "Échec de l'envoi de votre message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Header
          style={styles.header}
          leftIcon={
            <View style={styles.headerLeft}>
              <BackButton />
              <Avatar
                size={40}
                uri={conversationAvatar as string}
                isGroup={type == 'group'}
              />
              <Typo color={colors.white} fontWeight={'500'} size={22}>
                {conversationName}
              </Typo>
            </View>
          }
          rightIcon={
            <TouchableOpacity style={{ marginBottom: verticalScale(7) }}>
              <DotsThreeOutlineVerticalIcon
                weight="fill"
                color={colors.white}
              />
            </TouchableOpacity>
          }
        />

        <View style={styles.content}>
          <FlatList
            data={messages}
            inverted={true}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messagesContent}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageItem item={item} isDirect={isDirect} />
            )}
          />

          <View style={styles.footer}>
            <Input
              value={message}
              onChangeText={setMessage}
              containerStyle={{
                paddingLeft: spacingX._10,
                paddingRight: scale(65),
                borderWidth: 0,
              }}
              placeholder="Votre message"
              icon={
                <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                  <PlusIcon
                    color={colors.black}
                    weight="bold"
                    size={verticalScale(22)}
                  />

                  {selectedFile && selectedFile.uri && (
                    <Image
                      source={selectedFile.uri}
                      style={styles.selectedFile}
                    />
                  )}
                </TouchableOpacity>
              }
            />

            <View style={styles.inputRightIcon}>
              <TouchableOpacity style={styles.inputIcon} onPress={onSend}>
                {loading ? (
                  <Loading size="small" color={colors.black} />
                ) : (
                  <PaperPlaneTiltIcon
                    color={colors.black}
                    weight="fill"
                    size={verticalScale(22)}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
  },
  inputRightIcon: {
    position: 'absolute',
    right: scale(10),
    top: verticalScale(15),
    paddingLeft: spacingX._12,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.neutral300,
  },
  selectedFile: {
    position: 'absolute',
    height: verticalScale(38),
    width: verticalScale(38),
    borderRadius: radius.full,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingHorizontal: spacingX._15,
  },
  inputIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  footer: {
    paddingTop: spacingY._7,
    paddingBottom: verticalScale(22),
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: spacingY._20,
    paddingBottom: spacingY._10,
    gap: spacingY._12,
  },
  plusIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
});
