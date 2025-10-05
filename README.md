# VM Search

A powerful search application built with Next.js frontend and Express.js API backend, featuring Typesense integration for advanced search capabilities.

## 🚀 Features

- **Modern Stack**: Next.js 14, Express.js, TypeScript, Tailwind CSS
- **Advanced Search**: Powered by Typesense with highlighting and faceted search
- **Monorepo Structure**: Organized with Turborepo for efficient development

## 📁 Project Structure

```
vm-search/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Express.js API server
├── packages/         # Shared packages (future use)
├── data/            # Sample data files
└── docs/            # Documentation
```

## 🛠 Prerequisites

- Node.js 18+
- npm 9+
- Docker (for Typesense)
- Typesense server running on port 8108

## 🚀 Quick Start

### 1. Start Typesense Server

```bash
docker run -d \
  --name typesense \
  -p 8108:8108 \
  -e TYPESENSE_API_KEY=xyz \
  -e TYPESENSE_DATA_DIR=/data \
  -v typesense_data:/data \
  typesense/typesense:29.0 \
  --data-dir /data --api-key=xyz --enable-cors
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
# API configuration (apps/api/.env)
cp apps/api/.env.example apps/api/.env

# Frontend configuration (apps/web/.env.local)
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/web/.env.local
```

### 4. Initialize Typesense Collections

```bash
# Create the vm_search collection
npm run create-vm-search-collection --workspace=api

# Import sample data
npm run import-jsonl --workspace=api data/sample_vm_search.jsonl
```

### 5. Start Development Servers

```bash
# Start API server (Terminal 1)
npm run dev --workspace=api

# Start web app (Terminal 2)
npm run dev --workspace=web
```

## 🔧 Available Commands

### Root Level Commands

```bash
# Install dependencies for all apps
npm install

# Build all apps
npm run build

# Run linting across all apps
npm run lint

# Format code
npm run format
```

### API Commands (--workspace=api)

```bash
# Development server
npm run dev --workspace=api

# Build for production
npm run build --workspace=api

# Start production server
npm run start --workspace=api

# Collection management
npm run create-vm-search-collection --workspace=api

# Data import
npm run import-jsonl --workspace=api path/to/file.jsonl

# Search testing
npm run search-vm-search --workspace=api "keyword"
```

### Web Commands (--workspace=web)

```bash
# Development server
npm run dev --workspace=web

# Build for production
npm run build --workspace=web

# Start production server
npm run start --workspace=web
```

## 🌐 API Configuration

The frontend uses environment variables to determine the API URL:

### Development
```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production
```bash
# apps/web/.env.production.local
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Auto-Detection
If no `NEXT_PUBLIC_API_URL` is provided, the system will:
- Use `window.location` to build the API URL in the browser
- Fall back to `http://localhost:3001` on the server

## 📊 Data Management

### Collection Schema

The `vm_search` collection uses the following schema:

```javascript
{
  ID: 'int32',        // Unique identifier
  date: 'string',     // Date (facetable)
  slug: 'string',     // URL slug
  type: 'string',     // Content type
  title: 'string',    // Title (sortable)
  status: 'string',   // Publication status
  content: 'string'   // Main content
}
```

### Importing Data

Your JSONL file should contain one JSON object per line:

```json
{"ID": 1, "date": "2023-01-01", "slug": "example-slug", "type": "article", "title": "Example Title", "status": "published", "content": "Example content..."}
{"ID": 2, "date": "2023-01-02", "slug": "another-example", "type": "tutorial", "title": "Another Example", "status": "published", "content": "More content..."}
```


## 🚀 Deployment

### Environment Variables

Set these environment variables for production:

**API (.env)**
```bash
NODE_ENV=production
PORT=3001
TYPESENSE_HOST=your-typesense-host
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your-secure-api-key
```

**Frontend (.env.production.local)**
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

### Deployment Options

1. **Same Domain** (Recommended)
   - Deploy both apps behind a reverse proxy
   - Use relative URLs for API calls

2. **Separate Domains**
   - Deploy API and frontend separately
   - Configure CORS properly

3. **Docker**
   - Use provided Docker configurations
   - See `DEPLOYMENT.md` for detailed examples

4. **Vercel + Railway/Heroku**
   - Frontend on Vercel
   - API on Railway/Heroku
   - Configure environment variables

See `DEPLOYMENT.md` for detailed deployment instructions.


## 📝 API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- `GET /api/typesense/health` - Typesense status
- `GET /api/search/vm-search?q={query}` - Search vm_search collection
