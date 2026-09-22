# Répartiteur de groupes

Application Next.js pour créer rapidement des groupes aléatoires, les équilibrer, les modifier manuellement et partager le résultat pendant un événement.

## Fonctionnalités

- Répartition aléatoire en un nombre configurable de groupes.
- Responsables prédéfinis et responsables modifiables par groupe.
- Import CSV, Excel (`.xlsx`, `.xls`) et PDF avec les noms, emails et métadonnées des participants.
- Drag & drop, ajout, suppression et renommage des participants et des groupes.
- Détection et suppression des doublons.
- Statistiques et équilibrage automatique des tailles.
- Recherche dans les groupes.
- Historique local avec restauration des répartitions précédentes.
- Export PDF, CSV, impression et copie pour WhatsApp ou email.
- Mode présentation sur `/presentation`.
- Envoi individuel des groupes par email via Resend.

## Installation

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Commandes

```bash
npm run dev    # serveur de développement
npm run lint   # ESLint
npm run build  # build de production
npm start      # démarre le build de production
```

L'import accepte les fichiers CSV, Excel (`.xlsx`, `.xls`) et les PDF contenant du texte sélectionnable. Pour Google Sheets, téléchargez la feuille au format CSV ou Excel avant de l'importer. Les PDF scannés nécessitent une étape d'OCR et ne sont pas reconnus automatiquement.

## Envoi d'emails

L'envoi est facultatif. Pour l'activer, définir `RESEND_API_KEY` dans `.env.local` :

```bash
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL="Retraite <contact@votre-domaine-verifie.fr>"
```

`RESEND_FROM_EMAIL` doit utiliser une adresse d'un domaine vérifié dans Resend. Les participants importés par CSV doivent avoir une adresse email valide. Les participants sans email sont ignorés et signalés dans la fenêtre d'envoi.

## Données et confidentialité

Les groupes, participants et historiques sont conservés dans le `localStorage` du navigateur. Aucune base de données n'est nécessaire pour le fonctionnement courant. Les emails sont envoyés côté serveur via Resend lorsque la clé API est configurée.

## Limites actuelles

Les tags de compétences, les QR codes, le minuteur et l'affectation selon des critères avancés restent prévus pour une prochaine version. Voir [ROADMAP.md](ROADMAP.md).
