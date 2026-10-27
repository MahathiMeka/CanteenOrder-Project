
# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies inside Linux
COPY package*.json ./
RUN npm install

# Copy source files, excluding local node_modules
COPY src ./src
COPY index.html ./
COPY package.json ./
COPY package-lock.json ./

# Reinstall Vite dependencies and fix permission
RUN npm install
RUN chmod +x node_modules/.bin/vite

# Build frontend
RUN npm run build

# Stage 2: Serve production
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
