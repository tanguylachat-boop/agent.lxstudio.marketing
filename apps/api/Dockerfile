# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY .npmrc* ./

# Copy all packages and apps
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all packages and API
RUN pnpm -r build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@8.15.0

# Copy built files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose port
EXPOSE 3001

# Start API
CMD ["node", "apps/api/dist/index.js"]
