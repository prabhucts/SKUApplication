# Azure DevOps Deployment Guide

This guide provides step-by-step instructions for setting up CI/CD in Azure DevOps for the SKU Management Application.

## Prerequisites

1. Azure DevOps account with permissions to:
   - Create and manage pipelines
   - Create service connections
   - Configure variable groups

2. Azure subscription with permissions to:
   - Create resource groups
   - Create and manage Azure Container Registry (ACR)
   - Create and manage App Services

## Setup Steps

### 1. Azure Resources Setup

Run these commands in Azure CLI or create resources through Azure Portal:

```bash
# Create Resource Group
az group create --name skuapp-rg --location eastus

# Create Azure Container Registry
az acr create --name skuappacr --resource-group skuapp-rg --sku Basic --admin-enabled true

# Get ACR credentials (you'll need these later)
az acr credential show --name skuappacr --resource-group skuapp-rg

# Create App Service Plan
az appservice plan create --name skuapp-plan --resource-group skuapp-rg --sku B1 --is-linux

# Create Web Apps for Frontend and Backend
az webapp create --name skuapp-backend --resource-group skuapp-rg --plan skuapp-plan --runtime "PYTHON|3.12"
az webapp create --name skuapp-frontend --resource-group skuapp-rg --plan skuapp-plan --runtime "NGINX|1.25"
```

### 2. Azure DevOps Pipeline Setup

1. **Create Service Connections**:
   - Go to Project Settings > Service Connections
   - Create new service connection of type "Azure Container Registry"
     - Name: `skuapp-acr`
     - Select your subscription and ACR
   - Create new service connection of type "Azure Resource Manager"
     - Name: `azure-subscription`
     - Select your subscription

2. **Configure Pipeline Variables**:
   - Go to Pipelines > Library
   - Create a variable group named "SKUApp-Variables"
   - Add these variables:
     ```
     dockerRegistryServiceConnection: skuapp-acr
     containerRegistry: skuappacr.azurecr.io
     backendServiceName: skuapp-backend
     frontendServiceName: skuapp-frontend
     azureSubscription: azure-subscription
     ```

3. **Import Pipeline**:
   - Go to Pipelines > New Pipeline
   - Select "Azure Repos Git" or your Git provider
   - Select your repository
   - Choose "Existing Azure Pipelines YAML file"
   - Select `/azure-pipelines.yml`

### 3. Application Configuration

1. **Backend Settings**:
   In Azure Portal, configure these App Settings for backend web app:
   ```
   WEBSITES_PORT: 5000
   DATABASE_URL: sqlite:///./skuapp.db
   CORS_ORIGINS: https://skuapp-frontend.azurewebsites.net
   ```

2. **Frontend Settings**:
   In Azure Portal, configure these App Settings for frontend web app:
   ```
   WEBSITES_PORT: 80
   API_URL: https://skuapp-backend.azurewebsites.net
   ```

## Verification

1. After pipeline runs successfully, verify these URLs:
   - Frontend: `https://skuapp-frontend.azurewebsites.net`
   - Backend: `https://skuapp-backend.azurewebsites.net`

2. Test these endpoints:
   - Health check: `https://skuapp-backend.azurewebsites.net/health`
   - API docs: `https://skuapp-backend.azurewebsites.net/docs`

## Troubleshooting

1. If containers fail to start:
   - Check container logs in App Service > Container settings
   - Verify environment variables are set correctly
   - Check if ports are correctly configured

2. If frontend can't connect to backend:
   - Verify CORS settings in backend
   - Check if API_URL is correctly set in frontend
   - Ensure both services are running

3. Common issues:
   - 503 errors: Check if the container is running and healthy
   - CORS errors: Verify CORS_ORIGINS in backend settings
   - Database errors: Check DATABASE_URL configuration

## Contact

For any issues with this deployment, please contact the development team.
