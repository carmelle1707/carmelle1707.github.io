# Être trouvée sur Google

Ce que le site fait déjà tout seul : titre et description avec « Abidjan » sur chaque page,
une page par offre (`/services/site-vitrine`, `/services/application-web`,
`/services/application-mobile`) et par projet, sitemap, données structurées (personne,
services, fil d'Ariane), image de partage, et l'ancien site `carmelle1707.github.io` qui
redirige ici.

Ce qui reste à faire de ton côté, avec ton compte Google : les parties ci-dessous.

---

## 0. Être le premier résultat sur ton nom

Ce qu'il faut savoir, honnêtement :

- **Aucun réglage ne garantit la 1re place** : c'est Google qui classe. Mais sur un nom propre
  peu courant comme « Ange Carmelle Gbedji », un site bien déclaré arrive en général en tête
  en quelques jours à quelques semaines.
- **Les suggestions pendant la frappe** (« Ange Carm… » → ton nom) ne se règlent pas : Google
  les propose quand assez de gens tapent ton nom. Elles viendront avec le temps, en partageant
  le site et la vidéo.

Ce que le site fait déjà : ton nom ouvre le titre de chaque page, ta fiche « personne »
(données structurées) relie le site à LinkedIn et GitHub et donne les variantes « Ange
Carmelle », « Carmelle Gbedji », « Ange Gbedji » ; la vidéo est déclarée à Google
(données vidéo + sitemap) avec une miniature qui montre ton nom et ta photo.

Dans l'ordre, ce qui fait vraiment la différence :

1. **Search Console** (partie 1) puis **Inspection de l'URL › Demander une indexation** sur
   l'accueil. Sans ça, Google peut mettre des semaines à découvrir le site.
2. **Les mêmes liens partout** : mets `https://ange-carmelle-gbedji.vercel.app/` dans ta bio
   LinkedIn (section « Coordonnées » et « Sélection »), ton profil GitHub (champ Website),
   WhatsApp Business, Instagram/TikTok. Ce sont les premiers profils que Google associe à ton nom.
3. **La vidéo sur YouTube** : publie la version carrée (ou la verticale en Short) sur une chaîne
   à ton nom, avec le titre `Ange Carmelle Gbedji · Développeuse web et mobile à Abidjan`
   et l'adresse du site en première ligne de la description. YouTube est très souvent affiché
   juste sous le site quand on cherche un nom.
4. **La fiche Google Business** (partie 2), qui peut s'afficher à droite des résultats.
5. **Un nom de domaine à toi** (par exemple `angecarmellegbedji.com`) : facultatif, mais un
   domaine qui contient ton nom aide encore et inspire confiance.

---

## 1. Google Search Console (15 minutes, une seule fois)

Pour que Google connaisse le site, l'indexe vite et te montre sur quelles recherches tu apparais.

1. Va sur https://search.google.com/search-console et connecte-toi avec ton compte Google.
2. **Ajouter une propriété** › choisis **Préfixe de l'URL** (pas « Domaine ») ›
   colle `https://ange-carmelle-gbedji.vercel.app/` › **Continuer**.
3. Dans la liste des méthodes, ouvre **Balise HTML**. Tu vois une ligne comme
   `<meta name="google-site-verification" content="AbCd123…" />`.
   Copie **seulement le code** entre les guillemets de `content="…"`. Laisse cette page ouverte.
4. Dans Vercel › projet `ange-carmelle-gbedji` › **Settings › Environment Variables** ›
   **Add Environment Variable** : type **Config**, Key `GOOGLE_SITE_VERIFICATION`,
   Value = le code copié, environnement **Production** › **Save**.
5. **Deployments** › sur le dernier déploiement, menu **⋯ › Redeploy**. Attends « Ready ».
6. Reviens sur Search Console et clique sur **Valider**.
7. Menu de gauche **Sitemaps** › tape `sitemap.xml` › **Envoyer**.
8. Menu **Inspection de l'URL** : colle l'adresse de l'accueil, puis **Demander une indexation**.
   Recommence pour les trois pages d'offres.

Les premiers chiffres (impressions, clics, recherches) apparaissent après quelques jours.

---

## 2. Fiche d'établissement Google (Google Business Profile)

C'est elle qui apparaît sur Google Maps et à droite des résultats quand quelqu'un cherche
« création site web Abidjan » ou « développeuse web Abidjan ». C'est le levier le plus fort
pour une activité locale.

Va sur https://business.google.com › **Ajouter votre établissement** et suis les écrans
avec les réponses ci-dessous.

| Écran                  | Réponse                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nom de l'établissement | `Ange Carmelle Gbedji` — ton vrai nom, sans mots-clés ajoutés (Google sanctionne « … création site web Abidjan » dans le nom)                      |
| Type                   | **Établissement de services** (tu te déplaces ou tu travailles à distance)                                                                         |
| Catégorie principale   | Tape « site web » et choisis **Concepteur de sites Web**                                                                                           |
| Catégories secondaires | Si elles sont proposées : **Développeur de logiciels**, **Service de conception d'applications** (ne prends que celles qui existent dans la liste) |
| Adresse                | **Non**, ne pas afficher d'adresse (tu n'accueilles pas de clients dans un local)                                                                  |
| Zone desservie         | Abidjan, puis ajoute les communes : Cocody, Plateau, Marcory, Treichville, Yopougon, Koumassi, Adjamé, Abobo, Port-Bouët, Bingerville              |
| Téléphone              | Ton numéro WhatsApp professionnel                                                                                                                  |
| Site web               | `https://ange-carmelle-gbedji.vercel.app/`                                                                                                         |

Google te demandera ensuite de **valider** la fiche (code par SMS, appel, e-mail ou courte
vidéo selon les cas). Sans validation, la fiche n'apparaît pas.

### Description (à coller, 645 caractères sur 750 autorisés)

> Développeuse web et mobile freelance à Abidjan, je crée des sites vitrines, des
> applications web et des applications mobiles pour les commerces, PME, startups et
> associations. Un site rapide et clair pour être trouvé en ligne, présenter vos services
> et recevoir des demandes de clients, sur ordinateur comme sur téléphone : bouton WhatsApp,
> formulaire de contact, Google Maps. Des plateformes sur mesure pour gérer vos données,
> vos clients ou vos réservations. Des apps Android et iOS à partir d'un seul code. Je vous
> accompagne de l'échange à la mise en ligne, avec une maquette validée avant le
> développement. Devis gratuit, réponse sous 24 h.

### Services (onglet « Services » de la fiche)

- **Site vitrine** — Un site rapide et clair qui présente votre activité et transforme les
  visiteurs en contacts. Design adapté au mobile, WhatsApp, Google Maps, mise en ligne.
- **Application web** — Une plateforme sur mesure : espace d'administration, comptes
  utilisateurs, tableaux de bord, base de données sécurisée.
- **Application mobile** — Une app Android et iOS (React Native), connectée à votre site,
  testée sur vrais téléphones, avec accompagnement à la publication.

### Photos

- **Photo de profil** : ton portrait (`public/images/photo-profil.jpeg`).
- **Couverture** : l'image de partage du site, à télécharger depuis
  `https://ange-carmelle-gbedji.vercel.app/opengraph-image-12o0cb`.
- **3 à 5 photos de projets** : captures de tes réalisations (recadrées sur l'application,
  sans barre des tâches Windows ni onglets du navigateur).

### Ensuite, ce qui fait vraiment monter la fiche

1. **Les avis clients.** Dans la fiche, **Demander des avis** donne un lien court : envoie-le
   sur WhatsApp à chaque client satisfait. Réponds à chaque avis.
2. **Une publication par mois** (onglet « Ajouter une actualité ») : un projet livré, une
   offre, une capture. Ça montre à Google que la fiche est active.
3. **Les mêmes informations partout** : nom, numéro et site identiques sur la fiche, le site,
   LinkedIn, GitHub et WhatsApp Business.

---

## 3. Petits gestes qui aident

- Mets l'adresse du site dans ta bio **LinkedIn**, ton profil **GitHub**, ton profil
  **WhatsApp Business** et tes réseaux.
- Quand un client est d'accord, ajoute un lien « Site réalisé par Ange Carmelle Gbedji »
  dans le pied de page de son site.
- Plus tard, un nom de domaine à toi (par exemple en `.ci` ou `.com`) inspire plus confiance
  que `vercel.app` et se branche en quelques minutes dans Vercel › **Domains**.
