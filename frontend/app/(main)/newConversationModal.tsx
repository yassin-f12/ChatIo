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
import { useState } from 'react';
import Input from '@/components/Input';
import Typo from '@/components/Typo';
import { useAuth } from '@/contexts/authContext';
import Button from '@/components/Button';
import { verticalScale } from '@/utils/styling';

const NewConversationModal = ({}) => {
  const { isGroup } = useLocalSearchParams();
  const isGroupMode = isGroup == '1';
  const router = useRouter();
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const { user: currentUser } = useAuth();

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

  const toggleParticipant = (user: any) => {
    setSelectedParticipants((prev: any) => {
      if (prev.includes(user.id)) {
        return prev.filter((id: string) => id != user.id);
      }

      return [...prev, user.id];
    });
  };

  const onSelectUser = (user: any) => {
    if (!currentUser) {
      Alert.alert('Erreur', 'Authentification requise');
      return;
    }

    if (isGroupMode) {
      toggleParticipant(user);
    } else {
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || !currentUser || selectedParticipants.length < 2)
      return;
  };

  const contacts = [
    {
      id: '1',
      name: 'Liam GG',
      avatar: 'https://i.pravatar.cc/150?img=11',
    },
    {
      id: '2',
      name: 'Lionel ronaldo',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
  ];

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
