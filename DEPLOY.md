# Guía de Despliegue - CXUM

## Requisitos Previos

- Node.js 18+ y npm
- AWS CLI configurado con credenciales
- AWS CDK CLI instalado: `npm install -g aws-cdk`
- Cuenta de AWS con permisos para crear recursos

## Estructura del Proyecto

```
CXUM/
├── frontend/          # Aplicación React + Vite
├── lambdas/          # Funciones Lambda
├── lib/              # Stack de CDK
└── bin/              # Entry point de CDK
```

## Pasos de Despliegue

### 1. Instalar Dependencias

```bash
# Dependencias del CDK
npm install

# Dependencias del frontend
cd frontend
npm install
cd ..
```

### 2. Configurar Variables de Entorno

Crea o actualiza `frontend/.env`:

```env
VITE_API_URL=https://tu-api-id.execute-api.us-east-2.amazonaws.com
VITE_COGNITO_USER_POOL_ID=us-east-2_jjcAqBdVn
VITE_COGNITO_CLIENT_ID=18n7rhj63h6modf5ol9m637ism
VITE_COGNITO_REGION=us-east-2
```

### 3. Desplegar Backend (CDK)

```bash
# Bootstrap CDK (solo primera vez)
cdk bootstrap

# Sintetizar el stack (verificar cambios)
cdk synth

# Desplegar
cdk deploy

# Nota: Guarda la URL del API Gateway que aparece en los outputs
```

Después del deploy, CDK mostrará:
- `ApiUrl`: URL base del API Gateway
- `ImagesBucketName`: Nombre del bucket S3 para imágenes
- `ImagesBucketUrl`: URL base del bucket S3

### 4. Actualizar Variables de Entorno del Frontend

Actualiza `frontend/.env` con la URL del API Gateway:

```env
VITE_API_URL=https://[tu-api-id].execute-api.us-east-2.amazonaws.com
```

### 5. Build del Frontend

```bash
cd frontend
npm run build
```

Esto genera la carpeta `frontend/dist/` con los archivos estáticos.

### 6. Desplegar Frontend

Opciones:

#### Opción A: AWS Amplify (Recomendado)
1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno en Amplify
3. Amplify detectará automáticamente Vite y hará el build

#### Opción B: S3 + CloudFront
```bash
# Crear bucket para el frontend
aws s3 mb s3://cxum-frontend

# Configurar como sitio web estático
aws s3 website s3://cxum-frontend --index-document index.html --error-document index.html

# Subir archivos
aws s3 sync frontend/dist/ s3://cxum-frontend --delete

# Configurar política pública
aws s3api put-bucket-policy --bucket cxum-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::cxum-frontend/*"
  }]
}'
```

#### Opción C: Vercel/Netlify
1. Conecta tu repositorio
2. Configura las variables de entorno
3. Deploy automático

## Recursos Creados

El stack de CDK crea:

### DynamoDB Tables
- `cxum-centros`: Centros de acopio
- `cxum-noticias`: Noticias y publicaciones
- `cxum-solicitudes`: Solicitudes de voluntarios
- `cxum-contactos`: Mensajes de contacto
- `cxum-invite-tokens`: Tokens de invitación
- `cxum-activity`: Log de actividad
- `cxum-user-profiles`: Perfiles de usuario

### S3 Bucket
- `cxum-images-[account-id]`: Almacenamiento de imágenes

### Lambda Functions
- `getCentrosCXUM`: Listar centros
- `mutateCentroCXUM`: Crear/editar/eliminar centros
- `getNoticiasCXUM`: Listar noticias
- `mutateNoticiaCXUM`: Crear/editar/eliminar noticias
- `getSolicitudesCXUM`: Listar solicitudes
- `mutateSolicitudCXUM`: Gestionar solicitudes
- `uploadImageCXUM`: Subir imágenes a S3
- Y más...

### API Gateway
- HTTP API con rutas públicas y protegidas
- Authorizers para autenticación multi-rol

## Actualizar el Backend

```bash
# Después de cambios en lambdas o CDK
cdk deploy
```

## Actualizar el Frontend

```bash
cd frontend
npm run build

# Luego subir a tu plataforma de hosting
```

## Monitoreo

### CloudWatch Logs
```bash
# Ver logs de una lambda
aws logs tail /aws/lambda/uploadImageCXUM --follow
```

### DynamoDB
```bash
# Ver items de una tabla
aws dynamodb scan --table-name cxum-noticias
```

### S3
```bash
# Listar imágenes
aws s3 ls s3://cxum-images-[account-id]/noticias/
```

## Troubleshooting

### Error: "Access Denied" al subir imágenes
- Verificar permisos de la lambda en IAM
- Verificar política del bucket S3

### Error: "CORS" en el frontend
- Verificar configuración CORS en API Gateway
- Verificar configuración CORS en S3

### Error: "Unauthorized" en rutas protegidas
- Verificar token de Cognito
- Verificar configuración del authorizer

## Rollback

```bash
# Ver historial de deploys
cdk diff

# Revertir a versión anterior (manual)
# 1. Restaurar código anterior
# 2. cdk deploy
```

## Limpieza

```bash
# CUIDADO: Esto elimina todos los recursos
cdk destroy

# Eliminar bucket de imágenes manualmente
aws s3 rb s3://cxum-images-[account-id] --force
```

## Costos Estimados

Con uso moderado (< 1000 usuarios/mes):
- Lambda: ~$0-5/mes (free tier)
- DynamoDB: ~$0-2/mes (free tier)
- S3: ~$0-1/mes
- API Gateway: ~$0-3/mes
- CloudWatch: ~$0-1/mes

**Total estimado: $0-12/mes** (la mayoría cubierto por free tier)

## Seguridad

- Las lambdas usan IAM roles con permisos mínimos
- API Gateway usa authorizers de Cognito
- S3 bucket de imágenes es público (solo lectura)
- DynamoDB tables tienen encryption at rest
- Secrets en variables de entorno (no en código)

## Soporte

Para problemas o preguntas:
1. Revisar logs en CloudWatch
2. Verificar configuración en AWS Console
3. Contactar al equipo de desarrollo
