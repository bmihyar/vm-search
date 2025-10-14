# Deployment Guide - Typesense Search App

This guide covers how to deploy the Typesense search application to various environments.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Typesense Server**: A running Typesense instance (local, cloud, or self-hosted)
2. **Data**: The `vm_search` collection populated with data
3. **API Keys**: Search-only API key for the frontend
4. **Node.js**: Version 18 or higher for building

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Add Typesense search app"
   git push origin main
   ```

2. **Create Vercel Project**
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Set the root directory to `apps/typesense`

3. **Configure Environment Variables**
   Add these variables in Vercel dashboard:
   ```env
   NEXT_PUBLIC_TYPESENSE_HOST=your-typesense-host.com
   NEXT_PUBLIC_TYPESENSE_PORT=443
   NEXT_PUBLIC_TYPESENSE_PROTOCOL=https
   NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=your-search-only-api-key
   ```

4. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Your app will be available at `https://your-app.vercel.app`

### Option 2: Netlify

1. **Build the App**
   ```bash
   cd apps/typesense
   npm run build
   npm run export  # If using static export
   ```

2. **Deploy to Netlify**
   - Drag and drop the `out` folder to Netlify
   - Or connect your Git repository

3. **Environment Variables**
   Set in Netlify dashboard under Site Settings > Environment Variables:
   ```env
   NEXT_PUBLIC_TYPESENSE_HOST=your-typesense-host.com
   NEXT_PUBLIC_TYPESENSE_PORT=443
   NEXT_PUBLIC_TYPESENSE_PROTOCOL=https
   NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=your-search-only-api-key
   ```

### Option 3: Docker

1. **Create Dockerfile**
   ```dockerfile
   # apps/typesense/Dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json* ./
   RUN npm ci --only=production && npm cache clean --force
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   # Environment variables for build time
   ARG NEXT_PUBLIC_TYPESENSE_HOST
   ARG NEXT_PUBLIC_TYPESENSE_PORT
   ARG NEXT_PUBLIC_TYPESENSE_PROTOCOL
   ARG NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY
   
   RUN npm run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"
   
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   # Build image
   docker build -t typesense-search \
     --build-arg NEXT_PUBLIC_TYPESENSE_HOST=your-host \
     --build-arg NEXT_PUBLIC_TYPESENSE_PORT=8108 \
     --build-arg NEXT_PUBLIC_TYPESENSE_PROTOCOL=http \
     --build-arg NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=your-key \
     .
   
   # Run container
   docker run -p 3000:3000 typesense-search
   ```

### Option 4: Traditional VPS/Server

1. **Prepare Server**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Copy your app to server
   scp -r apps/typesense user@your-server:/path/to/app
   
   # SSH to server
   ssh user@your-server
   
   # Navigate to app directory
   cd /path/to/app/typesense
   
   # Install dependencies and build
   npm install
   npm run build
   ```

3. **Configure Environment**
   ```bash
   # Create .env.local
   cat > .env.local << EOF
   NEXT_PUBLIC_TYPESENSE_HOST=your-typesense-host
   NEXT_PUBLIC_TYPESENSE_PORT=8108
   NEXT_PUBLIC_TYPESENSE_PROTOCOL=http
   NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=your-search-only-api-key
   EOF
   ```

4. **Start with PM2**
   ```bash
   # Create PM2 configuration
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'typesense-search',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3001
       }
     }]
   }
   EOF
   
   # Start application
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_TYPESENSE_HOST` | Typesense server hostname | `localhost` or `your-domain.com` |
| `NEXT_PUBLIC_TYPESENSE_PORT` | Typesense server port | `8108` for HTTP, `443` for HTTPS |
| `NEXT_PUBLIC_TYPESENSE_PROTOCOL` | Protocol to use | `http` or `https` |
| `NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY` | Search-only API key | Your search-only key |

### Typesense Cloud Configuration

If using Typesense Cloud:
```env
NEXT_PUBLIC_TYPESENSE_HOST=xxx.a1.typesense.net
NEXT_PUBLIC_TYPESENSE_PORT=443
NEXT_PUBLIC_TYPESENSE_PROTOCOL=https
NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=your-cloud-search-key
```

## 🔒 Security Considerations

### API Key Security
- **NEVER** use admin API keys in frontend applications
- Always use search-only API keys for client-side code
- Rotate API keys regularly
- Store keys securely in environment variables

### CORS Configuration
Ensure your Typesense server allows requests from your domain:
```bash
# When starting Typesense server
--enable-cors
--cors-domains=https://your-domain.com
```

### HTTPS Requirements
- Use HTTPS in production
- Ensure Typesense server supports HTTPS
- Configure proper SSL certificates

## 🌐 Reverse Proxy Setup (Nginx)

If deploying behind Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Performance Optimization

### Build Optimization
```json
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  compress: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### CDN Configuration
- Use a CDN for static assets
- Enable compression (gzip/brotli)
- Configure proper caching headers

## 🧪 Testing Deployment

1. **Health Check**
   Visit `/` and verify the health check component shows green

2. **Search Functionality**
   - Try searching for existing terms
   - Verify results are displayed
   - Test pagination on enhanced search

3. **Performance Test**
   ```bash
   # Use tools like:
   npx lighthouse https://your-domain.com
   curl -o /dev/null -s -w "%{time_total}\n" https://your-domain.com
   ```

## 🔄 Continuous Deployment

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
    paths: ['apps/typesense/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/typesense
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Typesense server CORS configuration
   - Verify domain whitelist

2. **API Key Issues**
   - Ensure using search-only key
   - Verify key permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables are set

4. **Connection Timeouts**
   - Check Typesense server accessibility
   - Verify firewall settings
   - Test network connectivity

### Debug Commands
```bash
# Test Typesense connection
curl -H "X-TYPESENSE-API-KEY: your-key" \
  "http://your-host:8108/health"

# Check collection status
curl -H "X-TYPESENSE-API-KEY: your-key" \
  "http://your-host:8108/collections/vm_search"

# Test search endpoint
curl -H "X-TYPESENSE-API-KEY: your-key" \
  "http://your-host:8108/collections/vm_search/documents/search?q=test&query_by=title"
```

## 📝 Monitoring

### Health Monitoring
Set up monitoring for:
- Application uptime
- Typesense server health
- Search response times
- Error rates

### Logging
Configure structured logging:
```javascript
// Add to your Next.js app
console.log('Search performed', {
  query: searchTerm,
  results: hitCount,
  timestamp: new Date().toISOString()
});
```

## 🎯 Post-Deployment Checklist

- [ ] Health check shows green
- [ ] Search functionality works
- [ ] All environment variables set correctly
- [ ] HTTPS enabled (production)
- [ ] Monitoring configured
- [ ] Error tracking set up
- [ ] Performance metrics baseline established
- [ ] Documentation updated
- [ ] Team notified of deployment

---

**Need Help?** Check the main README.md for additional troubleshooting information or raise an issue in the repository.