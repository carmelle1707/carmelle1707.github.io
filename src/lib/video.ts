/**
 * Vidéo de présentation « Beyond the Code » (60 s), en deux formats : carré pour l'ordinateur,
 * vertical pour le téléphone. Fichiers compressés pour le web dans public/videos/.
 * Une seule source pour la section du site, le sitemap vidéo et les données structurées.
 */
export const PRESENTATION_VIDEO = {
  title: "Ange Carmelle Gbedji · Développeuse web et mobile à Abidjan",
  description:
    "Présentation en 60 secondes d'Ange Carmelle Gbedji, développeuse web et mobile freelance à Abidjan : son parcours, ses projets (Flot, YOWL, CinéScope, Post-it) et les technologies qu'elle utilise, du web au mobile.",
  uploadDate: "2026-11-04",
  durationSeconds: 60,
  square: {
    src: "/videos/presentation-carre.mp4",
    poster: "/videos/presentation-carre.jpg",
    width: 720,
    height: 720,
  },
  vertical: {
    src: "/videos/presentation-vertical.mp4",
    poster: "/videos/presentation-vertical.jpg",
    width: 720,
    height: 1280,
  },
} as const;
