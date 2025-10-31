## Deployment Guide

This document explains how to deploy this Next.js App Router app on EC2 with PM2, plus notes for Amplify Hosting.

### 1) Prerequisites
- Node.js 20.x
- pnpm 10.x (corepack)
- PM2 (optional but recommended on EC2)
- A PostgreSQL database reachable from your server

### 2) Required environment variables
Create an `.env` file in the project root with at least:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&sslmode=require"
# or use DB_* vars and the app will build DATABASE_URL automatically:
# DB_USER=...
# DB_PASSWORD=...
# DB_HOST=...
# DB_PORT=5432
# DB_NAME=...

# NextAuth
NEXTAUTH_SECRET="<strong-random-string>"
NEXTAUTH_URL="https://your-domain.com" # for production

# Optional providers
OPENAI_API_KEY=""
TOGETHER_AI_API_KEY=""
UNSPLASH_ACCESS_KEY=""
TAVILY_API_KEY=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Tip to generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3) EC2 setup (one-time)
```bash
# Install Node 20, pnpm, pm2 (Ubuntu/Debian; adjust for your distro)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
corepack enable
corepack prepare pnpm@10.17.0 --activate
sudo npm i -g pm2
```

### 4) Deploy app code to EC2
```bash
git clone <your-repo-url> /var/www/presentation-ai
cd /var/www/presentation-ai
cp .env.example .env
# edit .env with real values
pnpm install --no-frozen-lockfile
pnpm build
```

### 5) Run with PM2 (recommended)
Simple start without an ecosystem file:
```bash
pm2 start "pnpm start" \
  --name presentation-ai \
  --cwd /var/www/presentation-ai \
  --env production
pm2 save
pm2 startup   # follow the printed command to enable autostart
```

Optional: ecosystem file for clearer config (`/var/www/presentation-ai/ecosystem.config.js`):
```js
module.exports = {
  apps: [
    {
      name: "presentation-ai",
      cwd: "/var/www/presentation-ai",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        NEXTAUTH_URL: "https://your-domain.com",
        NEXTAUTH_SECRET: "<your-secret>",
        DATABASE_URL: "postgresql://user:pass@host:5432/db?schema=public&sslmode=require",
        // Optional providers
        // OPENAI_API_KEY: "",
        // TOGETHER_AI_API_KEY: "",
        // UNSPLASH_ACCESS_KEY: "",
        // TAVILY_API_KEY: "",
        // GOOGLE_CLIENT_ID: "",
        // GOOGLE_CLIENT_SECRET: "",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
    },
  ],
};
```
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Useful PM2 commands:
```bash
pm2 logs presentation-ai --lines 200
pm2 status
pm2 restart presentation-ai
pm2 stop presentation-ai
```

### 6) Reverse proxy with Nginx (recommended)
```bash
sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/presentation-ai <<'CONF'
server {
  server_name your-domain.com;
  listen 80;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
CONF
sudo ln -sf /etc/nginx/sites-available/presentation-ai /etc/nginx/sites-enabled/presentation-ai
sudo nginx -t && sudo systemctl restart nginx
```

TLS (Let’s Encrypt):
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7) Local development commands
```bash
pnpm dev         # Dev server with hot reload
pnpm build       # Production build
pnpm start       # Start production build (PORT defaults to 3000)
```

### 8) Amplify Hosting notes (optional)
If using Amplify instead of EC2, the project includes `amplify.yml`. Ensure:
- Node 20 is used
- `pnpm run build` is executed
- Set environment variables in the Amplify console

If you encounter `Error: <Html> should not be imported outside of pages/_document` during build, avoid static prerender for 404 by ensuring the App Router is dynamic where needed. In this repo, top-level server components already export:

```ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

### 9) Troubleshooting
- Port not reachable: open ports 80/443 on the EC2 security group; keep 3000 internal.
- Memory errors on build: set `NODE_OPTIONS=--max_old_space_size=4096` when building.
- NextAuth callback issues: verify `NEXTAUTH_URL` matches your domain and HTTPS is enabled.
- Database errors: confirm `DATABASE_URL` or DB_* vars are correct and the DB allows connections from EC2.


