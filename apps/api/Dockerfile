# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy packages
COPY packages ./packages

# Copy API package
COPY apps/api ./apps/api

# Install dependencies (skip prepare scripts to avoid husky)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build the application (if needed)
# RUN pnpm --filter @pharmaflow/api build

# Production stage
FROM node:22-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy packages
COPY packages ./packages

# Copy API application
COPY apps/api ./apps/api

# Install production dependencies only (skip prepare scripts to avoid husky)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Create logs directory
RUN mkdir -p /app/apps/api/logs && chown -R node:node /app

# Switch to non-root user
USER node

# Expose API port
EXPOSE 3000

# Set working directory to API
WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/server.js"]
