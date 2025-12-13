# Suivi-VGP 🚀

Application SaaS de gestion et suivi des VGP (Vérifications Générales Périodiques) pour le parc matériel.

## 📋 Fonctionnalités

*   **Dashboard** : Vue d'ensemble des engins et échéances.
*   **Parc Matériel** : Visualisation des engins sous forme de cartes recto-verso interactives.
*   **Gestion VGP** : Formulaire complet pour mettre à jour les statuts, importer les rapports PDF et photos.
*   **Suivi Maintenance** : Tableau récapitulatif avec possibilité d'éditer des notes et d'imprimer un rapport.

## 🛠️ Stack Technique

*   **Frontend** : React, Vite, TailwindCSS
*   **Backend** : Node.js, Express
*   **Base de Données** : Baserow (API)
*   **Automatisation** : n8n (Webhooks)

## 🚀 Installation & Démarrage

### Pré-requis
*   Node.js installé.
*   Accès Internet pour l'API Baserow.

### 1. Backend

```bash
cd backend-node
# Créer un fichier .env avec votre Token Baserow
# BASEROW_API_TOKEN=...
npm install
npm run dev
```

### 2. Frontend

```bash
cd react-app
npm install
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.

## 🧪 Tests

```bash
cd react-app
npx vitest --run
```
