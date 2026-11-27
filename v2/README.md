# Portfolio V2, la pile en 3D

Version expérimentale du portfolio d'Ange Carmelle Gbedji. Le site actuel (Next.js, branche `nextjs`) reste la version en ligne ; cette V2 vit à part, dans ce dossier.

L'idée : une tour de cinq plaques (Données, Serveur, API, Interface, Mobile) qui se recompose selon la section lue. Les compétences allument leur couche, chaque projet ne garde que les couches qu'il utilise, la frise des étapes se lit de bas en haut.

## Lancer

```bash
npm install
npm run dev        # développement
npm run build      # types, build client, rendu serveur des sections dans dist/index.html
npm run preview    # servir le build
npm test           # tests du contenu (vitest)
npm run lint
```

## Pile

React 19, Vite, TypeScript, Three.js avec React Three Fiber et Drei, GSAP, Tailwind CSS 4.

## Accessibilité et appareils modestes

- Le texte est pré-rendu dans le HTML : la page se lit sans attendre la 3D.
- La scène est chargée à part, après le texte.
- Image fixe de la tour à la place de la 3D sans WebGL, en mode économie de données, sur moins de 4 cœurs, si les performances chutent, ou avec `?fixe` dans l'adresse.
- « Réduire les animations » : pas d'intro, caméra sans mouvement, pas d'impulsion.
- Sous 60rem, la tour reste dans l'accueil, fixe.

## Contenu

Tout le contenu est dans `src/content/site.ts`. Ce qui manque est marqué `missing` et s'affiche comme un emplacement à compléter, jamais comme une valeur inventée.
