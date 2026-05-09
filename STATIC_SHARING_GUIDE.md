# Static Sharing Approaches for Next.js Logistics App

## Method 1: Next.js Static Export (Recommended)

### 1. Configure Next.js for Static Export

Update `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
```

### 2. Build Static Version
```bash
# Clean previous build
rm -rf .next out

# Build static export
npm run build

# The static files will be in the 'out' directory
```

### 3. Deploy to Static Hosting

#### Netlify (Easiest)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=out
```

#### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages
```bash
# Build and deploy to gh-pages branch
npm run build
git add out/
git commit -m "Add static build"
git subtree push --prefix out origin gh-pages
```

## Method 2: Docker Containerization

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Build and Share Docker Image
```bash
# Build Docker image
docker build -t logistics-app .

# Run locally
docker run -p 3000:3000 logistics-app

# Push to Docker Hub
docker tag logistics-app username/logistics-app:latest
docker push username/logistics-app:latest
```

## Method 3: Cloud Platform Deployment

### AWS S3 + CloudFront
```bash
# Install AWS CLI
npm install -g aws-cli

# Upload to S3
aws s3 sync out/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Google Cloud Storage
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Upload to GCS
gsutil -m rsync -r out/ gs://your-bucket-name
```

### Azure Static Web Apps
```bash
# Install Azure CLI
npm install -g azure-cli

# Deploy
az webapp up --resource-group myResourceGroup --name logistics-app
```

## Method 4: Self-Hosted Static Server

### 1. Simple HTTP Server
```bash
# Install serve globally
npm install -g serve

# Serve static files
serve -s out -l 3000
```

### 2. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/out;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location /_next/static/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

## Method 5: Progressive Web App (PWA)

### 1. Add PWA Configuration
```bash
# Install PWA dependencies
npm install next-pwa

# Update next.config.mjs
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true
})

module.exports = withPWA({
  // Your existing config
})
```

### 2. Build PWA
```bash
npm run build
# The PWA will be in the 'out' directory
```

## Quick Share Commands

### For Immediate Sharing:
```bash
# 1. Build static version
npm run build

# 2. Serve locally for testing
npx serve out -p 3000

# 3. Create ZIP for sharing
cd out && zip -r ../logistics-static.zip . && cd ..

# 4. Share the ZIP file via email, cloud storage, etc.
```

### Using ngrok for Temporary Sharing:
```bash
# Install ngrok
npm install -g ngrok

# Serve and create tunnel
npx serve out -p 3000 &
ngrok http 3000
# Share the ngrok URL provided
```

## File Structure After Static Export
```
out/
├── _next/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── media/
│   └── ...
├── app/
│   ├── dashboard/
│   ├── login/
│   └── ...
├── favicon.ico
├── icon.svg
├── manifest.json (if PWA)
└── index.html
```

## Environment Variables for Static Build

### Create `.env.production.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Update API Calls for Static:
```javascript
// In your services, use absolute URLs
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses`);
```

## Deployment Checklist

### Pre-Deployment:
- [ ] Configure `next.config.mjs` for static export
- [ ] Update all API calls to use absolute URLs
- [ ] Set up environment variables
- [ ] Test build locally: `npm run build && npx serve out`

### Post-Deployment:
- [ ] Upload `out/` folder contents
- [ ] Configure custom domain (if needed)
- [ ] Set up SSL certificate
- [ ] Test all functionality
- [ ] Monitor performance

## Recommended Approach

### For Quick Sharing: **Netlify**
- Drag and drop `out/` folder
- Automatic HTTPS
- Custom domain support
- Free tier available

### For Production: **Vercel**
- Optimized for Next.js
- Automatic deployments
- Edge functions support
- Built-in analytics

### For Enterprise: **AWS S3 + CloudFront**
- Scalable storage
- CDN distribution
- Cost-effective at scale
- Full control over infrastructure

## Troubleshooting

### Common Static Export Issues:
1. **API Routes**: Not available in static export
2. **Dynamic Routes**: Need `generateStaticParams()`
3. **Image Optimization**: Set `unoptimized: true`
4. **Environment Variables**: Must be `NEXT_PUBLIC_` prefixed

### Solutions:
```javascript
// For dynamic routes in static export
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

// For API routes, use external API
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

This guide provides multiple approaches for sharing your logistics application as a static website. Choose the method that best fits your deployment needs and technical requirements.
