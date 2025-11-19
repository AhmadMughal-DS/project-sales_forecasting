# 🚀 Azure Deployment Guide

Complete guide to deploy the Sales Forecasting System to Azure using Container Registry and Container Apps.

## 📋 Prerequisites

1. **Azure Account** with active subscription
2. **Azure CLI** installed locally
3. **Azure Container Registry** created
4. **GitHub Repository** with the code

## 🔧 Setup Steps

### 1. Create Azure Container Registry

```bash
# Login to Azure
az login

# Create resource group
az group create --name sales-forecasting-rg --location eastus

# Create Azure Container Registry
az acr create \
  --resource-group sales-forecasting-rg \
  --name yourregistry \
  --sku Basic
```

### 2. Configure GitHub Secrets

Create a Service Principal for GitHub Actions:

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "github-actions-sales-forecasting" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/sales-forecasting-rg \
  --sdk-auth
```

Copy the JSON output and add to GitHub:
- Go to your repository → **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**
- Name: `AZURE_CREDENTIALS`
- Value: Paste the JSON output

### 3. Update Pipeline Configuration

Edit `.github/workflows/ci-cd.yml`:

```yaml
# Replace 'yourregistry' with your actual ACR name
ACR_NAME=yourregistry  # Change this!
```

### 4. Push to GitHub

```bash
git add .
git commit -m "Add Azure deployment pipeline"
git push origin staging  # or main
```

The pipeline will automatically:
✅ Run tests
✅ Build Docker image
✅ Push to Azure Container Registry

## 🌐 Deploy to Azure Container Apps

### Create Container App

```bash
# Create Container Apps environment
az containerapp env create \
  --name sales-forecasting-env \
  --resource-group sales-forecasting-rg \
  --location eastus

# Enable admin on ACR (for pulling images)
az acr update --name yourregistry --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name yourregistry --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name yourregistry --query passwords[0].value -o tsv)

# Create Container App
az containerapp create \
  --name regression-ml-api \
  --resource-group sales-forecasting-rg \
  --environment sales-forecasting-env \
  --image yourregistry.azurecr.io/regression-ml-api:main \
  --target-port 8000 \
  --ingress external \
  --registry-server yourregistry.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 1 \
  --max-replicas 3
```

### Get Application URL

```bash
az containerapp show \
  --name regression-ml-api \
  --resource-group sales-forecasting-rg \
  --query properties.configuration.ingress.fqdn \
  -o tsv
```

Visit: `https://<your-app-url>/app`

## 🔄 Continuous Deployment

### Auto-Deploy on Push (Optional)

Uncomment the deployment section in `.github/workflows/ci-cd.yml`:

```yaml
- name: Deploy to Azure Container Apps
  run: |
    az containerapp update \
      --name regression-ml-api \
      --resource-group sales-forecasting-rg \
      --image $ACR_NAME.azurecr.io/regression-ml-api:$IMAGE_TAG
```

Now every push to `main` branch will automatically deploy!

## 📊 Pipeline Overview

```
┌─────────────┐
│  Push Code  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Run Tests  │  ← Linting, Unit Tests
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Build Image │  ← Docker build
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Push to    │  ← Azure Container Registry
│     ACR     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Deploy    │  ← Azure Container Apps
└─────────────┘
```

## 🔍 Monitoring & Logs

### View Logs
```bash
az containerapp logs show \
  --name regression-ml-api \
  --resource-group sales-forecasting-rg \
  --follow
```

### Check Status
```bash
az containerapp show \
  --name regression-ml-api \
  --resource-group sales-forecasting-rg \
  --query properties.runningStatus
```

### Scale Application
```bash
az containerapp update \
  --name regression-ml-api \
  --resource-group sales-forecasting-rg \
  --min-replicas 2 \
  --max-replicas 5
```

## 💰 Cost Optimization

**Azure Container Apps Pricing:**
- Pay only for vCPU and memory used
- Free allowance: 180,000 vCPU-seconds and 360,000 GiB-seconds per month

**ACR Pricing:**
- Basic tier: ~$5/month
- Includes 10 GB storage

**Estimated Monthly Cost:** $5-15 for small applications

## 🔐 Security Best Practices

1. **Use Managed Identity** (instead of admin credentials):
```bash
az containerapp update \
  --name regression-ml-api \
  --resource-group sales-forecasting-rg \
  --registry-server yourregistry.azurecr.io \
  --registry-identity system
```

2. **Enable HTTPS Only**
3. **Use Key Vault for secrets**
4. **Restrict ACR access**

## 🛠️ Troubleshooting

### Image Pull Failed
```bash
# Check ACR credentials
az acr credential show --name yourregistry

# Test ACR login
docker login yourregistry.azurecr.io
```

### Container App Not Starting
```bash
# View logs
az containerapp logs show \
  --name regression-ml-api \
  --resource-group sales-forecasting-rg \
  --tail 50
```

### Pipeline Failing
- Check `AZURE_CREDENTIALS` secret in GitHub
- Verify ACR name in workflow file
- Ensure service principal has contributor access

## 📝 Manual Deployment (Without Pipeline)

```bash
# Build locally
docker build -t regression-ml-api:local .

# Login to ACR
az acr login --name yourregistry

# Tag and push
docker tag regression-ml-api:local yourregistry.azurecr.io/regression-ml-api:manual
docker push yourregistry.azurecr.io/regression-ml-api:manual

# Update container app
az containerapp update \
  --name regression-ml-api \
  --resource-group sales-forecasting-rg \
  --image yourregistry.azurecr.io/regression-ml-api:manual
```

## 🎯 Production Checklist

- [ ] ACR created with appropriate tier
- [ ] Service Principal configured
- [ ] GitHub secrets added
- [ ] Container App created
- [ ] Custom domain configured (optional)
- [ ] SSL certificate added
- [ ] Monitoring enabled
- [ ] Auto-scaling configured
- [ ] Backup strategy defined
- [ ] Cost alerts set up

## 📞 Support

For Azure-specific issues:
- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure Container Registry Documentation](https://learn.microsoft.com/azure/container-registry/)

---

**Next Steps:** Uncomment the deployment step in the pipeline for full CI/CD automation!
