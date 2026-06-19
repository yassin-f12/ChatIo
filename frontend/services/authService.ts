import { API_URL } from '@/constants';
import { getErrorMessage } from '@/utils/errorHandler';
import axios from 'axios';

export const login = async (
  email: string,
  password: string,
): Promise<{ token: string }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Connexion échouée'));
  }
};

export const register = async (
  email: string,
  password: string,
  name: string,
  avatar?: string | null,
): Promise<{ token: string }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name,
      avatar,
    });
    return response.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "L'enregistrement a échoué"));
  }
};
