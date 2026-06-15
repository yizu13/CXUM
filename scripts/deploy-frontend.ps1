# Script para hacer build y deploy del frontend a CloudFront (PowerShell)
# Uso: .\scripts\deploy-frontend.ps1
# Ejecutar desde la raiz del proyecto.

$ErrorActionPreference = "Stop"
$REGION = "us-east-2"
$STACK_NAME = "CxumStack"

Write-Host "[INICIO] Deployment del frontend..." -ForegroundColor Cyan

# --- 1. Build del frontend ---------------------------------------------------
Write-Host "[1/5] Construyendo frontend..." -ForegroundColor Yellow
Push-Location frontend
try {
    npm run build
} finally {
    Pop-Location
}

# --- 2. Obtener outputs del stack --------------------------------------------
Write-Host "[2/5] Obteniendo informacion del stack '$STACK_NAME'..." -ForegroundColor Yellow

function Get-StackOutput([string]$Key) {
    $value = aws cloudformation describe-stacks `
        --stack-name $STACK_NAME `
        --query "Stacks[0].Outputs[?OutputKey=='$Key'].OutputValue" `
        --output text `
        --region $REGION 2>&1
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($value) -or $value -eq "None") {
        throw "No se pudo obtener el output '$Key' del stack '$STACK_NAME'. Esta desplegado?"
    }
    return $value.Trim()
}

$BUCKET_NAME     = Get-StackOutput "FrontendBucketName"
$DISTRIBUTION_ID = Get-StackOutput "CloudFrontDistributionId"
$API_URL         = Get-StackOutput "ApiUrl"
$CF_URL          = Get-StackOutput "CloudFrontUrl"

Write-Host "   Bucket:       $BUCKET_NAME"     -ForegroundColor Gray
Write-Host "   Distribution: $DISTRIBUTION_ID" -ForegroundColor Gray
Write-Host "   API URL:      $API_URL"          -ForegroundColor Gray
Write-Host "   Frontend URL: $CF_URL"           -ForegroundColor Gray

# --- 3. Actualizar VITE_API_URL en frontend/.env si cambio ------------------
$envFile = "frontend/.env"
$envContent = Get-Content $envFile -Raw
$currentApiUrl = if ($envContent -match 'VITE_API_URL=(.+)') { $Matches[1].Trim() } else { "" }

if ($currentApiUrl -ne $API_URL) {
    Write-Host "[AVISO] VITE_API_URL cambio. Actualizando $envFile y reconstruyendo..." -ForegroundColor Yellow
    Write-Host "   Anterior: $currentApiUrl" -ForegroundColor DarkGray
    Write-Host "   Nueva:    $API_URL"        -ForegroundColor DarkGray
    $envContent = $envContent -replace 'VITE_API_URL=.+', "VITE_API_URL=$API_URL"
    Set-Content $envFile $envContent -NoNewline
    Push-Location frontend
    try {
        npm run build
    } finally {
        Pop-Location
    }
}

# --- 4. Subir archivos a S3 -------------------------------------------------
Write-Host "[3/5] Subiendo archivos a S3..." -ForegroundColor Yellow

# Assets con hash en el nombre (JS, CSS, imagenes) — cache de 1 anio
aws s3 sync frontend/dist/ s3://$BUCKET_NAME/ `
    --delete `
    --region $REGION `
    --cache-control "public, max-age=31536000, immutable" `
    --exclude "index.html" `
    --exclude "robots.txt" `
    --exclude "sitemap.xml" `
    --exclude "*.map"

if ($LASTEXITCODE -ne 0) { throw "Fallo el sync de assets a S3." }

# Archivos sin cache (siempre frescos)
$noCache = @("index.html", "robots.txt", "sitemap.xml")
foreach ($file in $noCache) {
    $localPath = "frontend/dist/$file"
    if (Test-Path $localPath) {
        $contentType = switch ($file) {
            "index.html"  { "text/html" }
            "robots.txt"  { "text/plain" }
            "sitemap.xml" { "application/xml" }
        }
        Write-Host "   Subiendo $file (sin cache)..." -ForegroundColor Gray
        aws s3 cp $localPath s3://$BUCKET_NAME/$file `
            --region $REGION `
            --cache-control "public, max-age=0, must-revalidate" `
            --content-type $contentType
        if ($LASTEXITCODE -ne 0) { throw "Fallo la subida de $file." }
    }
}

# --- 5. Invalidar cache de CloudFront ---------------------------------------
Write-Host "[4/5] Invalidando cache de CloudFront ($DISTRIBUTION_ID)..." -ForegroundColor Yellow
aws cloudfront create-invalidation `
    --distribution-id $DISTRIBUTION_ID `
    --paths "/*"

if ($LASTEXITCODE -ne 0) { throw "Fallo la invalidacion de CloudFront." }

# --- 6. Resumen -------------------------------------------------------------
Write-Host "[5/5] Deployment completado!" -ForegroundColor Green
Write-Host "Frontend: $CF_URL" -ForegroundColor Cyan
Write-Host "API:      $API_URL" -ForegroundColor Cyan
