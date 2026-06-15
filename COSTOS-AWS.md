# Análisis de Costos AWS - Cuadernos X un Mañana

## Resumen Ejecutivo

Infraestructura serverless en AWS optimizada para una ONG con costos variables según uso real.

---

## 📊 Tabla de Costos Mensuales por Servicio

### Escenario Base (Uso Actual Estimado)

| Servicio | Cantidad | Uso Mensual Estimado | Costo Base | Costo con Tolerancia 3x | Notas |
|----------|----------|---------------------|------------|------------------------|-------|
| **AWS Lambda** | 20 funciones | 50,000 invocaciones<br>100 GB-seg | $0.00 | $0.00 | Dentro de Free Tier (1M requests/mes) |
| **API Gateway HTTP** | 1 API | 50,000 requests | $0.05 | $0.15 | $1.00 por millón de requests |
| **DynamoDB** | 7 tablas | 10,000 lecturas<br>5,000 escrituras | $1.25 | $3.75 | On-Demand: $1.25/millón lecturas, $6.25/millón escrituras |
| **S3 Storage** | 2 buckets | 5 GB almacenamiento<br>10 GB transferencia | $0.23 | $0.69 | $0.023/GB almacenado, $0.09/GB transferido |
| **CloudFront** | 1 distribución | 50 GB transferencia<br>500,000 requests | $4.25 | $12.75 | $0.085/GB, $0.0075/10k requests |
| **Cognito** | 1 User Pool | 50 usuarios activos | $0.00 | $0.00 | Gratis hasta 50,000 MAU |
| **CloudWatch Logs** | Logs de Lambda | 1 GB logs | $0.50 | $1.50 | $0.50/GB ingerido |
| **Route 53** | 1 zona hospedada | 1 dominio | $0.50 | $0.50 | $0.50/zona + $0.40/millón queries |
| **ACM Certificate** | 1 certificado SSL | Certificado público | $0.00 | $0.00 | Gratis para certificados públicos |

### **TOTAL MENSUAL**
- **Uso Base**: ~$6.78/mes
- **Con Tolerancia 3x**: ~$19.34/mes
- **Anual Base**: ~$81.36/año
- **Anual con Tolerancia**: ~$232.08/año

---

## 📈 Escenarios de Crecimiento

### Escenario Medio (500 visitas/día)

| Servicio | Uso Mensual | Costo Mensual |
|----------|-------------|---------------|
| Lambda | 150,000 invocaciones | $0.00 (Free Tier) |
| API Gateway | 150,000 requests | $0.15 |
| DynamoDB | 30k lecturas, 15k escrituras | $3.75 |
| S3 | 10 GB almacenamiento, 30 GB transferencia | $0.93 |
| CloudFront | 150 GB transferencia, 1.5M requests | $12.75 |
| Cognito | 150 usuarios activos | $0.00 |
| CloudWatch | 3 GB logs | $1.50 |
| Route 53 | 1 dominio | $0.50 |
| **TOTAL** | | **~$19.58/mes** |

### Escenario Alto (2,000 visitas/día)

| Servicio | Uso Mensual | Costo Mensual |
|----------|-------------|---------------|
| Lambda | 600,000 invocaciones | $0.00 (Free Tier) |
| API Gateway | 600,000 requests | $0.60 |
| DynamoDB | 120k lecturas, 60k escrituras | $15.00 |
| S3 | 25 GB almacenamiento, 100 GB transferencia | $9.58 |
| CloudFront | 500 GB transferencia, 6M requests | $42.50 |
| Cognito | 500 usuarios activos | $0.00 |
| CloudWatch | 10 GB logs | $5.00 |
| Route 53 | 1 dominio | $0.50 |
| **TOTAL** | | **~$73.18/mes** |

---

## 💡 Optimizaciones Implementadas

### ✅ Ya Implementado
1. **Lambda**: Runtime Node.js 22.x (más eficiente)
2. **DynamoDB**: On-Demand (pago por uso real, no capacidad provisionada)
3. **CloudFront**: Price Class 100 (solo NA y Europa, más económico)
4. **S3**: Lifecycle policies para archivos antiguos (si se implementa)
5. **API Gateway HTTP**: Más económico que REST API (~70% menos)

### 🔄 Recomendaciones Adicionales

1. **CloudWatch Logs Retention**
   - Configurar retención de 7-14 días para logs de Lambda
   - Ahorro: ~$0.30-0.50/mes

2. **S3 Intelligent-Tiering**
   - Mover imágenes antiguas a tiers más económicos automáticamente
   - Ahorro: ~20-30% en almacenamiento

3. **CloudFront Cache Optimization**
   - Aumentar TTL de assets estáticos
   - Reducir requests a origen (S3)
   - Ahorro: ~15-25% en transferencia

4. **DynamoDB Reserved Capacity** (solo si tráfico es predecible)
   - Considerar solo si se supera uso consistente
   - Ahorro potencial: ~50% vs On-Demand

---

## 🌐 Dominios Recomendados

### Opción 1: Dominios .DO (República Dominicana)

| Dominio | Disponibilidad | Precio Anual | Registrador | Notas |
|---------|---------------|--------------|-------------|-------|
| `cuadernosxunmanana.do` | ✅ Verificar | $30-50 | NIC.do | Dominio nacional oficial |
| `cxum.do` | ✅ Verificar | $30-50 | NIC.do | Corto y memorable |
| `cuadernosxm.do` | ✅ Verificar | $30-50 | NIC.do | Versión abreviada |

**Registrador**: [NIC.do](https://www.nic.do) - Registro oficial de dominios .DO

### Opción 2: Dominios Genéricos (Más Económicos)

| Dominio | Disponibilidad | Precio Anual | Registrador | Notas |
|---------|---------------|--------------|-------------|-------|
| `cuadernosxunmanana.org` | ✅ Verificar | $12-15 | Namecheap/GoDaddy | Ideal para ONGs |
| `cxum.org` | ✅ Verificar | $12-15 | Namecheap/GoDaddy | Corto, profesional |
| `cuadernosxm.org` | ✅ Verificar | $12-15 | Namecheap/GoDaddy | Alternativa |
| `cuadernosxunmanana.com` | ⚠️ Verificar | $10-13 | Namecheap/GoDaddy | Más comercial |
| `cxum.com` | ⚠️ Verificar | $10-13 | Namecheap/GoDaddy | Muy corto |

### Opción 3: Dominios Nuevos (Creativos)

| Dominio | Disponibilidad | Precio Anual | Registrador | Notas |
|---------|---------------|--------------|-------------|-------|
| `cuadernos.social` | ✅ Verificar | $25-35 | Namecheap | Perfecto para causa social |
| `cxum.foundation` | ✅ Verificar | $30-40 | Namecheap | Para fundaciones |
| `cuadernos.ngo` | ✅ Verificar | $25-35 | Namecheap | Específico para ONGs |

### 🏆 Recomendación Principal

**Opción A (Identidad Nacional)**:
- Dominio: `cuadernosxunmanana.do` o `cxum.do`
- Costo: ~$40/año
- Ventaja: Identidad dominicana clara, confianza local

**Opción B (Económica + Global)**:
- Dominio: `cuadernosxunmanana.org`
- Costo: ~$13/año
- Ventaja: Reconocido internacionalmente para ONGs, muy económico

**Opción C (Híbrida - RECOMENDADA)**:
- Dominio principal: `cuadernosxunmanana.org` ($13/año)
- Redirect desde: `cxum.do` ($40/año)
- Costo total: ~$53/año
- Ventaja: Lo mejor de ambos mundos

---

## 📋 Registradores Recomendados

### Para .DO (Dominios Dominicanos)
1. **NIC.do** (Oficial)
   - Web: https://www.nic.do
   - Precio: $30-50/año
   - Proceso: Requiere documentación local

### Para .ORG/.COM (Internacionales)
1. **Namecheap** ⭐ RECOMENDADO
   - Web: https://www.namecheap.com
   - Precio .org: ~$12.98/año
   - Incluye: WHOIS privacy gratis, DNS gratis
   - Ventaja: Interfaz simple, buen soporte

2. **Google Domains** (ahora Squarespace)
   - Web: https://domains.squarespace.com
   - Precio .org: ~$12/año
   - Incluye: WHOIS privacy, email forwarding

3. **Cloudflare Registrar**
   - Web: https://www.cloudflare.com/products/registrar/
   - Precio: Al costo (sin markup)
   - Ventaja: Precio más bajo posible
   - Requiere: Cuenta Cloudflare activa

---

## 💰 Resumen de Costos Totales (Primer Año)

### Configuración Mínima
- AWS (uso base): $81.36/año
- Dominio .org: $13/año
- **TOTAL**: ~$94.36/año (~$7.86/mes)

### Configuración Recomendada
- AWS (con tolerancia 3x): $232.08/año
- Dominio .org principal: $13/año
- Dominio .do redirect: $40/año
- **TOTAL**: ~$285.08/año (~$23.76/mes)

### Configuración Crecimiento Medio
- AWS (500 visitas/día): $234.96/año
- Dominios: $53/año
- **TOTAL**: ~$287.96/año (~$24/mes)

---

## 🎯 Recomendaciones Finales

### Fase 1: Lanzamiento (Primeros 3 meses)
- Usar dominio .org ($13/año)
- Mantener infraestructura actual
- Monitorear uso real en CloudWatch
- **Costo estimado**: $7-10/mes

### Fase 2: Crecimiento (3-12 meses)
- Agregar dominio .do si hay presupuesto
- Optimizar CloudFront cache
- Implementar S3 Intelligent-Tiering
- **Costo estimado**: $15-25/mes

### Fase 3: Consolidación (12+ meses)
- Evaluar Reserved Capacity en DynamoDB si uso es consistente
- Considerar CloudFront Reserved Capacity
- Implementar monitoreo de costos con AWS Budgets (gratis)
- **Costo estimado**: $20-40/mes

---

## 📊 Herramientas de Monitoreo (Gratis)

1. **AWS Cost Explorer**
   - Analizar costos por servicio
   - Identificar picos de uso

2. **AWS Budgets**
   - Alertas cuando se supera presupuesto
   - Configurar: $25/mes como límite inicial

3. **CloudWatch Dashboards**
   - Monitorear métricas en tiempo real
   - Identificar optimizaciones

---

## 🔗 Enlaces Útiles

- [AWS Pricing Calculator](https://calculator.aws/)
- [Namecheap Domain Search](https://www.namecheap.com/domains/)
- [NIC.do - Registro Dominicano](https://www.nic.do)
- [AWS Free Tier](https://aws.amazon.com/free/)

---

**Última actualización**: Abril 2026
**Región AWS**: us-east-2 (Ohio)
**Moneda**: USD
