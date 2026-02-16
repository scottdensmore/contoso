# Use the official Node.js 18 image.
FROM node:18-alpine

# Install dependencies needed for sharp and prisma
RUN apk add --no-cache libc6-compat

# Set working directories
WORKDIR /app

# Copy package files and install dependencies
COPY apps/web/package*.json ./apps/web/
WORKDIR /app/apps/web
RUN npm ci

# Copy application source
COPY apps/web/src ./src
COPY apps/web/public ./public
COPY apps/web/next.config.js ./
COPY apps/web/tsconfig.json ./
COPY apps/web/tailwind.config.ts ./
COPY apps/web/postcss.config.js ./
COPY apps/web/.eslintrc.json ./
COPY apps/web/prisma ./prisma
COPY apps/web/prisma.config.ts ./prisma.config.ts

# Generate prisma client
RUN npx prisma generate --generator client --schema prisma/schema.prisma

# Build the Next.js application
RUN npm run build

# Copy entrypoint script
COPY infrastructure/scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port 3000
EXPOSE 3000

# Use entrypoint script that runs migrations before starting the app
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
