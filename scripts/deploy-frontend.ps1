# Script para hacer build y deploy del frontend a CloudFront (PowerShell)
# Uso: .\scripts\deploy-frontend.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando deployment del frontend..." -ForegroundColor Cyan

# 1. Build del frontend
Write-Host "📦 Construyendo frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# 2. Obtener información del stack
Write-Host "📋 Obteniendo información del stack..." -ForegroundColor Yellow
$BUCKET_NAME = aws cloudformation describe-stacks `
  --stack-name CxumStack `
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" `
  --output text `
  --region us-east-2

$DISTRIBUTION_ID = aws cloudformation describe-stacks `
  --stack-name CxumStack `
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" `
  --output text `
  --region us-east-2

Write-Host "   Bucket: $BUCKET_NAME" -ForegroundColor Gray
Write-Host "   Distribution: $DISTRIBUTION_ID" -ForegroundColor Gray

# 3. Subir archivos a S3
Write-Host "☁️  Subiendo archivos a S3..." -ForegroundColor Yellow
aws s3 sync frontend/dist/ s3://$BUCKET_NAME/ `
  --delete `
  --region us-east-2 `
  --cache-control "public, max-age=31536000, immutable" `
  --exclude "index.html" `
  --exclude "*.map"

# index.html sin cache para que siempre se obtenga la última versión
aws s3 cp frontend/dist/index.html s3://$BUCKET_NAME/index.html `
  --region us-east-2 `
  --cache-control "public, max-age=0, must-revalidate" `
  --content-type "text/html"

# 4. Invalidar cache de CloudFront
Write-Host "🔄 Invalidando cache de CloudFront..." -ForegroundColor Yellow
aws cloudfront create-invalidation `
  --distribution-id $DISTRIBUTION_ID `
  --paths "/*" `
  --region us-east-2

Write-Host "✅ Deployment completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URL del frontend:" -ForegroundColor Cyan
aws cloudformation describe-stacks `
  --stack-name CxumStack `
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontUrl'].OutputValue" `
  --output text `
  --region us-east-2
