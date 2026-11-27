/**
 * Photos de la remise des attestations WeCode, affichées sous « Mon parcours ».
 * Comme pour le portrait, le nom du fichier et le texte alternatif portent le nom complet :
 * Google Images les associe ainsi aux recherches sur elle. Source unique pour la page et le sitemap.
 */
export const WECODE_PHOTOS = [
  {
    src: "/images/ange-carmelle-gbedji-attestation-wecode.jpg",
    alt: "Ange Carmelle Gbedji reçoit son attestation de formation WeCode",
  },
  {
    src: "/images/ange-carmelle-gbedji-graduation-wecode.jpg",
    alt: "Ange Carmelle Gbedji à la cérémonie de remise des diplômes WeCode",
  },
  {
    src: "/images/ange-carmelle-gbedji-promotion-wecode.jpg",
    alt: "Ange Carmelle Gbedji et une camarade de la promotion WeCode",
  },
].map((p) => ({ ...p, width: 1400, height: 933 }));
