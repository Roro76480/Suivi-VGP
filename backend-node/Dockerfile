# Utiliser une version LTS de Node
FROM node:18-alpine

# Créer le dossier de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le reste des fichiers
COPY . .

# Créer le dossier uploads s'il n'existe pas
RUN mkdir -p uploads

# Exposer le port (doit correspondre à votre .env, par défaut 5000)
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]
