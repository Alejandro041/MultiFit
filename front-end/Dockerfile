# Stage 1: install dependencies using a clean npm environment
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: build the Vite application with the provided environment variables
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_BACKEND_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL} \
    VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
RUN npm run build

# Stage 3: serve the compiled assets with Nginx
FROM nginx:stable-alpine AS prod
WORKDIR /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing, gzip, and security headers
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets into the Nginx web root
COPY --from=build /app/dist ./

# Expose HTTP port 80 for the container
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
