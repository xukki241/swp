#!/bin/sh
set -e

# Default API URL if not provided
API_URL=${API_URL:-http://api:3000}

echo "🚀 Starting PharmaFlow Web App"
echo "📡 API URL: $API_URL"

# Replace environment variables in nginx config
envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Replace environment variables in JavaScript files
# This allows runtime configuration without rebuilding
if [ -d "/usr/share/nginx/html/assets" ]; then
    echo "🔧 Injecting runtime environment variables..."
    
    # Create runtime config
    cat > /usr/share/nginx/html/config.js << EOF
window.__RUNTIME_CONFIG__ = {
  API_URL: '${API_URL}',
  ENVIRONMENT: '${ENVIRONMENT:-production}'
};
EOF
fi

echo "✅ Configuration complete"

# Start nginx
exec nginx -g 'daemon off;'
