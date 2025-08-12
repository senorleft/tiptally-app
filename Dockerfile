# Use the official Node.js 20 slim image.
# https://hub.docker.com/_/node
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --production

# Copy local code to the container image.
COPY . .

# Build the application.
RUN npm run build

# Create a non-root user and switch to it.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Expose the port the app runs on.
EXPOSE 3000

# Run the application.
CMD ["npm", "start"]