# 🚀 Azure VM Deployment Setup Guide

Complete guide to deploy Sales Forecasting System to Azure VM using GitHub Actions.

## 📋 Prerequisites

1. **Azure VM** (Linux Ubuntu/Debian)
2. **Docker & Docker Compose** installed on VM
3. **SSH Access** to VM
4. **GitHub Repository**

## 🔧 Step 1: Setup Azure VM

### Create Ubuntu VM on Azure

```bash
# Login to Azure
az login

# Create resource group
az group create --name sales-forecasting-rg --location eastus

# Create VM
az vm create \
  --resource-group sales-forecasting-rg \
  --name sales-forecasting-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Open port 8000 for application
az vm open-port \
  --resource-group sales-forecasting-rg \
  --name sales-forecasting-vm \
  --port 8000 \
  --priority 1001

# Get VM public IP
az vm show \
  --resource-group sales-forecasting-rg \
  --name sales-forecasting-vm \
  --show-details \
  --query publicIps \
  -o tsv
```

## 🐳 Step 2: Install Docker on VM

SSH into your VM and run:

```bash
# SSH to VM
ssh azureuser@<VM_PUBLIC_IP>

# Update packages
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes
exit
```

## 🔐 Step 3: Setup SSH Key for GitHub Actions

### Generate SSH Key (on your local machine)

```bash
# Generate new SSH key for GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github-actions -N ""

# This creates:
# - Private key: ~/.ssh/github-actions
# - Public key: ~/.ssh/github-actions.pub
```

### Add Public Key to VM

```bash
# Copy public key content
cat ~/.ssh/github-actions.pub

# SSH to VM
ssh azureuser@<VM_PUBLIC_IP>

# Add public key to authorized_keys
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
exit
```

### Test SSH Connection

```bash
# Test with private key
ssh -i ~/.ssh/github-actions azureuser@<VM_PUBLIC_IP>
```

## 🔑 Step 4: Configure GitHub Secrets

Go to GitHub Repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

### Required Secrets:

1. **VM_HOST**
   - Value: Your VM's public IP address
   - Example: `20.123.45.67`

2. **VM_USERNAME**
   - Value: VM username
   - Example: `azureuser`

3. **VM_SSH_KEY**
   - Value: Contents of private key file
   - Get it: `cat ~/.ssh/github-actions`
   - Copy entire content including:
     ```
     -----BEGIN OPENSSH PRIVATE KEY-----
     ...
     -----END OPENSSH PRIVATE KEY-----
     ```

4. **VM_PORT** (Optional)
   - Value: `22` (default SSH port)
   - Only add if using custom port

## 📁 Step 5: Setup Project Directory on VM

SSH to VM and prepare directory:

```bash
ssh azureuser@<VM_PUBLIC_IP>

# Create project directory
mkdir -p ~/sales-forecasting
cd ~/sales-forecasting

# Clone repository (first time)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Or initialize git
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

exit
```

## 🚀 Step 6: Test Deployment

### Push to GitHub

```bash
# Commit and push
git add .
git commit -m "Setup VM deployment"
git push origin main
```

### Monitor Deployment

1. Go to GitHub repository
2. Click **Actions** tab
3. Watch the deployment workflow
4. Check logs for any errors

### Verify on VM

```bash
# SSH to VM
ssh azureuser@<VM_PUBLIC_IP>

# Check containers
cd ~/sales-forecasting
docker-compose ps

# View logs
docker-compose logs -f

# Test application
curl http://localhost:8000/app
```

### Access Application

Open browser: `http://<VM_PUBLIC_IP>:8000/app`

## 🔄 Deployment Flow

```
┌─────────────────┐
│  Push to GitHub │
│  (main/staging) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   Triggered     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SSH to VM      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Git Pull       │
│  Latest Code    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ docker-compose  │
│     down        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ docker-compose  │
│ up -d --build   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   App Running   │
│  on VM :8000    │
└─────────────────┘
```

## 🛠️ Troubleshooting

### SSH Connection Failed

```bash
# Check if VM is running
az vm show -d \
  --resource-group sales-forecasting-rg \
  --name sales-forecasting-vm \
  --query powerState

# Check SSH key permissions
chmod 600 ~/.ssh/github-actions

# Test manual SSH
ssh -i ~/.ssh/github-actions azureuser@<VM_IP> -v
```

### Docker Permission Denied

```bash
# SSH to VM
ssh azureuser@<VM_PUBLIC_IP>

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login
exit
ssh azureuser@<VM_PUBLIC_IP>

# Test docker
docker ps
```

### Port 8000 Not Accessible

```bash
# Check if port is open on Azure
az vm open-port \
  --resource-group sales-forecasting-rg \
  --name sales-forecasting-vm \
  --port 8000 \
  --priority 1001

# Check container status
docker-compose ps

# Check application logs
docker-compose logs
```

### Git Pull Fails

```bash
# SSH to VM and setup git credentials
ssh azureuser@<VM_PUBLIC_IP>
cd ~/sales-forecasting

# For public repo (no auth needed)
git remote set-url origin https://github.com/USERNAME/REPO.git

# For private repo (use personal access token)
git remote set-url origin https://TOKEN@github.com/USERNAME/REPO.git
```

## 🔐 Security Best Practices

1. **Use Strong SSH Keys**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions"
   ```

2. **Restrict SSH Access**
   ```bash
   # Edit SSH config on VM
   sudo nano /etc/ssh/sshd_config
   
   # Add these lines:
   PermitRootLogin no
   PasswordAuthentication no
   
   # Restart SSH
   sudo systemctl restart ssh
   ```

3. **Setup Firewall**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 8000/tcp
   sudo ufw enable
   ```

4. **Use Azure NSG Rules**
   - Restrict SSH (port 22) to specific IPs
   - Allow port 8000 from anywhere for application

## 📊 Monitoring

### View Application Logs

```bash
# SSH to VM
ssh azureuser@<VM_PUBLIC_IP>

# View logs
cd ~/sales-forecasting
docker-compose logs -f regression-api

# Check container stats
docker stats
```

### Setup Log Rotation

```bash
# Edit docker-compose.yml to add logging
nano docker-compose.yml

# Add under service:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 💰 Cost Estimation

**Azure VM (Standard_B2s):**
- 2 vCPU, 4 GB RAM
- Cost: ~$30-40/month
- Suitable for small to medium applications

**Alternative Sizes:**
- Standard_B1s: ~$10/month (1 vCPU, 1 GB)
- Standard_B2ms: ~$60/month (2 vCPU, 8 GB)

## 🎯 Production Checklist

- [ ] VM created and running
- [ ] Docker & Docker Compose installed
- [ ] SSH key generated and added
- [ ] GitHub secrets configured
- [ ] Port 8000 opened
- [ ] Test deployment successful
- [ ] Application accessible via browser
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] SSL/HTTPS setup (optional)

## 🌐 Setup Custom Domain (Optional)

```bash
# Point domain to VM IP
# A Record: sales-forecasting.yourdomain.com → <VM_PUBLIC_IP>

# Install Nginx reverse proxy
sudo apt-get install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/sales-forecasting

# Add SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d sales-forecasting.yourdomain.com
```

## 📞 Next Steps

1. ✅ Push code to GitHub
2. ✅ GitHub Actions will automatically deploy
3. ✅ Access app at `http://<VM_IP>:8000/app`
4. 🔄 Every push to `main` or `staging` branch will auto-deploy!

---

**Ready to deploy!** Push your code and watch the magic happen! 🚀
