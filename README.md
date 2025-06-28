# SKU Management Application

A comprehensive pharmaceutical SKU (Stock Keeping Unit) management system built with Angular and FastAPI, designed for efficient inventory management and duplicate detection.

## Project Overview

This enterprise-grade application provides a complete solution for managing pharmaceutical SKUs, featuring:

This application provides a robust solution for managing pharmaceutical SKUs, with advanced features including:

- Intelligent SKU Management (CRUD operations)
- Advanced duplicate detection by name/NDC
- OCR-based data extraction from product images
- Interactive chatbot interface for natural language interactions
- Real-time change notifications and audit trail
- Status management workflow with approvals
- Comprehensive data validation and verification
- Modern, responsive UI with Angular Material
- RESTful API with FastAPI backend

## Repository Structure

- `/backend` - FastAPI backend
- `/sku-app` - Angular frontend
- Various utility scripts and testing tools

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Angular CLI
- SQLite

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend API will be available at http://localhost:8000

### Frontend Setup

```bash
cd sku-app
npm install
ng serve
```

The frontend application will be available at http://localhost:4200

## Command Line Tools

- `list_all_skus.py` - List all SKUs in the database
  - Usage: `./list_all_skus.py [--status STATUS] [--format {table,json}]`
  - Example: `./list_all_skus.py --status Active --format json`

## System Architecture

### Components
- **Frontend**: Angular 20 with Material UI (Port 4200)
- **Backend**: FastAPI with SQLite (Port 5000)
- **Database**: SQLite with migration support
- **Features**: OCR processing, duplicate detection, chatbot interface

### Technical Stack
- Node.js (v18 or higher)
- Python 3.12
- SQLite
- Angular Material UI
- FastAPI
- Tesseract OCR

## Cloud Deployment Guide

### Azure Deployment

1. **Prerequisites**:
   ```bash
   # Install Azure CLI
   brew install azure-cli  # MacOS
   # or visit https://docs.microsoft.com/cli/azure/install-azure-cli
   
   # Login to Azure
   az login
   ```

2. **Backend Deployment (Azure App Service)**:
   ```bash
   # Create resource group
   az group create --name skuapp-rg --location eastus

   # Create App Service plan
   az appservice plan create --name skuapp-plan --resource-group skuapp-rg --sku B1

   # Create Web App for backend
   az webapp create --name skuapp-backend --resource-group skuapp-rg --plan skuapp-plan --runtime "PYTHON|3.12"

   # Configure backend settings
   az webapp config appsettings set --name skuapp-backend --resource-group skuapp-rg --settings \
     WEBSITES_PORT=5000 \
     SCM_DO_BUILD_DURING_DEPLOYMENT=true \
     DATABASE_URL="sqlite:///./skuapp.db"
   ```

3. **Frontend Deployment (Azure Static Web Apps)**:
   ```bash
   # Build Angular app
   cd sku-app
   ng build --configuration production

   # Deploy using Azure Static Web Apps
   az staticwebapp create --name skuapp-frontend \
     --resource-group skuapp-rg \
     --location eastus \
     --source . \
     --branch main \
     --app-location "/dist/sku-app" \
     --api-location "" \
     --output-location ""
   ```

### AWS Deployment

1. **Prerequisites**:
   ```bash
   # Install AWS CLI
   brew install awscli  # MacOS
   # or visit https://aws.amazon.com/cli/
   
   # Configure AWS credentials
   aws configure
   ```

2. **Backend Deployment (Elastic Beanstalk)**:
   ```bash
   # Install EB CLI
   pip install awsebcli

   # Initialize EB application
   eb init skuapp-backend --platform python-3.12
   
   # Create and deploy environment
   eb create skuapp-backend-env
   ```

3. **Frontend Deployment (S3 + CloudFront)**:
   ```bash
   # Build Angular app
   cd sku-app
   ng build --configuration production

   # Create and configure S3 bucket
   aws s3 mb s3://skuapp-frontend
   aws s3 website s3://skuapp-frontend --index-document index.html --error-document index.html
   
   # Upload build files
   aws s3 sync dist/sku-app s3://skuapp-frontend
   ```

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL=sqlite:///./skuapp.db
JWT_SECRET=your-secure-secret-key
CORS_ORIGINS=http://localhost:4200,https://your-production-frontend.com
ENVIRONMENT=production
ALLOWED_HOSTS=*
```

### Frontend (environment.prod.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.com',
  useEmulators: false
};
```

## Security Considerations

1. **API Security**:
   - JWT authentication implementation
   - Rate limiting configuration
   - Input validation
   - CORS settings

2. **Database Security**:
   - Regular backups
   - Connection pooling
   - Data encryption

3. **Cloud Security**:
   - Managed identities
   - Network security groups
   - HTTPS enforcement
   - WAF implementation
````
