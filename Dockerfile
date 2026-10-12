# STAGE 1: Build Phase
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependenvies cleanly
RUN npm ci

# Copy codebase
COPY . .

# Build the client SPA and Esbuild TypeScript server
RUN npm run build

# STAGE 2: Runner Phase
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy manifests and final outputs from builder state
COPY package*.json ./
COPY --from=builder /app/db.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only to shrink image size
RUN npm ci --omit=dev

EXPOSE 3000

# Run the compiled Server.cjs entry point
CMD ["node", "dist/server.cjs"]
