export const cloudinaryErrors: Record<string, string> = {
  "Invalid image file":                "Fichier image invalide",
  "File size too large":               "Fichier trop volumineux",
  "Invalid file type":                 "Type de fichier non autorisé",
  "Upload failed":                     "Échec de l'upload",
  "Resource not found":                "Ressource introuvable",
  "Invalid API key":                   "Clé API invalide",
  "Rate limit exceeded":               "Trop de requêtes, réessayez plus tard",
  "Unauthorized":                      "Non autorisé",
  "Invalid transformation":            "Transformation invalide",
  "Quota exceeded":                    "Quota de stockage dépassé",
};

export function getCloudinaryErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const matched = Object.keys(cloudinaryErrors).find((key) =>
      error.message.includes(key)
    );
    if (matched) return cloudinaryErrors[matched];
    return error.message;
  }

  return "Une erreur inattendue est survenue";
}