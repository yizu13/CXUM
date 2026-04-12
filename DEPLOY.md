
# Guía de Despliegue - CXUM

## Infraestructura AWS (CDK)

### Recursos Desplegados

1. **API Gateway REST API** - Endpoints para backend
2. **Lambda Functions** - Funciones serverless para lógica de negocio
3. **DynamoDB Tables** - Base de datos NoSQL
4. **S3 Buckets**:
   - Bucket de imágenes (público con CORS)
   - Bucket de frontend (privado, servido por CloudFront)
5. **CloudFront Distribution** - CDN para el frontend con HTTPS
6. **Cognito User Pool** - Autenticación de usuarios

### Despliegue de Infraestructura

```bash
# Instalar dependencias
npm install

# Desplegar stack completo
cdk deploy

# Ver cambios antes de desplegar
cdk diff

# Destruir stack (¡CUIDADO!)
cdk destroy
```

## Despliegue del Frontend

### Opción 1: Script Automatizado (Windows PowerShell)

```powershell
.\scripts\deploy-frontend.ps1
```

### Opción 2: Script Automatizado (Linux/Mac)

```bash
chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh
```

### Opción 3: Manual

```bash
# 1. Build del frontend
cd frontend
npm run build

# 2. Subir a S3 (reemplazar BUCKET_NAME)
aws s3 sync dist/ s3://BUCKET_NAME --delete

# 3. Invalidar caché de CloudFront (reemplazar DISTRIBUTION_ID)
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

## Variables de Entorno

### Frontend (.env)

```env
VITE_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod
VITE_USER_POOL_ID=your-cognito-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-cognito-client-id
VITE_REGION=us-east-1
VITE_IMAGES_BUCKET=your-images-bucket-name
```

## SEO Implementation

### Implementación Completa de SEO

La aplicación incluye una estrategia SEO completa optimizada para Google y el mercado de República Dominicana:

#### 1. Meta Tags y Schema Markup

- **index.html**: Meta tags completos (Open Graph, Twitter Cards, Geo Tags)
- **Organization Schema**: JSON-LD para NGO
- **FAQPage Schema**: Preguntas frecuentes estructuradas
- **NewsArticle Schema**: Artículos de noticias con datos estructurados

#### 2. SEO Dinámico por Ruta

Hook `useSEO` implementado en todas las páginas principales:
- `/` - Página principal con keywords principales
- `/Noticias` - Sala de prensa
- `/Voluntarios` - Registro de voluntarios
- `/Contacto` - Contacto y centros de acopio
- `/Noticias/:slug` - Artículos individuales con SEO dinámico

#### 3. Archivos de Configuración

- **robots.txt**: Configurado para permitir crawling excepto admin
- **sitemap.xml**: Mapa del sitio con prioridades y frecuencias de actualización

#### 4. Optimizaciones Técnicas

- Lang attribute: `es-DO` (español dominicano)
- Canonical URLs configurados
- Meta descriptions únicas por página
- Keywords relevantes sin keyword stuffing
- Preconnect a Google Fonts para mejor performance

#### 5. Contenido SEO

- **FAQs Section**: 8 preguntas frecuentes optimizadas
- Títulos H1/H2 optimizados en todas las páginas
- Breadcrumbs en páginas de detalle
- Alt texts en imágenes (implementar en assets)

### Próximos Pasos SEO

1. **Optimización de Imágenes**:
   - Agregar alt texts descriptivos a todas las imágenes
   - Implementar lazy loading (ya parcialmente implementado)
   - Comprimir imágenes para mejor Core Web Vitals

2. **Sitemap Dinámico**:
   - Generar sitemap.xml dinámicamente desde la base de datos
   - Incluir URLs de noticias automáticamente

3. **Google Search Console**:
   - Registrar el sitio
   - Enviar sitemap
   - Monitorear indexación y errores

4. **Google Analytics / Tag Manager**:
   - Implementar tracking de eventos
   - Monitorear conversiones (formularios)

5. **Core Web Vitals**:
   - Optimizar LCP (Largest Contentful Paint)
   - Mejorar CLS (Cumulative Layout Shift)
   - Reducir FID (First Input Delay)

## Monitoreo y Mantenimiento

### CloudWatch Logs

Los logs de Lambda están disponibles en CloudWatch:
```bash
aws logs tail /aws/lambda/FUNCTION_NAME --follow
```

### Métricas de CloudFront

Monitorear en la consola de AWS:
- Requests totales
- Errores 4xx/5xx
- Cache hit ratio
- Bandwidth usage

### Actualización de Contenido

Para actualizar noticias, centros de acopio o voluntarios, usar el panel de administración en:
```
https://your-cloudfront-url.cloudfront.net/plataforma/admin
```

## Troubleshooting

### Frontend no se actualiza después del deploy

```bash
# Limpiar caché del navegador o invalidar CloudFront
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

### Errores CORS

Verificar configuración en `lib/cxum-stack.ts`:
- S3 bucket CORS
- API Gateway CORS headers

### Imágenes no cargan

Verificar:
1. Bucket policy permite lectura pública
2. CORS configurado correctamente
3. URLs en variables de entorno correctas

## Costos Estimados

- **CloudFront**: ~$0.085 por GB transferido
- **S3**: ~$0.023 por GB almacenado
- **Lambda**: Primeros 1M requests gratis, luego $0.20 por 1M
- **API Gateway**: $3.50 por millón de requests
- **DynamoDB**: On-demand pricing, pago por uso

## Seguridad

- Todas las comunicaciones usan HTTPS
- Cognito maneja autenticación
- Bucket de frontend es privado (solo CloudFront accede)
- Bucket de imágenes tiene política restrictiva
- Variables sensibles en AWS Systems Manager Parameter Store

## Backup y Recuperación

### DynamoDB

Habilitar Point-in-Time Recovery:
```bash
aws dynamodb update-continuous-backups \
  --table-name TABLE_NAME \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### S3

Habilitar versionado:
```bash
aws s3api put-bucket-versioning \
  --bucket BUCKET_NAME \
  --versioning-configuration Status=Enabled
```
