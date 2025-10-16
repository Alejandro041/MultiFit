# Use a recent Alpine-based Node.js image for a small footprint
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Install lightweight tooling required at runtime (e.g. curl for health checks)
RUN apk add --no-cache curl

# Install dependencies first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the backend source code
COPY . .

# Build the TypeScript project and drop development dependencies
RUN npm run build && npm prune --omit=dev

# Ensure the container runs with production settings
ENV NODE_ENV=production \
    PORT=3001

# Switch to the non-root node user provided by the base image
RUN chown -R node:node /app
USER node

# Expose the API port and define the runtime command
EXPOSE 3001
CMD ["npm", "run", "start"]
