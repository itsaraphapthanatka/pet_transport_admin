# PetGo Admin - Deployment Guide

## Quick Start

This application has been converted from static export to standalone mode to fix the infinite login redirect loop.

### What Changed?

- **Before**: Static HTML files served by nginx
- **After**: Next.js server running on port 3001, proxied by nginx

### Deploy to Production

1. **Update environment variables** in `.env.production`
2. **Run deployment script**: `./deploy.sh`
3. **Update nginx config**: Copy `nginx-config-standalone.conf` to `/etc/nginx/sites-available/admin.petgo.asia`
4. **Restart nginx**: `sudo systemctl reload nginx`

For detailed instructions, see the [full deployment guide](file:///Users/admin/.gemini/antigravity/brain/ab74835c-7f93-4439-b8ab-49b6c1c9ba47/DEPLOYMENT_GUIDE.md).

## Files Overview

- `next.config.ts` - Changed to standalone mode
- `.env.production` - Production environment variables (update API URL!)
- `ecosystem.config.js` - PM2 configuration
- `nginx-config-standalone.conf` - Nginx proxy configuration
- `deploy.sh` - Automated deployment script

## Local Testing

```bash
# Build
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

## Production Requirements

- Node.js 18+ 
- PM2 process manager
- Nginx web server
