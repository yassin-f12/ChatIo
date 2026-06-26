import Avatar from '@/components/Avatar';
import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import Input from '@/components/Input';
import Typo from '@/components/Typo';
import { useAuth } from '@/contexts/authContext';
import Button from '@/components/Button';
import { verticalScale } from '@/utils/styling';
import { getContacts, newConversation } from '@/socket/socketEvents';
import { Contact, ConversationProps, ResponseProps, UserProps } from '@/types';
import { uploadFileToCloudinary } from '@/services/imageService';

const NewConversationModal = ({}) => {
  const { isGroup } = useLocalSearchParams();
  const isGroupMode = isGroup == '1';
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    getContacts(processGetContacts);
    newConversation(processNewConversation);
    getContacts(null);
    return () => {
      getContacts(processGetContacts, true);
      newConversation(processNewConversation, true);
    };
  }, []);

  const processGetContacts = (res: ResponseProps<Contact[]>) => {
    if (res.success && res.data) {
      setContacts(res.data);
    }
  };

  const processNewConversation = (res: ResponseProps<ConversationProps>) => {
    setIsLoading(false);
    if (res.success && res.data) {
      router.back();
      router.push({
        pathname: '/(main)/conversation',
        params: {
          id: res.data._id,
          name: res.data.name,
          avatar: res.data.avatar,
          type: res.data.type,
          participants: JSON.stringify(res.data.participants),
        },
      });
    } else {
      Alert.alert('Error', res.msg);
    }
  };

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setGroupAvatar(result.assets[0]);
    }
  };

  const toggleParticipant = (user: UserProps) => {
    const id = user.id;
    if (!id) return;

    setSelectedParticipants((prev) => {
      if (prev.includes(id)) {
        return prev.filter((prevId) => prevId !== id);
      }
      return [...prev, id];
    });
  };

  const onSelectUser = (user: UserProps) => {
    if (!currentUser) {
      Alert.alert('Erreur', 'Authentification requise');
      return;
    }

    if (isGroupMode) {
      toggleParticipant(user);
    } else {
      newConversation({
        type: 'direct',
        participants: [currentUser.id, user.id],
      });
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || !currentUser || selectedParticipants.length < 2)
      return;

    setIsLoading(true);
    try {
      let avatar = null;
      if (groupAvatar) {
        const uploadResult = await uploadFileToCloudinary(
          groupAvatar,
          'group-avatars',
        );
        if (uploadResult.success) avatar = uploadResult.data;
      }

      newConversation({
        type: 'group',
        participants: [currentUser.id, ...selectedParticipants],
        name: groupName,
        avatar,
      });
    } catch (error: unknown) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Une erreur est survenue',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenWrapper isModal={true}>
        <View style={styles.container}>
          <Header
            title={
              isGroupMode ? 'Nouveau groupe' : 'Sélectionnez un utilisateur'
            }
            leftIcon={<BackButton color={colors.black} />}
          />
          {isGroupMode && (
            <View style={styles.groupInfoContainer}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={onPickImage}>
                  <Avatar
                    uri={groupAvatar?.uri || null}
                    size={100}
                    isGroup={true}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.groupNameContainer}>
                <Input
                  placeholder="Nom du groupe"
                  value={groupName}
                  onChangeText={setGroupName}
                />
              </View>
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contactList}
            keyboardShouldPersistTaps="handled"
          >
            {contacts.map((user: any, index) => {
              const isSelected = selectedParticipants.includes(user.id);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.contactRow,
                    isSelected && styles.selectedContact,
                  ]}
                  onPress={() => onSelectUser(user)}
                >
                  <Avatar size={45} uri={user.avatar} />
                  <Typo fontWeight={'500'}>{user.name}</Typo>

                  {isGroupMode && (
                    <View style={styles.selectionIndicator}>
                      <View
                        style={[styles.checkbox, isSelected && styles.checked]}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {isGroupMode && selectedParticipants.length >= 2 && (
            <View style={styles.createdGroupButton}>
              <Button
                onPress={createGroup}
                disabled={!groupName.trim()}
                loading={isLoading}
              >
                <Typo fontWeight={'bold'} size={17}>
                  Créer le groupe
                </Typo>
              </Button>
            </View>
          )}
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

export default NewConversationModal;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacingX._15,
    flex: 1,
  },
  groupInfoContainer: {
    alignItems: 'center',
    marginTop: spacingY._10,
  },
  avatarContainer: {
    marginBottom: spacingY._10,
  },
  groupNameContainer: {
    width: '100%',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
    paddingVertical: spacingY._5,
  },
  selectedContact: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
  },
  contactList: {
    gap: spacingY._12,
    marginTop: spacingY._20,
    paddingTop: spacingY._10,
    paddingBottom: verticalScale(150),
  },
  selectionIndicator: {
    marginLeft: 'auto',
    marginRight: spacingX._10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  createdGroupButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});
