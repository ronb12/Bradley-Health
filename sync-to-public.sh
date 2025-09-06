#!/bin/bash

# Bradley Health - Sync to Public Directory for Firebase Hosting
# This script copies all necessary files to the public/ directory for Firebase deployment

echo "🔄 Syncing Bradley Health files to public directory..."

# Create public directory if it doesn't exist
mkdir -p public

# Copy main application files
echo "📄 Copying main application files..."
cp index.html manifest.json service-worker.js offline.html public/

# Copy assets directory
echo "📁 Copying assets directory..."
cp -r assets public/

# Copy any additional HTML files that might be needed
echo "📄 Copying additional HTML files..."
cp -f *.html public/ 2>/dev/null || true

# Copy any additional JS files that might be needed
echo "📄 Copying additional JS files..."
cp -f *.js public/ 2>/dev/null || true

# Copy JSON configuration files
echo "📄 Copying JSON configuration files..."
cp -f content.json public/ 2>/dev/null || true

# Ensure proper permissions
echo "🔐 Setting proper permissions..."
chmod -R 755 public/

# Create a simple build info file
echo "📊 Creating build info..."
cat > public/build-info.json << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.1.1",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF

echo "✅ Sync completed successfully!"
echo "📁 Files synced to: public/"
echo "🚀 Ready for Firebase deployment!"
