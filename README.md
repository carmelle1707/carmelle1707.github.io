# Portfolio · Ange Carmelle Gbedji

Site vitrine de développeuse web et mobile freelance à Abidjan, avec un espace d'administration
pour tout modifier sans toucher au code : textes, services, méthode, projets, compétences,
parcours, bandeau, photo, CV, coordonnées, et la boîte de réception du formulaire de contact.

## Sommaire

- [Technologies](#technologies)
- [Organisation du code](#organisation-du-code)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer le site](#lancer-le-site)
- [Utiliser l'administration](#utiliser-ladministration)
- [Tests et qualité](#tests-et-qualité)
- [Déploiement sur Vercel](#déploiement-sur-vercel)
- [Sécurité](#sécurité)

## Technologies

| Rôle            | Outil                                                              |
| --------------- | ------------------------------------------------------------------ |
| Framework       | Next.js 16 (App Router, Server Actions, `use cache`)               |
| Langage         | TypeScript strict, aucun `any`                                     |
| Styles          | Tailwind CSS 4 (couleurs et polices dans `src/app/globals.css`)    |
| Base de données | MongoDB Atlas avec Mongoose                                        |
| Validation      | Zod, côté serveur pour chaque formulaire et chaque action          |
| Connexion admin | Auth.js v5 (un seul compte, mot de passe hashé avec bcrypt)        |
| Fichiers        | Vercel Blob (photo, CV, captures des projets)                      |
| Emails          | Resend (notification à chaque message du formulaire)               |
| Animations      | CSS, `motion` (déclenchement au scroll) et Lenis (défilement doux) |
| Glisser-déposer | dnd-kit                                                            |
| Notifications   | sonner                                                             |
| Tests           | Vitest (schémas et actions), Playwright (parcours complets)        |

Toutes les animations respectent le réglage « réduire les animations » du système. Le curseur
personnalisé, les boutons magnétiques et les cartes en 3D ne s'activent qu'avec une souris.

## Organisation du code

```
src/
  app/
    (site)/         page publique, image de partage (opengraph-image)
    admin/          connexion et espace d'administration
    api/            connexion (Auth.js) et autorisation d'envoi de fichiers
    robots.ts, sitemap.ts
  actions/          Server Actions (contact, connexion, profil, listes, messages)
  components/
    site/           sections du site public
    admin/          formulaires, listes réordonnables, boîte de réception
  lib/              accès aux données, cache, Blob, emails, limitation de fréquence…
  models/           modèles Mongoose
  schemas/          schémas Zod (partagés par les formulaires et le serveur)
  auth.ts           configuration Auth.js
  proxy.ts          protège /admin avant même d'afficher la page
data/content.json   contenu de départ, importé par `npm run seed`
scripts/            seed, base locale de développement, serveur des tests
tests/              tests Vitest
e2e/                tests Playwright
docs/reference/     maquettes HTML d'origine
```

## Installation

Prérequis : Node.js 24 (le fichier `.nvmrc` le fixe ; avec nvm, `nvm use` suffit).

```bash
nvm use
```

```bash
npm install
```

```bash
cp .env.example .env.local
```

Remplis ensuite `.env.local` (voir la section suivante). Ce fichier contient tes secrets : il
est ignoré par git et ne doit jamais être partagé ni commité.

## Variables d'environnement

Chaque variable est aussi expliquée dans `.env.example`.

| Variable                | Obligatoire        | Où la trouver                                                                                                                 |
| ----------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | en production      | L'adresse publique du site, sans `/` final (ex. `https://ange-carmelle.vercel.app`). Sert aux liens de partage et au sitemap. |
| `MONGODB_URI`           | oui                | MongoDB Atlas › Database › Connect › Drivers. Ajoute le nom de la base après le `/` : `…mongodb.net/portfolio?…`              |
| `AUTH_SECRET`           | oui                | Une chaîne aléatoire : `npx auth secret` ou `openssl rand -base64 32`                                                         |
| `ADMIN_EMAIL`           | oui (pour le seed) | L'email de connexion à l'admin                                                                                                |
| `ADMIN_PASSWORD`        | oui (pour le seed) | 12 caractères minimum. Il est hashé avant d'être enregistré, jamais stocké en clair.                                          |
| `BLOB_READ_WRITE_TOKEN` | pour les fichiers  | Vercel › Storage › Create › Blob, puis l'onglet `.env.local` du store                                                         |
| `RESEND_API_KEY`        | pour les emails    | resend.com › API Keys › Create API Key (permission « Sending access »)                                                        |
| `CONTACT_FROM_EMAIL`    | non                | Expéditeur des emails. `onboarding@resend.dev` tant qu'aucun domaine n'est vérifié sur Resend.                                |
| `CONTACT_TO_EMAIL`      | pour les emails    | L'adresse qui reçoit les messages du formulaire                                                                               |
| `RATE_LIMIT_SALT`       | recommandé         | N'importe quelle chaîne aléatoire : sert à brouiller les adresses IP avant de les enregistrer                                 |

Sans `RESEND_API_KEY`, les messages du formulaire sont tout de même enregistrés et visibles
dans l'admin. Sans `BLOB_READ_WRITE_TOKEN`, l'admin affiche les fichiers existants mais
désactive l'envoi de nouveaux fichiers.

Avec l'expéditeur `onboarding@resend.dev`, Resend n'envoie qu'à l'adresse du compte Resend :
crée ce compte avec l'adresse de `CONTACT_TO_EMAIL`, ou vérifie un domaine sur Resend.

## Lancer le site

### Avec MongoDB Atlas

Première fois : importe le contenu de départ et crée le compte admin.

```bash
npm run seed
```

Le seed ne remplace jamais un contenu déjà présent ni les messages reçus. Pour repartir du
contenu de `data/content.json` (les messages restent) :

```bash
npm run seed -- --force
```

Puis :

```bash
npm run dev
```

Le site est sur http://localhost:3000 et l'admin sur http://localhost:3000/admin.

### Sans compte Atlas (base locale)

```bash
npm run dev:memory
```

Lance une base MongoDB sur ta machine (données gardées dans `.data/`, ignoré par git), la
remplit depuis `data/content.json` au premier lancement et crée le compte admin si
`ADMIN_EMAIL` et `ADMIN_PASSWORD` sont dans `.env.local`.

## Utiliser l'administration

Connexion sur `/admin` avec `ADMIN_EMAIL` et `ADMIN_PASSWORD`.

- **Tableau de bord** : messages non lus, interrupteur « Disponible », état du contenu.
- **Messages** : ouvrir un message le marque lu ; « Répondre par email » prépare la réponse ;
  archiver, remettre, marquer non lu, supprimer.
- **Profil** : accroche, texte d'introduction, fiche pratique, photo et CV.
- **Projets** : publié ou brouillon, capture d'écran, liens de démo et GitHub, technologies.
- **Services, Méthode, Compétences, Parcours, Bandeau** : ajouter, modifier, supprimer,
  changer l'ordre en glissant la poignée ⠿ (ou au clavier : Espace, flèches, Espace).
- **Contact** : titre et coordonnées de la dernière section. Un champ vide n'apparaît pas.

Dans les titres, les mots entourés d'étoiles (`*comme ceci*`) s'affichent en italique doré.

Chaque enregistrement met le site public à jour immédiatement. « Voir le site » ouvre la page
publique dans un nouvel onglet.

## Tests et qualité

| Commande            | Ce qu'elle fait                                            |
| ------------------- | ---------------------------------------------------------- |
| `npm run lint`      | ESLint                                                     |
| `npm run typecheck` | Vérification TypeScript                                    |
| `npm run format`    | Prettier (avec le tri des classes Tailwind)                |
| `npm run test`      | Tests Vitest, chacun avec sa propre base MongoDB jetable   |
| `npm run test:e2e`  | Build de production puis tests Playwright                  |
| `npm run check`     | lint + types + tests + build, à lancer avant chaque commit |

Les tests Playwright démarrent leur propre serveur (`scripts/e2e-server.ts`) avec une base
jetable et un compte admin de test (`e2e/fixtures.ts`) : ils ne touchent ni à `.env.local` ni
à ta vraie base. Ils couvrent la connexion admin, l'ajout d'un projet et le formulaire de
contact, sur ordinateur et sur mobile.

Sous Ubuntu / WSL, Chromium a besoin de bibliothèques système, à installer une fois :

```bash
cd ~/Rendu/carmelle1707.github.io && source ~/.nvm/nvm.sh && sudo env "PATH=$PATH" npx playwright install-deps chromium
```

## Déploiement sur Vercel

1. Pousse le dépôt sur GitHub, puis sur vercel.com : **Add New › Project** et importe-le.
   Vercel détecte Next.js tout seul.
2. Dans **Settings › Environment Variables**, ajoute toutes les variables du tableau
   ci-dessus (Production et Preview). `NEXT_PUBLIC_SITE_URL` doit contenir l'adresse finale.
3. Dans **Storage**, crée un store Blob et relie-le au projet : `BLOB_READ_WRITE_TOKEN` est
   ajouté automatiquement.
4. Dans MongoDB Atlas › Network Access, autorise les connexions depuis Vercel
   (`0.0.0.0/0`, l'accès restant protégé par le mot de passe de la base).
5. Lance le seed une fois sur la base de production, depuis ta machine, avec le
   `MONGODB_URI` de production dans `.env.local` : `npm run seed`.
6. Déploie. Chaque push sur la branche de production redéploie le site.

## Sécurité

- Les secrets ne sont que dans `.env.local` (local) et les variables Vercel (production).
- `/admin` est protégé deux fois : par `src/proxy.ts`, puis par une vérification de session
  côté serveur dans chaque page et chaque action (`requireAdmin`).
- Connexion limitée à 10 tentatives par quart d'heure et par IP ; formulaire de contact
  limité à 5 messages par heure, avec un champ piège contre les robots.
- Tout ce qui arrive du navigateur est revalidé avec Zod côté serveur.
- Les adresses IP ne sont jamais stockées en clair (hash salé avec `RATE_LIMIT_SALT`).
- L'admin n'est pas indexé par les moteurs de recherche (`robots.txt` et balise `noindex`).
