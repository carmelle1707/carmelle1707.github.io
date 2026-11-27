# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Deux publics à égalité :

- **Recruteurs et entreprises tech** qui évaluent une développeuse full stack pour un stage, une alternance ou un emploi. Ils regardent le savoir-faire technique, les projets réels et le parcours.
- **Clients freelance** (commerces, PME, startups, surtout à Abidjan) qui cherchent quelqu'un pour un site ou une application. Ils veulent être rassurés sur la qualité et pouvoir écrire facilement.

Les deux arrivent souvent depuis LinkedIn, GitHub, un CV ou un lien partagé, sur ordinateur comme sur téléphone.

## Product Purpose

La V2 est le portfolio 3D d'Ange Carmelle Gbedji, développeuse full stack web et mobile à Abidjan. Elle montre le même contenu que le portfolio classique (ange-carmelle-gbedji.vercel.app), mais sous la forme d'une expérience à explorer, qui prouve par elle-même le niveau de réalisation.

Succès : le visiteur parcourt toutes les sections jusqu'au bout et prend contact (formulaire ou WhatsApp).

## Positioning

La V2 n'est pas une variante graphique du site classique : l'expérience elle-même est la démonstration du savoir-faire. Son fil conducteur est la pile technique (données, serveur, API, interface, mobile), qui structure les compétences, les projets et le parcours.

## Operating Context

- Contenu géré depuis l'admin du site Next.js, récupéré à chaque build (`scripts/fetch-content.mjs` → `src/content/admin.json`). Une publication dans l'admin reconstruit la V2 via un deploy hook Vercel.
- Le formulaire de contact envoie vers l'API du site Next.js : même boîte de réception et même anti-spam.
- Site statique pré-rendu (Vite + React 19, rendu serveur au build) : le texte est lisible sans JavaScript et par les moteurs de recherche.

## Capabilities and Constraints

- Pages : accueil (chapitres Accueil, À propos, Parcours, Compétences, Projets, Contact, chacun avec sa propre mise en scène de la tour), une page par projet, page vidéo, page 404.
- Pile : Vite, React 19, Three.js via React Three Fiber et drei, GSAP, Tailwind 4.
- Les appareils sans WebGL, en économie de données ou peu puissants reçoivent une image fixe de la tour ; « réduire les animations » est respecté.
- Le contenu (projets, compétences, parcours, bio) vient de l'admin : la mise en page doit accepter un nombre de projets ou d'étapes qui change.

## Brand Commitments

- Couleurs et identité visuelle actuelles conservées : papier clair, encre bleu nuit, accent or, acier ; thème sombre automatique. Polices Bricolage Grotesque, Figtree, JetBrains Mono.
- La tour de plaques (la pile technique) est le motif 3D propre à la V2.
- Textes en français, à la première personne dans l'expérience.

## Evidence on Hand

- Portrait : `public/images/ange-carmelle-gbedji-portrait.jpg`. Photos de la remise WeCode : `public/images/ange-carmelle-gbedji-*-wecode.jpg`.
- Captures de projets : Flot, YOWL, Post-it (`public/images/*.webp`). CinéScope n'a pas encore de capture.
- Vidéo de présentation de 60 s, servie par le site Next.js.
- Aucun témoignage, chiffre client ou logo : ne pas en inventer. Tasnim Wallet et TS IMMO attendent leurs informations.

## Product Principles

1. Chaque section raconte une partie de l'histoire avec son propre mouvement ; la 3D sert le récit, jamais la décoration.
2. Le contenu reste lisible et accessible à tout moment, animations ou non.
3. Le téléphone reçoit une expérience complète et fluide, pas une version amputée.
4. Rien n'est inventé : un fait manquant reste un emplacement à compléter.
5. Chaque parcours mène naturellement au contact.

## Accessibility & Inclusion

Respect de « réduire les animations », navigation complète au clavier, contrastes suffisants dans les deux thèmes, contenu disponible sans JavaScript.
