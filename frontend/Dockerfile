# Tahap 1: Build app
FROM node:current-alpine AS builder

WORKDIR /app

# Upgrade npm (opsional, tapi aman)
RUN npm install -g npm@latest

# Copy dependency list
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code
COPY . .

# Jalankan build tanpa lint
RUN npm run build -- --no-lint

# Tahap 2: Production image
FROM node:current-alpine AS runner

WORKDIR /app

# Copy hasil build dan dependensi minimal
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Jalankan app di port 3000
EXPOSE 3000
CMD ["npm", "run", "start"]
