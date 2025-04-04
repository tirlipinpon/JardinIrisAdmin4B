# Étape 1 : Construire l'application Angular
FROM node:16 AS build

WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Construire l'application pour la production
RUN npm run build --prod

# Étape 2 : Configurer le serveur pour servir l'application
FROM nginx:alpine

# Copier les fichiers de build depuis l'étape précédente
COPY --from=build /app/dist/ /usr/share/nginx/html

# Exposer le port 8080
EXPOSE 8080

# Démarrer Nginx en mode premier plan
CMD ["nginx", "-g", "daemon off;"]
