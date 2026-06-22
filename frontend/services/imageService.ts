type AvatarFile = string | { uri: string } | null | undefined;

export const getAvatarPath = (file: AvatarFile, isGroup = false) => {
  if (file && typeof file == 'string') return file;
  if (file && typeof file == 'object') return file.uri;
  if (isGroup) return require('@/assets/images/defaultGroupAvatar.png');

  return require('@/assets/images/defaultAvatar.png');
};
