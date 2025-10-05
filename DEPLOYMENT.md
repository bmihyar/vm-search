# VM Search Deployment Guide

This guide covers how to deploy the VM Search application to production environments.

## Overview

The VM Search application consists of two main components:
- **Frontend (web)**: Next.js application
- **Backend (api)**: Express.js API server with Typesense integration

## Environment Configuration

### API URL Configuration

The frontend needs to know where to find the API server. This is configured via environment variables.

#### Development
```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Production
```bash
# apps/web/.env.production.local
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### API Environment Variables

```bash
# apps/api/.env
PORT=3001
NODE_ENV=production

# Typesense Configuration
TYPESENSE_HOST=your-typesense-host
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your-secure-api-key
```

## Deployment Scenarios

### 1. Same Domain Deployment (Recommended)

Deploy both frontend and API on the same domain using a reverse proxy.

```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Frontend environment:
```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### 2. Separate Domain Deployment

Deploy API and frontend on different domains.

Frontend environment:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Docker Deployment

#### Docker Compose Example

```yaml
# docker-compose.yml
version: '3.8'

services:
  typesense:
    image: typesense/typesense:29.0
    ports:
      - "8108:8108"
    environment:
      - TYPESENSE_API_KEY=xyz
      - TYPESENSE_DATA_DIR=/data
    volumes:
      - typesense_data:/data
    command: '--data-dir /data --api-key=xyz --enable-cors'

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - TYPESENSE_HOST=typesense
      - TYPESENSE_PORT=8108
      - TYPESENSE_PROTOCOL=http
      - TYPESENSE_API_KEY=xyz
    depends_on:
      - typesense

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on:
      - api

volumes:
  typesense_data:
```

#### API Dockerfile

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/api ./apps/api

# Build the application
WORKDIR /app/apps/api
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### Web Dockerfile

```dockerfile
# apps/web/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/web ./apps/web

# Build the application
WORKDIR /app/apps/web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
```

### 4. Kubernetes Deployment

#### API Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vm-search-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vm-search-api
  template:
    metadata:
      labels:
        app: vm-search-api
    spec:
      containers:
      - name: api
        image: your-registry/vm-search-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: TYPESENSE_HOST
          value: "typesense-service"
        - name: TYPESENSE_PORT
          value: "8108"
        - name: TYPESENSE_API_KEY
          valueFrom:
            secretKeyRef:
              name: typesense-secret
              key: api-key

---
apiVersion: v1
kind: Service
metadata:
  name: vm-search-api-service
spec:
  selector:
    app: vm-search-api
  ports:
  - port: 3001
    targetPort: 3001
```

#### Frontend Deployment

```yaml
# k8s/web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vm-search-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vm-search-web
  template:
    metadata:
      labels:
        app: vm-search-web
    spec:
      containers:
      - name: web
        image: your-registry/vm-search-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.yourdomain.com"

---
apiVersion: v1
kind: Service
metadata:
  name: vm-search-web-service
spec:
  selector:
    app: vm-search-web
  ports:
  - port: 3000
    targetPort: 3000
```

### 5. Vercel + Railway/Heroku

#### Frontend on Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
   ```

#### Backend on Railway

1. Create a new Railway project
2. Connect your GitHub repository
3. Set root directory to `apps/api`
4. Set environment variables:
   ```
   NODE_ENV=production
   TYPESENSE_HOST=your-typesense-instance
   TYPESENSE_PORT=8108
   TYPESENSE_PROTOCOL=https
   TYPESENSE_API_KEY=your-api-key
   ```

## Data Management

### Initial Setup

After deployment, you need to set up your Typesense collections and data:

```bash
# Create collections
npm run create-vm-search-collection --workspace=api

# Import data
npm run import-jsonl --workspace=api path/to/your/data.jsonl
```

### Backup and Restore

```bash
# Export data for backup
curl "https://your-api-domain.com/api/search/vm-search?q=*&per_page=1000" > backup.json

# For Typesense backup, use Typesense cluster snapshots
```

## Monitoring and Logging

### Health Checks

The API provides health check endpoints:

- `GET /health` - Basic health check
- `GET /api/typesense/health` - Typesense connection status

### Logging

Configure structured logging in production:

```javascript
// apps/api/src/config/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## Security Considerations

1. **CORS Configuration**: Configure CORS properly for production
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **HTTPS**: Always use HTTPS in production
4. **Environment Variables**: Never commit sensitive data to version control
5. **API Key Security**: Use strong API keys and rotate them regularly

## Performance Optimization

1. **CDN**: Use a CDN for static assets
2. **Caching**: Implement Redis for API response caching
3. **Load Balancing**: Use load balancers for high availability
4. **Database Optimization**: Optimize Typesense indices for your search patterns

## Troubleshooting

### Common Issues

1. **API URL not found**: Check `NEXT_PUBLIC_API_URL` environment variable
2. **CORS errors**: Configure CORS settings in the API
3. **Search not working**: Verify Typesense connection and data import
4. **Slow searches**: Optimize Typesense indices and consider caching

### Debug Information

Access debug information in development:

```javascript
import { getEnvironmentInfo } from '@/lib/api';
console.log(getEnvironmentInfo());
```

## Scaling Considerations

- **Horizontal Scaling**: Both frontend and API can be scaled horizontally
- **Database Scaling**: Typesense supports clustering for high availability
- **CDN**: Use CDN for static assets and API response caching
- **Monitoring**: Implement comprehensive monitoring and alerting