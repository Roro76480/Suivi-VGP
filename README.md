# Suivi VGP - Application de Gestion de Parc Matériel

Application web complète pour le suivi et la gestion des Vérifications Générales Périodiques (VGP) des engins de levage et de manutention.

## 🚀 Fonctionnalités

### 📊 Dashboard
- Vue d'ensemble des engins par statut
- Statistiques en temps réel
- Navigation intuitive

### 🏗️ Gestion du Parc Matériel
- Liste complète des engins avec photos
- Recherche par nom
- Tri par date d'échéance VGP
- Filtres par statut (En service, À renouveler, Expirée)
- Cartes interactives avec flip pour voir les détails

### 📝 Gestion / Suivi VGP
- Formulaire de création et modification d'engins
- Upload de fichiers (Rapports VGP, Photos, Documents)
- Gestion des dates d'échéance
- Champ "A corriger" pour les notes de maintenance

### 🔧 Suivi Maintenances
- Affichage filtré des engins nécessitant des corrections
- Édition directe des notes de maintenance
- Sélection des engins pour le rapport
- **Impression professionnelle** avec fiches détaillées

## 🛠️ Technologies

### Frontend
- **React** 18
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **Axios** (HTTP requests)

### Backend
- **Node.js** / **Express**
- **Baserow API** (Base de données)
- Upload et gestion de fichiers

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Baserow

### Configuration

1. **Cloner le repository**
```bash
git clone <votre-repo-url>
cd Suivi-VGP
```

2. **Backend - Installation**
```bash
cd backend-node
npm install
```

3. **Backend - Configuration**
Créer un fichier `.env` dans `backend-node/` :
```env
PORT=5000
BASEROW_API_URL=https://api.baserow.io
BASEROW_TOKEN=votre_token_baserow
BASEROW_DATABASE_ID=votre_database_id
BASEROW_TABLE_ID=votre_table_id
```

4. **Frontend - Installation**
```bash
cd react-app
npm install
```

5. **Frontend - Configuration**
Créer un fichier `.env` dans `react-app/` :
```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Démarrage

### Mode Développement

**Terminal 1 - Backend:**
```bash
cd backend-node
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd react-app
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Production

**Backend:**
```bash
cd backend-node
npm start
```

**Frontend:**
```bash
cd react-app
npm run build
npm run preview
```

## 📁 Structure du Projet

```
Suivi-VGP/
├── backend-node/          # API Express
│   ├── routes/           # Routes API
│   ├── controllers/      # Logique métier
│   ├── middleware/       # Middleware
│   └── uploads/          # Fichiers uploadés
│
├── react-app/            # Frontend React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   └── layout/       # Layout (Sidebar, etc.)
│   └── public/           # Assets statiques
│
└── MAPPING_A_COMPLETER.md # Documentation mapping BDD
```

## 🔐 Sécurité

- Ne jamais committer les fichiers `.env`
- Les tokens Baserow doivent rester privés
- Les uploads sont stockés dans `/uploads` (non versionné)

## 📝 License

Projet privé - Tous droits réservés

## 👨‍💻 Auteur

Développé avec ❤️ pour la gestion professionnelle de parc matériel VGP
