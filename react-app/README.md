# Suivi-VGP (Frontend React)

Ce modèle fournit une configuration minimale pour faire fonctionner React dans Vite avec HMR (Hot Module Replacement) et quelques règles ESLint.

## 📋 Fonctionnalités du Frontend

*   **React** v18+
*   **Vite** pour un développement ultra-rapide
*   **Tailwind CSS** pour le style
*   **React Router** pour la navigation

## 🔌 Plugins disponibles

Actuellement, deux plugins officiels sont disponibles :

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) utilise [Babel](https://babeljs.io/) pour le Fast Refresh.
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) utilise [SWC](https://swc.rs/) pour le Fast Refresh.

## 🚀 Installation & Démarrage

```bash
# Installation des dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

## 🧪 Tests

```bash
npx vitest --run
```
