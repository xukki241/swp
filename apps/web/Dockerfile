# Build stage
FROM node:22-alpine AS builder

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3000/api

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy packages
COPY packages ./packages

# Copy web package
COPY apps/web ./apps/web

# Install dependencies (skip prepare scripts to avoid husky)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build the web application with environment variables baked in
RUN pnpm --filter @pharmaflow/web build

# Production stage - using nginx to serve static files
FROM nginx:alpine AS runner

# Copy custom nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
  chown -R nginx:nginx /var/cache/nginx && \
  chown -R nginx:nginx /var/log/nginx && \
  chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
