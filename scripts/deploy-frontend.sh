#!/bin/bash

# Script para hacer build y deploy del frontend a CloudFront
# Uso: ./scripts/deploy-frontend.sh

set -e

echo "🚀 Iniciando deployment del frontend..."

# 1. Build del frontend
echo "📦 Construyendo frontend..."
cd frontend
npm run build
cd ..

# 2. Obtener información del stack
echo "📋 Obteniendo información del stack..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name CxumStack \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text \
  --region us-east-2)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name CxumStack \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text \
  --region us-east-2)

echo "   Bucket: $BUCKET_NAME"
echo "   Distribution: $DISTRIBUTION_ID"

# 3. Subir archivos a S3
echo "☁️  Subiendo archivos a S3..."
aws s3 sync frontend/dist/ s3://$BUCKET_NAME/ \
  --delete \
  --region us-east-2 \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.map"

# index.html sin cache para que siempre se obtenga la última versión
aws s3 cp frontend/dist/index.html s3://$BUCKET_NAME/index.html \
  --region us-east-2 \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# 4. Invalidar cache de CloudFront
echo "🔄 Invalidando cache de CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --region us-east-2

echo "✅ Deployment completado!"
echo ""
echo "🌐 URL del frontend:"
aws cloudformation describe-stacks \
  --stack-name CxumStack \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontUrl'].OutputValue" \
  --output text \
  --region us-east-2
