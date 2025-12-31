# Guía de Mantenimiento - Railway

## Índice
1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Tareas de Mantenimiento Diario](#tareas-de-mantenimiento-diario)
4. [Tareas de Mantenimiento Semanal](#tareas-de-mantenimiento-semanal)
5. [Tareas de Mantenimiento Mensual](#tareas-de-mantenimiento-mensual)
6. [Monitoreo y Logs](#monitoreo-y-logs)
7. [Backup y Recuperación](#backup-y-recuperación)
8. [Gestión de Usuarios](#gestión-de-usuarios)
9. [Optimización de Performance](#optimización-de-performance)
10. [Troubleshooting Común](#troubleshooting-común)
11. [Gestión de Costos](#gestión-de-costos)
12. [Procedimientos de Emergencia](#procedimientos-de-emergencia)

---

## Introducción

Este manual proporciona instrucciones detalladas para el mantenimiento del sistema desplegado en Railway.

### Información del Sistema

- **Plataforma**: Railway (https://railway.app)
- **Backend URL**: https://seguimiento-production-fa3a.up.railway.app
- **Frontend URL**: https://marugaul.github.io/seguimiento
- **Base de Datos**: SQLite (ubicado en Railway volume)
- **Repositorio**: https://github.com/marugaul/seguimiento

### Contactos Clave

| Rol | Responsabilidad | Contacto |
|-----|----------------|----------|
| Administrador de Sistema | Mantenimiento general | admin@seguimiento.com |
| Desarrollador | Cambios de código | dev@seguimiento.com |
| Soporte Técnico | Ayuda a usuarios | soporte@seguimiento.com |

---

## Acceso al Sistema

### 2.1 Acceso a Railway Dashboard

1. **Abrir navegador** y visitar: https://railway.app
2. **Login** con cuenta configurada
3. **Seleccionar proyecto**: "seguimiento-production-fa3a"
4. **Vista del dashboard**:
   ```
   ┌─────────────────────────────────────┐
   │   Railway Dashboard                 │
   ├─────────────────────────────────────┤
   │  seguimiento-production-fa3a        │
   │  ├─ Backend Service                 │
   │  │  ├─ Deployments                  │
   │  │  ├─ Variables                    │
   │  │  ├─ Metrics                      │
   │  │  └─ Logs                         │
   │  └─ Database Volume                 │
   └─────────────────────────────────────┘
   ```

### 2.2 Acceso a GitHub Repository

1. Visitar: https://github.com/marugaul/seguimiento
2. Login con cuenta autorizada
3. Navegar a:
   - `/server` - Código del backend
   - `/js` - Código del frontend
   - `/DOCUMENTS` - Documentación

### 2.3 Acceso SSH a Railway (Opcional)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Acceder a shell del backend
railway shell
```

---

## Tareas de Mantenimiento Diario

### 3.1 Verificación de Disponibilidad

**Tiempo estimado**: 5 minutos

**Pasos**:

1. **Verificar que el backend está respondiendo**:

```bash
# Desde terminal o Git Bash
curl https://seguimiento-production-fa3a.up.railway.app/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2024-XX-XX..."}
```

2. **Verificar login de usuarios**:
   - Abrir https://marugaul.github.io/seguimiento
   - Intentar login con usuario de prueba
   - Verificar que dashboard carga correctamente

3. **Verificar métricas en Railway**:
   - Abrir Railway Dashboard → Backend Service → Metrics
   - Revisar:
     - ✅ CPU < 70%
     - ✅ Memory < 80%
     - ✅ Response Time < 2s

**Alertas**:
- ⚠️ Si el health check falla → Ver [Procedimientos de Emergencia](#procedimientos-de-emergencia)
- ⚠️ Si el login falla → Ver [Troubleshooting - Problema de Autenticación](#troubleshooting-común)

### 3.2 Revisión de Logs

**Tiempo estimado**: 10 minutos

**Pasos**:

1. **Acceder a logs en Railway**:
   - Railway Dashboard → Backend Service → Logs
   - Filtrar por "Last 24 hours"

2. **Buscar errores**:
   - Buscar: `ERROR`
   - Buscar: `ECONNREFUSED`
   - Buscar: `500 Internal Server Error`

3. **Verificar cantidad de requests**:
   ```bash
   # Contar requests del día
   railway logs --tail 1000 | grep "POST /api/auth" | wc -l
   ```

**Registro de Logs Diario**:

| Fecha | Errores | Requests | Usuarios Activos | Notas |
|-------|---------|----------|------------------|-------|
| 2024-XX-XX | 0 | 150 | 12 | Normal |
| 2024-XX-XX | 3 | 200 | 15 | Timeout en login (resuelto) |

---

## Tareas de Mantenimiento Semanal

### 4.1 Backup de Base de Datos

**Tiempo estimado**: 15 minutos
**Frecuencia**: Cada lunes a las 9:00 AM

**Pasos**:

1. **Acceder a Railway shell**:

```bash
railway shell
```

2. **Exportar base de datos**:

```bash
# Dentro del shell de Railway
cd data
sqlite3 database.db .dump > backup-$(date +%Y%m%d).sql
ls -lh backup-*.sql
```

3. **Descargar backup localmente**:

```bash
# En tu computadora (fuera del shell)
railway run "cat data/backup-$(date +%Y%m%d).sql" > backup-$(date +%Y%m%d).sql
```

4. **Guardar en ubicación segura**:
   - OneDrive: `/Backups/Seguimiento/`
   - Google Drive: `/Seguimiento Backups/`
   - Servidor local: `/var/backups/seguimiento/`

5. **Verificar integridad del backup**:

```bash
# Verificar que el archivo no está vacío
ls -lh backup-$(date +%Y%m%d).sql

# Contar líneas (debe ser > 100)
wc -l backup-$(date +%Y%m%d).sql
```

**Política de Retención**:
- Backups diarios: Guardar últimos 7 días
- Backups semanales: Guardar últimos 4 semanas
- Backups mensuales: Guardar últimos 12 meses

### 4.2 Limpieza de Logs Antiguos

**Tiempo estimado**: 10 minutos

**Pasos**:

1. **Acceder a base de datos**:

```bash
railway shell
sqlite3 data/database.db
```

2. **Verificar cantidad de logs**:

```sql
SELECT COUNT(*) FROM audit_logs;
```

3. **Eliminar logs mayores a 90 días** (opcional):

```sql
DELETE FROM audit_logs
WHERE timestamp < datetime('now', '-90 days');

-- Verificar
SELECT COUNT(*) FROM audit_logs;
```

4. **Optimizar base de datos**:

```sql
VACUUM;
.quit
```

### 4.3 Revisión de Usuarios Inactivos

**Tiempo estimado**: 15 minutos

**Pasos**:

1. **Generar reporte de usuarios**:

```bash
railway shell
sqlite3 data/database.db
```

```sql
-- Usuarios que nunca han hecho login
SELECT u.email, u.name, u.created_at
FROM users u
WHERE u.email NOT IN (
    SELECT DISTINCT email FROM audit_logs WHERE event_type = 'login'
);

-- Usuarios sin login en últimos 30 días
SELECT u.email, u.name, MAX(al.timestamp) as last_login
FROM users u
LEFT JOIN audit_logs al ON u.email = al.email AND al.event_type = 'login'
GROUP BY u.email
HAVING MAX(al.timestamp) < datetime('now', '-30 days')
   OR MAX(al.timestamp) IS NULL;
```

2. **Contactar usuarios inactivos** (si es necesario)

3. **Desactivar usuarios** (si aplica política de empresa):

```sql
-- Marcar como inactivo (agregar columna si no existe)
ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1;

UPDATE users SET active = 0
WHERE email = 'usuario_inactivo@example.com';
```

---

## Tareas de Mantenimiento Mensual

### 5.1 Análisis de Performance

**Tiempo estimado**: 30 minutos

**Pasos**:

1. **Revisar métricas de Railway**:
   - Dashboard → Backend Service → Metrics
   - Exportar datos de:
     - CPU Usage (último mes)
     - Memory Usage (último mes)
     - Response Time (último mes)

2. **Analizar queries lentas**:

```bash
railway shell
sqlite3 data/database.db
```

```sql
-- Agregar logging de queries (si no está activado)
PRAGMA query_only = ON;

-- Ejecutar queries típicas y medir tiempo
.timer ON

SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100;

.timer OFF
```

3. **Crear reporte de performance**:

| Métrica | Valor Actual | Objetivo | Estado |
|---------|--------------|----------|--------|
| Avg Response Time | 150ms | <500ms | ✅ OK |
| CPU Usage | 35% | <70% | ✅ OK |
| Memory Usage | 65% | <80% | ✅ OK |
| Query Time (users) | 5ms | <50ms | ✅ OK |
| Database Size | 50MB | <1GB | ✅ OK |

### 5.2 Actualización de Dependencias

**Tiempo estimado**: 45 minutos

**Pasos**:

1. **Clonar repositorio localmente**:

```bash
git clone https://github.com/marugaul/seguimiento.git
cd seguimiento/server
```

2. **Verificar dependencias desactualizadas**:

```bash
npm outdated
```

Salida ejemplo:
```
Package    Current  Wanted  Latest  Location
express    4.18.2   4.18.2  4.19.0  server
bcryptjs   2.4.3    2.4.3   2.4.4   server
```

3. **Actualizar dependencias menores** (safe):

```bash
npm update
```

4. **Revisar changelog** para actualizaciones mayores:
   - Visitar npm package pages
   - Leer breaking changes
   - Decidir si actualizar

5. **Testing local**:

```bash
npm install
node server.js

# En otra terminal
curl http://localhost:3000/api/health
```

6. **Commit y deploy**:

```bash
git add package.json package-lock.json
git commit -m "Update dependencies (maintenance)"
git push origin main

# Railway auto-deploys
```

7. **Verificar en Railway**:
   - Esperar deployment (2-3 minutos)
   - Verificar logs: Railway Dashboard → Backend → Logs
   - Probar: `curl https://seguimiento-production-fa3a.up.railway.app/api/health`

### 5.3 Auditoría de Seguridad

**Tiempo estimado**: 30 minutos

**Pasos**:

1. **Escanear vulnerabilidades**:

```bash
cd server
npm audit
```

2. **Revisar usuarios con rol admin**:

```bash
railway shell
sqlite3 data/database.db
```

```sql
SELECT email, name, created_at
FROM users
WHERE role = 'admin'
ORDER BY created_at;
```

3. **Revisar intentos de login fallidos**:

```sql
-- Si se implementó logging de intentos fallidos
SELECT email, COUNT(*) as failed_attempts, MAX(timestamp) as last_attempt
FROM audit_logs
WHERE event_type = 'login_failed'
  AND timestamp > datetime('now', '-30 days')
GROUP BY email
HAVING COUNT(*) > 5
ORDER BY COUNT(*) DESC;
```

4. **Revisar configuración de firewall** (Railway):
   - Verificar que solo se permiten conexiones HTTPS
   - Verificar CORS settings

5. **Cambiar passwords críticos** (cada 90 días):
   - Password de admin principal
   - Database admin (si aplica en Azure)

---

## Monitoreo y Logs

### 6.1 Acceder a Logs en Railway

**Método 1: Dashboard Web**

1. Railway Dashboard → Backend Service → Logs
2. Filtros disponibles:
   - Time range: Last hour, 24 hours, 7 days
   - Log level: All, Error, Warning, Info

**Método 2: Railway CLI**

```bash
# Logs en tiempo real
railway logs

# Últimos 100 logs
railway logs --tail 100

# Filtrar por palabra
railway logs | grep "ERROR"

# Guardar logs en archivo
railway logs --tail 1000 > logs-$(date +%Y%m%d).txt
```

### 6.2 Interpretar Logs

**Formato de logs**:
```
[2024-01-15T10:30:45.123Z] POST /api/auth/login - 200 - 150ms
[2024-01-15T10:30:46.456Z] GET /api/auth/users - 200 - 50ms
[2024-01-15T10:30:50.789Z] ERROR: Database connection failed
```

**Logs importantes a monitorear**:

| Tipo | Patrón | Significado | Acción |
|------|--------|-------------|--------|
| ✅ OK | `200` | Request exitoso | Ninguna |
| ⚠️ Warning | `401` | No autorizado | Verificar credenciales |
| ⚠️ Warning | `403` | Prohibido | Verificar permisos |
| ❌ Error | `500` | Error del servidor | Investigar causa |
| ❌ Error | `ECONNREFUSED` | DB no responde | Reiniciar servicio |
| ❌ Error | `out of memory` | Memoria agotada | Aumentar plan |

### 6.3 Configurar Alertas (Recomendado)

**Opción 1: Railway Webhooks**

```bash
# En Railway Dashboard:
# Settings → Webhooks → Add Webhook
# URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
# Events: deployment.failed, deployment.crashed
```

**Opción 2: Monitoring Script Local**

Crear `monitor.sh`:

```bash
#!/bin/bash

BACKEND_URL="https://seguimiento-production-fa3a.up.railway.app"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK"

# Health check
if ! curl -s -f "$BACKEND_URL/api/health" > /dev/null; then
    # Enviar alerta a Slack
    curl -X POST $SLACK_WEBHOOK \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"⚠️ Backend is DOWN! $BACKEND_URL\"}"
fi
```

Ejecutar cada 5 minutos con cron:
```bash
crontab -e

# Agregar:
*/5 * * * * /path/to/monitor.sh
```

---

## Backup y Recuperación

### 7.1 Estrategia de Backup

**Niveles de backup**:

1. **Backup Diario Automático** (Recomendado):
   - GitHub Actions workflow cada 24 horas
   - Guarda en GitHub Releases

2. **Backup Semanal Manual**:
   - Cada lunes
   - Guardar en almacenamiento externo (OneDrive/Google Drive)

3. **Backup Pre-Deploy**:
   - Antes de cada actualización de código
   - Permite rollback rápido

### 7.2 Backup Automático con GitHub Actions

Crear `.github/workflows/backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    # Ejecutar diario a las 3 AM UTC
    - cron: '0 3 * * *'
  workflow_dispatch: # Permite ejecución manual

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Create Backup
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          railway login --token $RAILWAY_TOKEN
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway run "sqlite3 data/database.db .dump" > backup-$(date +%Y%m%d).sql

      - name: Upload to GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: backup-$(date +%Y%m%d)
          files: backup-$(date +%Y%m%d).sql
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Configurar secrets**:
1. GitHub → Settings → Secrets → Actions
2. Agregar:
   - `RAILWAY_TOKEN`: Token de Railway
   - `RAILWAY_PROJECT_ID`: ID del proyecto

### 7.3 Procedimiento de Recuperación

**Escenario 1: Recuperar datos borrados accidentalmente**

```bash
# 1. Descargar backup más reciente
# GitHub → Releases → Descargar backup-YYYYMMDD.sql

# 2. Acceder a Railway
railway shell

# 3. Crear backup del estado actual
sqlite3 data/database.db .dump > /tmp/current-backup.sql

# 4. Restaurar desde backup
sqlite3 data/database.db < /path/to/backup-YYYYMMDD.sql

# 5. Verificar
sqlite3 data/database.db "SELECT COUNT(*) FROM users;"
```

**Escenario 2: Migrar a nuevo proyecto Railway**

```bash
# 1. Crear nuevo proyecto en Railway
# Dashboard → New Project

# 2. Descargar backup de proyecto viejo
railway link <OLD_PROJECT_ID>
railway run "sqlite3 data/database.db .dump" > migration-backup.sql

# 3. Subir a nuevo proyecto
railway link <NEW_PROJECT_ID>
cat migration-backup.sql | railway run "sqlite3 data/database.db"

# 4. Verificar
railway run "sqlite3 data/database.db 'SELECT COUNT(*) FROM users;'"
```

---

## Gestión de Usuarios

### 8.1 Crear Usuario desde Backend

**Método 1: API Request**

```bash
# Como admin, crear usuario
curl -X POST https://seguimiento-production-fa3a.up.railway.app/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "password": "TempPassword123!",
    "name": "Usuario Nuevo",
    "role": "user",
    "adminRole": "admin"
  }'
```

**Método 2: SQL Directo**

```bash
railway shell
sqlite3 data/database.db
```

```sql
-- Generar password hash (usar bcrypt online: https://bcrypt-generator.com/)
-- Password: TempPassword123!
-- Hash: $2a$10$example...

INSERT INTO users (email, password, role, name, created_at, updated_at)
VALUES (
    'nuevo@example.com',
    '$2a$10$example...',  -- Reemplazar con hash real
    'user',
    'Usuario Nuevo',
    datetime('now'),
    datetime('now')
);

-- Verificar
SELECT email, name, role FROM users WHERE email = 'nuevo@example.com';
```

### 8.2 Resetear Password de Usuario

**Pasos**:

1. **Generar nuevo password**:
   - Usar generador seguro: https://passwordsgenerator.net/
   - Ejemplo: `Nw7!kL2@pQ9`

2. **Hashear password**:
   - Visitar: https://bcrypt-generator.com/
   - Input: `Nw7!kL2@pQ9`
   - Rounds: 10
   - Copiar hash generado

3. **Actualizar en DB**:

```bash
railway shell
sqlite3 data/database.db
```

```sql
UPDATE users
SET password = '$2a$10$NUEVO_HASH_AQUI',
    updated_at = datetime('now')
WHERE email = 'usuario@example.com';
```

4. **Notificar al usuario**:
   - Email: "Su password ha sido reseteado a: Nw7!kL2@pQ9"
   - Pedir que lo cambie al primer login

### 8.3 Desactivar Usuario

```sql
-- Opción 1: Cambiar role a 'disabled'
UPDATE users
SET role = 'disabled'
WHERE email = 'usuario@example.com';

-- Opción 2: Eliminar (NO recomendado, pierde audit trail)
DELETE FROM users WHERE email = 'usuario@example.com';
```

### 8.4 Listar Actividad de Usuario

```sql
SELECT
    event_type,
    details,
    timestamp
FROM audit_logs
WHERE email = 'usuario@example.com'
ORDER BY timestamp DESC
LIMIT 50;
```

---

## Optimización de Performance

### 9.1 Verificar Tamaño de Base de Datos

```bash
railway shell
du -h data/database.db
```

**Rangos**:
- ✅ < 100 MB: Excelente
- ⚠️ 100-500 MB: Bueno (considerar optimización)
- ❌ > 500 MB: Crítico (optimizar o migrar a PostgreSQL)

### 9.2 Optimizar Base de Datos

```bash
sqlite3 data/database.db
```

```sql
-- Analizar estadísticas
ANALYZE;

-- Reindexar
REINDEX;

-- Compactar (recuperar espacio)
VACUUM;

-- Verificar integridad
PRAGMA integrity_check;
```

### 9.3 Agregar Índices (Si No Existen)

```sql
-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON audit_logs(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email_timestamp
    ON audit_logs(email, timestamp DESC);

-- Verificar índices creados
.indexes users
.indexes audit_logs
```

### 9.4 Monitorear Uso de Memoria

```bash
# En Railway Dashboard → Metrics
# Revisar:
# - Memory Usage graph
# - Si está cerca del límite (512MB free tier)

# Aumentar plan si es necesario:
# Railway Dashboard → Settings → Plan → Upgrade
```

---

## Troubleshooting Común

### Problema 1: "Backend no responde"

**Síntomas**:
- Frontend muestra "Error de conexión con el servidor"
- `curl https://seguimiento-production-fa3a.up.railway.app/api/health` falla

**Diagnóstico**:

```bash
# 1. Verificar status en Railway
railway status

# 2. Ver logs recientes
railway logs --tail 50
```

**Soluciones**:

```bash
# Opción A: Reiniciar servicio
railway restart

# Opción B: Forzar redeploy
railway up --detach

# Opción C: Rollback a versión anterior
# Railway Dashboard → Deployments → Click en deployment anterior → Redeploy
```

### Problema 2: "Database locked"

**Síntomas**:
- Error en logs: `SQLITE_BUSY: database is locked`

**Causa**:
- Múltiples escrituras concurrentes
- Backup corriendo al mismo tiempo que queries

**Solución**:

```sql
-- Configurar timeout más alto
PRAGMA busy_timeout = 5000;

-- Verificar transacciones colgadas
PRAGMA locking_mode;
```

**Prevención**:
- Ejecutar backups en horarios de bajo tráfico (3 AM)
- Considerar migrar a PostgreSQL si hay alta concurrencia

### Problema 3: "CORS error"

**Síntomas**:
- Frontend muestra: "Access to fetch has been blocked by CORS policy"

**Verificar**:

```bash
# Ver configuración CORS en server.js
railway run "cat server.js | grep -A 5 'cors'"
```

**Solución**:

Editar `server/server.js`:

```javascript
const corsOptions = {
    origin: [
        'https://marugaul.github.io',
        'http://localhost:8080'  // para desarrollo
    ],
    credentials: true
};

app.use(cors(corsOptions));
```

Commit y push:

```bash
git add server/server.js
git commit -m "Fix CORS configuration"
git push origin main
```

### Problema 4: "Out of memory"

**Síntomas**:
- Railway logs: `JavaScript heap out of memory`
- Servicio crashea aleatoriamente

**Diagnóstico**:

```bash
# Ver uso de memoria
railway logs | grep -i "memory"
```

**Soluciones**:

**Opción A: Aumentar límite de Node.js**

Editar `server/package.json`:

```json
{
  "scripts": {
    "start": "node --max-old-space-size=512 server.js"
  }
}
```

**Opción B: Upgrade plan de Railway**

```bash
# Railway Dashboard → Settings → Plan
# Upgrade de Free (512MB) a Developer ($5/mes, 1GB RAM)
```

### Problema 5: "Password hash undefined"

**Síntomas**:
- Frontend muestra "undefined" en columna password

**Causa**:
- Backend no retorna campo password (por seguridad)

**Verificar** (NO es error):

```javascript
// En js/app.js, debe mostrar dots en lugar de password:
<span class="text-muted">••••••••</span>
```

Si muestra `${user.password}`, cambiar a `••••••••`.

---

## Gestión de Costos

### 11.1 Plan Actual - Railway Free Tier

**Límites**:
- ✅ $5 USD / mes de uso gratuito
- ✅ 512 MB RAM
- ✅ 1 GB disco
- ✅ Shared CPU
- ⚠️ Proyecto se duerme después de 1 hora de inactividad (en free tier legacy)

**Costo actual**: $0 USD/mes

### 11.2 Monitorear Uso

```bash
# Railway Dashboard → Project → Usage
# Revisar:
# - CPU Hours
# - Memory Usage
# - Network (egress)
```

### 11.3 Cuándo Considerar Upgrade

**Señales de que necesitas upgrade**:

| Señal | Plan Recomendado | Costo |
|-------|------------------|-------|
| > 100 usuarios activos | Developer Plan | $5/mes |
| > 1000 usuarios activos | Hobby Plan | $10/mes |
| Necesitas uptime 99.9% | Pro Plan | $20/mes |
| > 2 GB database | Migrar a Azure | ~$50/mes |

### 11.4 Optimizar Costos

**Tips para reducir costos**:

1. **Limpiar logs antiguos** (reduce disco):
   ```sql
   DELETE FROM audit_logs WHERE timestamp < datetime('now', '-90 days');
   VACUUM;
   ```

2. **Comprimir respuestas** (reduce network egress):
   ```javascript
   // En server.js
   const compression = require('compression');
   app.use(compression());
   ```

3. **Cachear queries frecuentes** (reduce CPU):
   ```javascript
   // Implementar cache simple en memoria
   const cache = {};

   app.get('/api/auth/users', async (req, res) => {
       if (cache.users && Date.now() - cache.usersTime < 60000) {
           return res.json(cache.users);
       }

       const users = await getUsersFromDB();
       cache.users = users;
       cache.usersTime = Date.now();

       res.json(users);
   });
   ```

---

## Procedimientos de Emergencia

### 12.1 Sistema Completamente Caído

**Pasos**:

1. **Verificar status**:
   ```bash
   railway status
   ```

2. **Ver logs para identificar causa**:
   ```bash
   railway logs --tail 100
   ```

3. **Reiniciar servicio**:
   ```bash
   railway restart
   ```

4. **Si persiste, rollback**:
   - Railway Dashboard → Deployments
   - Click en último deployment funcional
   - Click "Redeploy"

5. **Notificar usuarios**:
   - Email/Slack: "Sistema en mantenimiento, estará disponible en 15 minutos"

### 12.2 Base de Datos Corrupta

**Pasos**:

1. **Verificar integridad**:
   ```bash
   railway shell
   sqlite3 data/database.db "PRAGMA integrity_check;"
   ```

2. **Si está corrupta, restaurar desde backup**:
   ```bash
   # Descargar último backup
   # (desde GitHub Releases o backup manual)

   # Subir a Railway
   railway shell
   mv data/database.db data/database-corrupted.db
   # Copiar backup-YYYYMMDD.sql al contenedor
   sqlite3 data/database.db < backup-YYYYMMDD.sql
   ```

3. **Verificar recuperación**:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM audit_logs;
   ```

### 12.3 Pérdida de Datos

**Pasos**:

1. **Identificar alcance**:
   - ¿Qué datos se perdieron?
   - ¿Cuándo ocurrió?

2. **Recuperar desde backup más reciente**:
   - Ver [7.3 Procedimiento de Recuperación](#73-procedimiento-de-recuperación)

3. **Documentar incidente**:
   ```markdown
   # Incident Report: Data Loss
   - Date: 2024-XX-XX
   - Time: XX:XX UTC
   - Affected: Users table / Audit logs
   - Cause: Accidental DELETE without WHERE clause
   - Recovery: Restored from backup-20240115.sql
   - Data lost: 2 hours of data (last backup was 3 AM)
   - Prevention: Add confirmation prompts for DELETE operations
   ```

4. **Implementar prevención**:
   - Backups más frecuentes (cada 6 horas)
   - Agregar validación en queries DELETE/UPDATE
   - Implementar soft deletes (marcar como deleted en lugar de borrar)

---

## Checklist de Mantenimiento

### Diario ✅

- [ ] Verificar health check
- [ ] Revisar logs de errores
- [ ] Verificar métricas (CPU, RAM, Response Time)

### Semanal ✅

- [ ] Backup manual de base de datos
- [ ] Limpiar logs antiguos (>90 días)
- [ ] Revisar usuarios inactivos

### Mensual ✅

- [ ] Análisis de performance
- [ ] Actualizar dependencias (npm update)
- [ ] Auditoría de seguridad
- [ ] Revisar costos de Railway

### Trimestral ✅

- [ ] Cambiar password de admin principal
- [ ] Revisar y actualizar documentación
- [ ] Evaluar migración a Azure (si aplica)
- [ ] Capacitación a nuevos usuarios admin

---

## Recursos Adicionales

### Links Útiles

- **Railway Status**: https://status.railway.app/
- **Railway Docs**: https://docs.railway.app/
- **SQLite Docs**: https://www.sqlite.org/docs.html
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **bcrypt Generator**: https://bcrypt-generator.com/

### Contacto de Soporte

| Servicio | Canal | Tiempo de Respuesta |
|----------|-------|---------------------|
| Railway Support | Discord | 1-2 horas |
| Railway Support | Email: team@railway.app | 24 horas |
| GitHub Issues | https://github.com/marugaul/seguimiento/issues | Varía |

---

**Última actualización**: 2024
**Versión**: 1.0
**Autor**: Equipo de Desarrollo - Sistema de Seguimiento
