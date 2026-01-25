# Use the official Node.js 18 image.
FROM node:18-alpine

# Install dependencies needed for sharp and prisma
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./

# Copy prisma schema
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy application source
COPY src ./src
COPY public ./public
COPY next.config.js ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY .eslintrc.json ./

# Generate prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port 3000
EXPOSE 3000

# Use entrypoint script that runs migrations before starting the app
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
