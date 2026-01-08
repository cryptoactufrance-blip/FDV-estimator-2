# 📊 Crypto FDV Estimator

Un outil web pour estimer la Fully Diluted Valuation (FDV) de tokens crypto basé sur leurs revenus.

## 🎯 Fonctionnalités

- **Graphique interactif** : Visualisation scatter plot en échelle logarithmique
- **Régression pondérée** : Estimation automatique de la FDV pour les projets sans token
- **Tableau de données** : Toutes les métriques triables
- **Logs de debug** : Suivi détaillé des appels API et calculs

## 🚀 Déploiement sur Vercel (Guide débutant)

### Étape 1 : Créer un compte GitHub

1. Va sur [github.com](https://github.com)
2. Clique sur "Sign up" et crée ton compte
3. Vérifie ton email

### Étape 2 : Créer un nouveau repository

1. Une fois connecté, clique sur le bouton vert "New" ou va sur [github.com/new](https://github.com/new)
2. Nom du repository : `crypto-fdv-estimator`
3. Laisse "Public" coché
4. Clique sur "Create repository"

### Étape 3 : Uploader les fichiers

Tu peux uploader les fichiers de 2 façons :

#### Option A : Via l'interface web (plus simple)

1. Sur la page de ton nouveau repository, clique sur "uploading an existing file"
2. Glisse-dépose tous les fichiers :
   - `index.html`
   - `vercel.json`
   - `package.json`
3. Pour le dossier `api/`, tu dois d'abord créer le dossier :
   - Clique sur "Add file" > "Create new file"
   - Tape `api/fees.js` comme nom de fichier
   - Colle le contenu du fichier `api/fees.js`
   - Clique sur "Commit new file"
   - Répète pour `api/coingecko.js`

#### Option B : Via Git (si tu connais)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/crypto-fdv-estimator.git
git push -u origin main
```

### Étape 4 : Créer un compte Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Clique sur "Sign Up"
3. Choisis "Continue with GitHub" (recommandé)
4. Autorise Vercel à accéder à ton GitHub

### Étape 5 : Déployer le projet

1. Sur le dashboard Vercel, clique sur "Add New..." > "Project"
2. Tu verras la liste de tes repositories GitHub
3. Trouve `crypto-fdv-estimator` et clique sur "Import"
4. Laisse tous les paramètres par défaut
5. Clique sur "Deploy"
6. Attends 1-2 minutes...
7. 🎉 Ton site est en ligne !

### Étape 6 : Accéder à ton site

Vercel te donnera une URL du type :
`https://crypto-fdv-estimator.vercel.app`

Tu peux aussi ajouter un domaine personnalisé dans les paramètres du projet.

## 📁 Structure des fichiers

```
crypto-fdv-estimator/
├── api/
│   ├── fees.js          # Edge Function pour DeFiLlama
│   └── coingecko.js     # Edge Function pour CoinGecko
├── index.html           # Frontend complet
├── vercel.json          # Configuration Vercel
├── package.json         # Métadonnées du projet
└── README.md            # Ce fichier
```

## ⚙️ Comment ça marche

### Flux de données

1. **Chargement** : L'app charge les données au démarrage
2. **Fees** : Récupère les revenus via `/api/fees` (DeFiLlama)
3. **FDV** : Récupère les FDV via `/api/coingecko` (CoinGecko)
4. **Régression** : Calcule une régression pondérée sur les projets avec token
5. **Estimation** : Utilise la régression pour estimer la FDV des projets sans token

### Calculs clés

- **Revenu annuel** : `(total7d / 7) * 365`
- **Ratio** : `FDV / Revenu annuel`
- **Régression** : Pondérée par le revenu (les gros projets comptent plus)

## 📋 Projets trackés

### Avec token (FDV réelle)
- Hyperliquid
- Lighter
- Aster
- dYdX
- Avantis

### Sans token (FDV estimée)
- Extended
- Paradex
- EdgeX
- Ethereal
- Ostium
- Unit

## 🔧 Modification

### Ajouter un projet avec token

Dans `index.html`, trouve la section `PROJECTS.withToken` et ajoute :

```javascript
{ name: 'NomDuProjet', llamaSlug: 'slug-defillama', coingeckoId: 'id-coingecko' },
```

### Ajouter un projet sans token

Dans `index.html`, trouve la section `PROJECTS.withoutToken` et ajoute :

```javascript
{ name: 'NomDuProjet', llamaSlug: 'slug-defillama' },
```

## 🐛 Dépannage

### Le site ne charge pas les données

1. Ouvre les outils développeur (F12)
2. Va dans l'onglet "Console" pour voir les erreurs
3. Va dans l'onglet "Network" pour voir les appels API

### Erreur API

- **429** : Rate limiting, attends quelques minutes
- **404** : Le slug du projet est incorrect
- **500** : Problème serveur, réessaie plus tard

### Le graphique est vide

Vérifie dans les logs de debug que les projets ont bien des revenus > 0.

## 📝 Licence

MIT - Utilise ce projet comme tu veux !

## 🙋 Questions ?

Si tu as des questions, n'hésite pas à créer une "Issue" sur GitHub ou à me recontacter !
