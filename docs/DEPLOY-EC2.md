# Deploy to EC2 (t2.medium) with Docker + Nginx

## GitHub secrets

In **Settings → Secrets and variables → Actions**, add:

| Secret        | Description |
|---------------|-------------|
| `EC2_HOST`    | EC2 hostname or IP (e.g. `ec2-xx-xx-xx-xx.compute.amazonaws.com`) |
| `EC2_SSH_KEY` | Private key for SSH (contents of your `.pem` or deploy key) |
| `EC2_USER`    | SSH user (e.g. `ubuntu` for Ubuntu AMI) |

Optional **variable** (Settings → Variables):

| Variable           | Description |
|--------------------|-------------|
| `EC2_DEPLOY_PATH`  | Path on EC2 where the app is deployed (default: `/home/ubuntu/josephia`) |

## EC2 setup (one-time)

1. **Install Docker & Docker Compose** (Ubuntu example):

   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin
   sudo usermod -aG docker $USER
   # Log out and back in so the group takes effect
   ```

2. **Create deploy directory** (must match `EC2_DEPLOY_PATH` or default):

   ```bash
   mkdir -p /home/ubuntu/josephia
   ```

3. **Create `.env` on EC2** (NextAuth, Supabase, etc.). The workflow does not sync `.env`:

   ```bash
   nano /home/ubuntu/josephia/.env
   ```

   Then in `docker-compose.yml` on the server, uncomment `env_file: .env`.

4. **Nginx** (if not already installed) — proxy to the app on port 3000:

   ```bash
   sudo apt install -y nginx
   ```

   Example site config (e.g. `/etc/nginx/sites-available/josephia`):

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
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

   Enable and reload:

   ```bash
   sudo ln -s /etc/nginx/sites-available/josephia /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

## Deploy

- **Automatic:** Push to `main` → workflow runs and deploys.
- **Manual:** Actions → “Deploy to EC2” → “Run workflow”.

Build runs on the EC2 instance (t2.medium); no container registry required.
