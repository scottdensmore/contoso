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

# Copy all other source files
COPY . .

# Generate prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
