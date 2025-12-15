# Étape 1 : Build de l'application React
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# La commande build génère les fichiers dans /app/dist
RUN npm run build

# Étape 2 : Serveur Web Nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copier la configuration custom Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis l'étape précédente
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
