import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  success?: boolean;
  msg?: string;
}

export const getErrorMessage = (
  err: unknown,
  fallback = 'Une erreur est survenue',
): string => {
  if (axios.isAxiosError(err)) {
    const axiosError = err as AxiosError<ApiErrorResponse>;

    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return 'La requête a pris trop de temps. Vérifiez votre connexion.';
      }
      return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    }

    const { status, data } = axiosError.response;

    if (data?.msg) return data.msg;

    switch (status) {
      case 400:
        return 'Informations invalides.';
      case 401:
        return 'Identifiants incorrects ou session expirée.';
      case 403:
        return 'Action non autorisée.';
      case 404:
        return 'Ressource introuvable.';
      case 409:
        return 'Cette ressource existe déjà.';
      case 500:
        return 'Erreur serveur, réessayez plus tard.';
      default:
        return fallback;
    }
  }

  if (err instanceof Error) return err.message;

  return fallback;
};