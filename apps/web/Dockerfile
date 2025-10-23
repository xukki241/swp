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

# Copy web package
COPY apps/web ./apps/web

# Install dependencies (skip prepare scripts to avoid husky)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build the web application
RUN pnpm --filter @pharmaflow/web build

# Production stage - using nginx to serve static files
FROM nginx:alpine AS runner

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy custom nginx configuration as template
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy docker entrypoint script
COPY apps/web/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built assets from builder stage
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
  chown -R nginx:nginx /var/cache/nginx && \
  chown -R nginx:nginx /var/log/nginx && \
  chmod -R 755 /usr/share/nginx/html

# Environment variables (can be overridden at runtime)
ENV API_URL=http://api:3000
ENV ENVIRONMENT=production

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
