# Gmail Manager - Deployment Guide

## Prerequisites
- Docker and Docker Compose installed on your local machine
- Cloudflare account with a domain
- Google OAuth credentials
- OpenAI API key

## Step-by-Step Deployment

### 1. Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add your production domain to "Authorized redirect URIs":
   ```
   https://your-domain.com/api/auth/callback/google
   ```
4. Save changes

### 2. Set Up Cloudflare Tunnel

#### Create a Tunnel:

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access** → **Tunnels**
3. Click **Create a tunnel**
4. Name it: `gmail-manager-tunnel`
5. Click **Save tunnel**
6. **Copy the tunnel token** (you'll need this)

#### Configure the Tunnel:

1. In the tunnel configuration, go to **Public Hostname**
2. Click **Add a public hostname**
3. Configure:
   - **Subdomain**: `mail` (or whatever you prefer)
   - **Domain**: Select your domain from dropdown
   - **Service Type**: `HTTP`
   - **URL**: `gmail-manager:3000`
4. Click **Save hostname**

Your app will be accessible at: `https://mail.your-domain.com`

### 3. Configure Environment Variables

Copy and update your `.env.local` file:

```bash
cp .env.production .env.local
```

Edit `.env.local` with your values:

```env
NEXTAUTH_URL=https://mail.your-domain.com
NEXTAUTH_SECRET=<generate using: openssl rand -base64 32>
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
TUNNEL_TOKEN=your-cloudflare-tunnel-token
```

### 4. Build and Run with Docker

#### Build the Docker image:
```bash
docker-compose build
```

#### Start the services:
```bash
docker-compose up -d
```

#### Check logs:
```bash
docker-compose logs -f
```

#### Stop services:
```bash
docker-compose down
```

### 5. Access Your Application

1. Open your browser and go to: `https://mail.your-domain.com`
2. Sign in with Google OAuth
3. Initialize WhatsApp by scanning the QR code

### 6. WhatsApp Session Persistence

WhatsApp sessions are stored in Docker volumes:
- `whatsapp-sessions`: Authentication data
- `whatsapp-cache`: Cache data

After the first QR scan, the session will persist across container restarts.

## Maintenance Commands

### View logs:
```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f gmail-manager

# Just Cloudflare tunnel
docker-compose logs -f cloudflared
```

### Restart services:
```bash
docker-compose restart
```

### Update the app:
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Clear WhatsApp session (force re-scan):
```bash
docker-compose down
docker volume rm my-next-app_whatsapp-sessions
docker volume rm my-next-app_whatsapp-cache
docker-compose up -d
```

## Security Considerations

1. **Never commit `.env.local`** to git
2. **Use strong secrets** for NEXTAUTH_SECRET
3. **Enable Cloudflare WAF** for additional security
4. **Regularly update** Docker images:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## Troubleshooting

### Container won't start:
```bash
docker-compose logs gmail-manager
```

### WhatsApp not connecting:
1. Check if Chromium is installed in container
2. Check logs for Puppeteer errors
3. Try clearing volumes and re-scanning

### Cloudflare tunnel not working:
1. Verify tunnel token is correct
2. Check tunnel status in Cloudflare dashboard
3. Ensure service name matches: `gmail-manager:3000`

### OAuth errors:
1. Verify redirect URI in Google Console
2. Check NEXTAUTH_URL matches your domain
3. Ensure NEXTAUTH_SECRET is set

## Monitoring

### Check container status:
```bash
docker-compose ps
```

### Check resource usage:
```bash
docker stats
```

### Access container shell:
```bash
docker-compose exec gmail-manager sh
```

## Backup

### Backup WhatsApp sessions:
```bash
docker run --rm -v my-next-app_whatsapp-sessions:/data -v $(pwd):/backup alpine tar czf /backup/whatsapp-backup.tar.gz -C /data .
```

### Restore WhatsApp sessions:
```bash
docker run --rm -v my-next-app_whatsapp-sessions:/data -v $(pwd):/backup alpine tar xzf /backup/whatsapp-backup.tar.gz -C /data
```

## Production Recommendations

1. **Use SSL** (handled by Cloudflare)
2. **Set up monitoring** (Uptime Robot, etc.)
3. **Regular backups** of WhatsApp sessions
4. **Monitor Docker logs** for errors
5. **Keep dependencies updated**
6. **Use Cloudflare Access** for additional authentication layer
7. **Enable rate limiting** in Cloudflare

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check Cloudflare tunnel status
4. Ensure Docker has enough resources
