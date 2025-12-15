# 🚀 Procédure de Mise en Production (Standard Hetzner + Coolify)

Ce document décrit la méthode standardisée pour déployer une application Web (React + Node.js) sur le serveur de production, en s'intégrant parfaitement avec **Coolify** et **Traefik** (HTTPS automatique).

---

## 1. Pré-requis Architecture

Pour que l'application cohabite avec les autres sans conflit de ports :
1.  **Pas de ports publics** : Ne jamais exposer les ports `80` ou `443` dans le `docker-compose.yml`.
2.  **Réseau Coolify** : Utiliser le réseau Docker externe `coolify`.
3.  **Traefik Labels** : Utiliser des labels spécifiques pour que Coolify génère le certificat SSL et route le trafic.

---

## 2. Structure des Fichiers Docker

### A. Backend (`backend-node/Dockerfile`)
Standard Node.js.
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
# Créer les dossiers nécessaires (ex: uploads)
RUN mkdir -p uploads
EXPOSE 5000
CMD ["npm", "start"]
```

### B. Frontend (`react-app/Dockerfile`)
Build React + Serveur Nginx.
**Important :** Gestion des variables d'environnement au build.
```dockerfile
# Stage 1: Build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Réception de l'URL API (Argument de build)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### C. Config Nginx (`react-app/nginx.conf`)
Pour gérer le routing SPA (Single Page Application).
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 3. Le Fichier Maître : `docker-compose.yml`

C'est ici que la magie opère. À copier/adapter pour chaque projet.

```yaml
version: '3.8'

services:
  # --- BACKEND ---
  backend:
    build: ./backend-node
    container_name: nomapp-backend
    restart: always
    environment:
      - PORT=5000
      # Mapping des variables du .env vers le code
      - MON_API_KEY=${MON_API_KEY}
      - DB_HOST=${DB_HOST}
    networks:
      - coolify
      - default
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=coolify"
      # Route API (ex: mon-domaine.fr/api)
      - "traefik.http.routers.nomapp-backend.rule=Host(`mon-domaine.fr`) && PathPrefix(`/api`)"
      - "traefik.http.routers.nomapp-backend.entrypoints=https"
      - "traefik.http.routers.nomapp-backend.tls=true"
      - "traefik.http.routers.nomapp-backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.nomapp-backend.loadbalancer.server.port=5000"

  # --- FRONTEND ---
  frontend:
    build:
      context: ./react-app
      args:
        # URL absolue pour éviter les erreurs de build
        VITE_API_URL: https://mon-domaine.fr/api
    container_name: nomapp-frontend
    restart: always
    depends_on:
      - backend
    networks:
      - coolify
      - default
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=coolify"
      # Route Principale (redirection HTTP -> HTTPS gérée, certification auto)
      - "traefik.http.routers.nomapp-https.rule=Host(`mon-domaine.fr`)"
      - "traefik.http.routers.nomapp-https.entrypoints=https"
      - "traefik.http.routers.nomapp-https.tls=true"
      - "traefik.http.routers.nomapp-https.tls.certresolver=letsencrypt"
      - "traefik.http.services.nomapp-frontend.loadbalancer.server.port=80"

networks:
  coolify:
    external: true
```

---

## 4. Workflow de Déploiement

### A. En Local (Préparation)
Toujours exécuter ces commandes **séparément** dans PowerShell.

1. **Sauvegarder les changements :**
   ```powershell
   git add .
   ```
2. **Valider :**
   ```powershell
   git commit -m "Deployment configuration"
   ```
3. **Envoyer sur GitHub :**
   ```powershell
   git push origin main
   ```

### B. Sur le Serveur (Mise en ligne)

1. **Se connecter :**
   ```bash
   ssh root@<IP_SERVEUR>
   ```

2. **Aller dans le dossier (ou cloner si 1ère fois) :**
   ```bash
   cd /var/www/nomapp
   # Si 1ère fois : git clone <URL_REPO> .
   ```

3. **Mettre à jour le code :**
   ```bash
   git pull origin main
   ```

4. **Configurer les secrets (.env) :**
   **CRITIQUE :** Ce fichier ne se met pas à jour tout seul.
   ```bash
   rm -f .env
   nano .env
   # Coller les variables PROPRES (sans espaces inutiles)
   # Ctrl+O, Enter, Ctrl+X
   ```

5. **Lancer / Relancer :**
   La commande magique qui force la reconstruction (important si on change des URLs).
   ```bash
   docker compose --env-file .env up -d --build --force-recreate
   ```

### C. Vérification

1.  Vérifier que les conteneurs tournent :
    ```bash
    docker compose ps
    ```
2.  Vérifier les logs si erreur 500 :
    ```bash
    docker compose logs backend --tail=50
    ```

---

## 5. Résumé des Pièges à Éviter (Troubleshooting)

| Symptôme | Cause Probable | Solution |
| :--- | :--- | :--- |
| **Erreur "Connection Refused"** | Le frontend tape sur `localhost` | Vérifier `VITE_API_URL` dans le `docker-compose.yml` et `ARG` dans le Dockerfile. |
| **Erreur 500** | Le backend plante | Vérifier les logs (`docker compose logs backend`). Souvent un mauvais mapping de variables dans le `.env`. |
| **Warnings "Variable not set"** | Le `.env` est mal lu | Utiliser l'argument `--env-file .env` explicite. |
| **Erreur de Build** | Cache Docker persistant | Utiliser l'option `--build --no-cache`. |
| **Conflit de ports** | Port 80/443 utilisé | **Ne pas mettre** `ports:` dans le docker-compose, utiliser uniquement `labels:`. |
