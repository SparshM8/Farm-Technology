# 🚀 Production Deployment Guide

This guide covers deploying Farming Tech Shop to production environments.

## Pre-Deployment Checklist

- [ ] Set strong `JWT_SECRET` in `.env`
- [ ] Configure SMTP for email notifications
- [ ] Run tests and verify all features
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Update database with real data
- [ ] Test with production environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (TLS/SSL certificates)
- [ ] Configure CORS for production domain
- [ ] Set up monitoring & logging
- [ ] Create database backups

## Environment Setup

### Production .env Example

```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Security - Generate with: openssl rand -base64 32
JWT_SECRET=GENERATE_SECURE_KEY_HERE

# Email Configuration (Recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-noreply@domain.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Admin Credentials (Change immediately)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change-this-immediately

# Optional: Payment Gateway (Razorpay for India)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## Deployment Options

### 1. Docker (Recommended)

#### Using Docker Compose
```bash
# Clone repository
git clone <repo-url>
cd FarmingTechShop

# Create .env file
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app
```

#### Using Docker directly
```bash
docker build -t farming-tech-shop:latest .
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_USER=your-email \
  -e SMTP_PASS=your-password \
  --name farming-tech-shop \
  farming-tech-shop:latest
```

### 2. Heroku

```bash
# Prerequisites: Heroku CLI installed

# Create Heroku app
heroku create farming-tech-shop-yourname

# Set environment variables
heroku config:set \
  NODE_ENV=production \
  JWT_SECRET=$(openssl rand -base64 32) \
  SMTP_HOST=smtp.gmail.com \
  SMTP_USER=your-email \
  SMTP_PASS=your-password

# Create Procfile in root:
# web: cd backend && node server.js

# Deploy
git push heroku main

# View logs
heroku logs -t
```

### 3. AWS (EC2 + RDS)

#### EC2 Instance Setup
```bash
# Connect to EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Update system
sudo yum update -y
sudo yum install nodejs npm -y

# Clone repository
git clone <repo-url>
cd FarmingTechShop

# Install dependencies
cd backend && npm install --production && cd ..
cd frontend && npm install && npm run build && cd ..

# Create systemd service
sudo nano /etc/systemd/system/farming-tech.service
```

Service file content:
```ini
[Unit]
Description=Farming Tech Shop
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/FarmingTechShop/backend
ExecStart=/usr/bin/node server.js
Restart=always
Environment="NODE_ENV=production"
Environment="JWT_SECRET=your-secret"
Environment="SMTP_HOST=smtp.gmail.com"
Environment="SMTP_USER=your-email"
Environment="SMTP_PASS=your-password"

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start farming-tech
sudo systemctl enable farming-tech
sudo systemctl status farming-tech
```

### 4. DigitalOcean

#### Using App Platform (Recommended)
1. Push code to GitHub
2. Connect GitHub to DigitalOcean App Platform
3. Create new app
4. Set build command: `cd frontend && npm run build`
5. Set run command: `cd backend && npm start`
6. Add environment variables
7. Deploy

#### Using Droplet + Script
```bash
#!/bin/bash
# Create the script on your droplet

cd ~
git clone <repo-url>
cd FarmingTechShop

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
cd backend && npm install --production && cd ..
cd frontend && npm install && npm run build && cd ..

# Create systemd service (same as AWS above)
```

### 5. Vercel + Render

#### Frontend (Vercel)
1. Push `frontend/` folder to GitHub
2. Connect GitHub to Vercel
3. Set root directory to `frontend`
4. Set build command: `npm run build`
5. Deploy

#### Backend (Render)
1. Push `backend/` folder to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set environment variables
5. Set start command: `node server.js`
6. Deploy

Update frontend API calls to point to Render URL.

## Security Recommendations

### 1. Use HTTPS
```bash
# Using Let's Encrypt (free SSL)
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Configure Nginx/Apache to use certificate
```

### 2. Database Security
```bash
# Backup database
cp /path/to/farming_tech.db /backups/farming_tech.db.$(date +%Y%m%d)

# Secure permissions
chmod 600 /path/to/farming_tech.db
```

### 3. Environment Secrets
```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use secret management tools:
# - HashiCorp Vault
# - AWS Secrets Manager
# - 1Password Business
```

### 4. Rate Limiting
Already configured in `server.js`:
- 100 requests per 15 minutes per IP
- Adjust if needed in `server.js`

### 5. CORS Configuration
Update `server.js` CORS origins for production:
```javascript
const corsOptions = {
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true,
};
```

## Monitoring & Logging

### Use PM2 for Process Management
```bash
npm install -g pm2

# Start application
pm2 start backend/server.js --name "farming-tech"

# Monit logs
pm2 logs farming-tech

# Monitor dashboard
pm2 monit
```

### Application Monitoring
Recommended services:
- **Sentry** - Error tracking
- **LogRocket** - Session monitoring
- **New Relic** - Performance monitoring
- **DataDog** - Infrastructure monitoring

### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /path/to/farming_tech.db /backups/farming_tech_$DATE.db
gzip /backups/farming_tech_$DATE.db

# Upload to S3 for offsite backup
aws s3 cp /backups/farming_tech_$DATE.db.gz s3://your-bucket/backups/
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Verify indexes exist
SELECT name FROM sqlite_master WHERE type='index';

-- Add missing indexes for frequently queried columns
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_products_sku ON products(sku);
```

### 2. Caching Strategy
- Frontend: Browser caching (Vite optimizes this)
- Backend: Implement Redis for session caching
- CDN: Use CloudFront or CloudFlare for static assets

### 3. API Response Optimization
- Pagination for large datasets
- Compression with gzip enabled
- Lazy loading of images

## Troubleshooting

### Server Won't Start
```bash
# Check logs
journalctl -u farming-tech -n 50

# Verify port availability
lsof -i :3000
netstat -tulnp | grep 3000

# Check database
sqlite3 backend/farming_tech.db "SELECT COUNT(*) FROM products;"
```

### High Memory Usage
```bash
# Monitor with PM2
pm2 logs farming-tech --err

# Increase Node heap
node --max-old-space-size=2048 server.js
```

### Database Locked
```bash
# Check active connections
lsof | grep farming_tech.db

# Restart application
sudo systemctl restart farming-tech
```

## Scaling Strategy

### Horizontal Scaling
1. Use **Load Balancer** (Nginx, HAProxy, or AWS ELB)
2. Run multiple backend instances
3. Use **Redis** for shared sessions
4. Move to PostgreSQL for betterconcurrency

### Vertical Scaling
1. Increase server resources (RAM, CPU)
2. Optimize database queries
3. Implement caching layer

### Database Scaling
1. **SQLite → PostgreSQL** migration (for multi-user)
2. Read replicas for reporting
3. Database indexing optimization

## Backup & Recovery

### Weekly Backup
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
tar -czf farming_tech_backup_$DATE.tar.gz \
  backend/farming_tech.db \
  backend/.env

# Upload to cloud storage
aws s3 cp farming_tech_backup_$DATE.tar.gz s3://your-bucket/backups/
```

### Disaster Recovery
```bash
# Restore from backup
tar -xzf farming_tech_backup_YYYYMMDD.tar.gz
cp farming_tech.db backend/
docker-compose restart
```

## Success Metrics

Monitor these KPIs:
- Page load time < 2 seconds
- API response time < 500ms
- Server uptime > 99.9%
- Error rate < 0.1%
- Concurrent users supported

## Next Steps

1. Set up monitoring dashboard
2. Configure automated backups
3. Plan scaling strategy
4. Set up CI/CD pipeline
5. Document runbooks for operations team

---

For support: support@farmingtechshop.com
Last updated: February 2026
