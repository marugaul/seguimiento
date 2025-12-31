# Guía de Migración a Microsoft Azure

## Índice
1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Comparación: Railway vs Azure](#comparación-railway-vs-azure)
4. [Arquitectura Azure Objetivo](#arquitectura-azure-objetivo)
5. [Paso 1: Preparación](#paso-1-preparación)
6. [Paso 2: Migración de Base de Datos](#paso-2-migración-de-base-de-datos)
7. [Paso 3: Migración del Backend](#paso-3-migración-del-backend)
8. [Paso 4: Migración del Frontend](#paso-4-migración-del-frontend)
9. [Paso 5: Configuración de Dominio](#paso-5-configuración-de-dominio)
10. [Paso 6: Testing y Validación](#paso-6-testing-y-validación)
11. [Paso 7: Cutover (Cambio de Producción)](#paso-7-cutover-cambio-de-producción)
12. [Post-Migración](#post-migración)
13. [Troubleshooting](#troubleshooting)
14. [Costos Estimados](#costos-estimados)

---

## Introducción

Esta guía proporciona un plan paso a paso para migrar el sistema de seguimiento desde:

**Arquitectura Actual:**
- Frontend: GitHub Pages
- Backend: Railway (Node.js/Express)
- Base de Datos: SQLite

**Arquitectura Objetivo (Azure):**
- Frontend: Azure Static Web Apps
- Backend: Azure App Service
- Base de Datos: Azure SQL Database

### Razones para Migrar a Azure

✅ **Escalabilidad**: Soporte para millones de usuarios
✅ **Confiabilidad**: SLA 99.9% uptime
✅ **Seguridad**: Compliance con ISO, SOC, GDPR
✅ **Integración**: Azure AD, Application Insights, etc.
✅ **Soporte Empresarial**: Soporte técnico 24/7

---

## Requisitos Previos

### 1. Cuenta de Azure

- [ ] Crear cuenta en [portal.azure.com](https://portal.azure.com)
- [ ] Configurar método de pago (tarjeta de crédito)
- [ ] Verificar créditos gratuitos ($200 USD por 30 días)
- [ ] Crear Resource Group: `seguimiento-rg`

### 2. Herramientas Necesarias

```bash
# Instalar Azure CLI
# Windows:
winget install Microsoft.AzureCLI

# macOS:
brew install azure-cli

# Linux (Ubuntu/Debian):
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Verificar instalación
az --version
```

### 3. Acceso al Código Actual

- [ ] Acceso al repositorio GitHub: `marugaul/seguimiento`
- [ ] Acceso a Railway dashboard
- [ ] Backup de base de datos SQLite actual

### 4. Conocimientos Técnicos

- ✅ Conceptos básicos de Azure
- ✅ Manejo de línea de comandos
- ✅ SQL Server (migración desde SQLite)
- ✅ Configuración DNS (si tienes dominio personalizado)

---

## Comparación: Railway vs Azure

| Característica | Railway (Actual) | Azure | Ventaja |
|----------------|------------------|-------|---------|
| **Costo** | $0/mes (free tier) | ~$50-100/mes (basic tier) | Railway |
| **Escalabilidad** | Limitada (512MB RAM) | Ilimitada (scale up/out) | Azure |
| **SLA** | No garantizado | 99.9% uptime | Azure |
| **Región** | US East | Múltiples regiones | Azure |
| **Base de Datos** | SQLite (archivo local) | Azure SQL (cluster) | Azure |
| **Backups** | Manual | Automáticos (geo-redundante) | Azure |
| **Monitoring** | Básico | Application Insights | Azure |
| **Soporte** | Comunidad | Soporte empresarial 24/7 | Azure |
| **Compliance** | No certificado | ISO, SOC, HIPAA, GDPR | Azure |
| **CI/CD** | GitHub integration | Azure DevOps + GitHub Actions | Empate |

---

## Arquitectura Azure Objetivo

```
┌──────────────────────────────────────────────────────────────────┐
│                         AZURE CLOUD                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              Azure Front Door (CDN + WAF)              │     │
│  │  • Content Delivery Network                            │     │
│  │  • Web Application Firewall                            │     │
│  │  • DDoS Protection                                     │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                       │
│           ┌──────────────┴──────────────┐                       │
│           │                             │                       │
│  ┌────────▼──────────┐       ┌──────────▼────────┐            │
│  │ Static Web Apps   │       │  App Service      │            │
│  │  (Frontend)       │       │  (Backend API)    │            │
│  │                   │       │                   │            │
│  │ • index.html      │       │ • Node.js 18+     │            │
│  │ • app.js          │       │ • Express server  │            │
│  │ • auth-azure.js   │       │ • API routes      │            │
│  │ • Bootstrap CSS   │       │                   │            │
│  └───────────────────┘       └──────────┬────────┘            │
│                                         │                       │
│                              ┌──────────┴────────────┐         │
│                              │                       │         │
│                   ┌──────────▼────────┐   ┌─────────▼──────┐  │
│                   │  Azure SQL        │   │ Redis Cache    │  │
│                   │  Database         │   │  (opcional)    │  │
│                   │                   │   │                │  │
│                   │ • users table     │   │ • Session data │  │
│                   │ • audit_logs      │   │ • Query cache  │  │
│                   │ • Auto backup     │   │                │  │
│                   │ • Geo-replicated  │   │                │  │
│                   └───────────────────┘   └────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           Azure Monitor + Application Insights        │     │
│  │  • Logs                                               │     │
│  │  • Metrics                                            │     │
│  │  • Alerts                                             │     │
│  │  • Performance tracking                               │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Recursos Azure a Crear

1. **Resource Group**: `seguimiento-rg`
2. **Azure SQL Database**: `seguimiento-db`
3. **Azure SQL Server**: `seguimiento-sql-server`
4. **App Service Plan**: `seguimiento-plan` (B1 tier)
5. **App Service**: `seguimiento-backend`
6. **Static Web App**: `seguimiento-frontend`
7. **Application Insights**: `seguimiento-insights`

---

## Paso 1: Preparación

### 1.1 Login en Azure CLI

```bash
# Login
az login

# Verificar suscripción activa
az account show

# Si tienes múltiples suscripciones, selecciona la correcta
az account list --output table
az account set --subscription "NOMBRE_SUSCRIPCION"
```

### 1.2 Crear Resource Group

```bash
# Crear resource group en región East US
az group create \
  --name seguimiento-rg \
  --location eastus

# Verificar creación
az group show --name seguimiento-rg
```

### 1.3 Backup de Base de Datos Actual

**Opción A: Desde Railway Dashboard**

1. Acceder a Railway dashboard
2. Ir a proyecto → Variables → Database
3. Descargar archivo `database.db` desde el contenedor

**Opción B: Usar Railway CLI**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Descargar database
railway run --service backend "cp data/database.db /tmp/backup.db"
railway download /tmp/backup.db ./database-backup.db
```

### 1.4 Exportar Datos de SQLite a SQL

```bash
# Instalar sqlite3
# macOS:
brew install sqlite3

# Exportar schema y datos
sqlite3 database-backup.db .dump > database-export.sql

# Verificar contenido
head -n 50 database-export.sql
```

---

## Paso 2: Migración de Base de Datos

### 2.1 Crear Azure SQL Server

```bash
# Variables
SQL_SERVER="seguimiento-sql-server"
SQL_DB="seguimiento-db"
SQL_ADMIN="sqladmin"
SQL_PASSWORD="Admin@Seguimiento2024!"  # Cambiar por password seguro

# Crear SQL Server
az sql server create \
  --name $SQL_SERVER \
  --resource-group seguimiento-rg \
  --location eastus \
  --admin-user $SQL_ADMIN \
  --admin-password $SQL_PASSWORD

# Configurar firewall (permitir servicios Azure)
az sql server firewall-rule create \
  --resource-group seguimiento-rg \
  --server $SQL_SERVER \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Permitir tu IP actual (para migración)
MY_IP=$(curl -s https://api.ipify.org)
az sql server firewall-rule create \
  --resource-group seguimiento-rg \
  --server $SQL_SERVER \
  --name AllowMyIP \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP
```

### 2.2 Crear Azure SQL Database

```bash
# Crear database (Basic tier para empezar)
az sql db create \
  --resource-group seguimiento-rg \
  --server $SQL_SERVER \
  --name $SQL_DB \
  --service-objective Basic \
  --backup-storage-redundancy Local

# Verificar creación
az sql db show \
  --resource-group seguimiento-rg \
  --server $SQL_SERVER \
  --name $SQL_DB
```

### 2.3 Convertir Schema SQLite a SQL Server

Crear archivo `azure-schema.sql`:

```sql
-- Azure SQL Database Schema

-- Tabla users
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'user',
    name NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Tabla audit_logs
CREATE TABLE audit_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    event_type NVARCHAR(100) NOT NULL,
    details NVARCHAR(MAX),
    timestamp DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Índices para performance
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_audit_logs_email ON audit_logs(email);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_email_timestamp ON audit_logs(email, timestamp DESC);

-- Usuario admin por defecto
-- Password: Admin2024! (bcrypt hash)
INSERT INTO users (email, password, role, name, created_at, updated_at)
VALUES (
    'admin@seguimiento.com',
    '$2a$10$YourBcryptHashHere',  -- Reemplazar con hash real
    'admin',
    'Administrador',
    GETDATE(),
    GETDATE()
);
```

### 2.4 Ejecutar Schema en Azure SQL

**Opción A: Azure CLI**

```bash
# Obtener connection string
az sql db show-connection-string \
  --client sqlcmd \
  --name $SQL_DB \
  --server $SQL_SERVER

# Ejecutar schema (requiere sqlcmd instalado)
sqlcmd -S ${SQL_SERVER}.database.windows.net \
  -d $SQL_DB \
  -U $SQL_ADMIN \
  -P $SQL_PASSWORD \
  -i azure-schema.sql
```

**Opción B: Azure Data Studio**

1. Descargar [Azure Data Studio](https://docs.microsoft.com/en-us/sql/azure-data-studio/download)
2. Conectar a: `seguimiento-sql-server.database.windows.net`
3. Abrir `azure-schema.sql`
4. Ejecutar query

### 2.5 Migrar Datos de SQLite a Azure SQL

Crear script `migrate-data.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const sql = require('mssql');

// Configuración Azure SQL
const azureConfig = {
    server: 'seguimiento-sql-server.database.windows.net',
    database: 'seguimiento-db',
    user: 'sqladmin',
    password: 'Admin@Seguimiento2024!',
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

async function migrate() {
    // Abrir SQLite
    const sqliteDb = new sqlite3.Database('./database-backup.db');

    // Conectar a Azure SQL
    const pool = await sql.connect(azureConfig);

    // Migrar usuarios
    sqliteDb.all('SELECT * FROM users', async (err, users) => {
        for (const user of users) {
            await pool.request()
                .input('email', sql.NVarChar, user.email)
                .input('password', sql.NVarChar, user.password)
                .input('role', sql.NVarChar, user.role)
                .input('name', sql.NVarChar, user.name)
                .input('created_at', sql.DateTime2, new Date(user.created_at))
                .query(`
                    INSERT INTO users (email, password, role, name, created_at, updated_at)
                    VALUES (@email, @password, @role, @name, @created_at, @created_at)
                `);
        }
        console.log(`Migrados ${users.length} usuarios`);
    });

    // Migrar audit logs
    sqliteDb.all('SELECT * FROM audit_logs', async (err, logs) => {
        for (const log of logs) {
            await pool.request()
                .input('email', sql.NVarChar, log.email)
                .input('event_type', sql.NVarChar, log.event_type)
                .input('details', sql.NVarChar, log.details)
                .input('timestamp', sql.DateTime2, new Date(log.timestamp))
                .query(`
                    INSERT INTO audit_logs (email, event_type, details, timestamp)
                    VALUES (@email, @event_type, @details, @timestamp)
                `);
        }
        console.log(`Migrados ${logs.length} audit logs`);
    });

    sqliteDb.close();
    await pool.close();
}

migrate().catch(console.error);
```

Ejecutar migración:

```bash
# Instalar dependencias
npm install sqlite3 mssql

# Ejecutar migración
node migrate-data.js
```

### 2.6 Verificar Migración de Datos

```bash
# Conectar y verificar
sqlcmd -S ${SQL_SERVER}.database.windows.net \
  -d $SQL_DB \
  -U $SQL_ADMIN \
  -P $SQL_PASSWORD \
  -Q "SELECT COUNT(*) as total_users FROM users; SELECT COUNT(*) as total_logs FROM audit_logs;"
```

---

## Paso 3: Migración del Backend

### 3.1 Modificar Código del Backend

**server/db-azure.js** (nuevo archivo):

```javascript
const sql = require('mssql');
const bcrypt = require('bcryptjs');

// Configuración desde variables de entorno
const config = {
    server: process.env.AZURE_SQL_SERVER,
    database: process.env.AZURE_SQL_DATABASE,
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

async function getPool() {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
}

async function query(queryString, params = {}) {
    const pool = await getPool();
    const request = pool.request();

    // Agregar parámetros
    for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
    }

    return await request.query(queryString);
}

module.exports = { query, sql, getPool };
```

**server/routes/auth-azure.js** (actualizar queries):

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query, sql } = require('../db-azure');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const result = await query(
            'SELECT * FROM users WHERE email = @email',
            { email: email }
        );

        if (result.recordset.length === 0) {
            return res.json({ success: false, message: 'Usuario no encontrado' });
        }

        const user = result.recordset[0];

        // Verificar password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.json({ success: false, message: 'Contraseña incorrecta' });
        }

        // Log evento
        await query(
            `INSERT INTO audit_logs (email, event_type, details)
             VALUES (@email, @event_type, @details)`,
            {
                email: user.email,
                event_type: 'login',
                details: JSON.stringify({ name: user.name, role: user.role })
            }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Obtener todos los usuarios
router.get('/users', async (req, res) => {
    try {
        const { role } = req.query;

        const result = await query(
            'SELECT id, email, role, name, created_at, updated_at FROM users ORDER BY created_at DESC'
        );

        res.json({ success: true, users: result.recordset });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Crear usuario
router.post('/users', async (req, res) => {
    try {
        const { email, password, name, role, adminRole } = req.body;

        if (adminRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        // Verificar email único
        const existing = await query(
            'SELECT id FROM users WHERE email = @email',
            { email: email }
        );

        if (existing.recordset.length > 0) {
            return res.json({ success: false, message: 'El email ya existe' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        await query(
            `INSERT INTO users (email, password, role, name, created_at, updated_at)
             VALUES (@email, @password, @role, @name, GETDATE(), GETDATE())`,
            {
                email: email,
                password: hashedPassword,
                role: role || 'user',
                name: name
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Actualizar usuario
router.put('/users/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { name, role, password, adminRole } = req.body;

        if (adminRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        let queryStr = 'UPDATE users SET name = @name, role = @role, updated_at = GETDATE()';
        const params = { name, role };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            queryStr += ', password = @password';
            params.password = hashedPassword;
        }

        queryStr += ' WHERE email = @email';
        params.email = email;

        await query(queryStr, params);

        res.json({ success: true });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Eliminar usuario
router.delete('/users/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { adminRole } = req.body;

        if (adminRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        await query('DELETE FROM users WHERE email = @email', { email });

        res.json({ success: true });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Obtener audit logs
router.get('/audit-logs', async (req, res) => {
    try {
        const { email, adminRole } = req.query;

        let queryStr = 'SELECT * FROM audit_logs';
        let params = {};

        if (email && adminRole === 'admin') {
            queryStr += ' WHERE email = @email';
            params.email = email;
        }

        queryStr += ' ORDER BY timestamp DESC';

        const result = await query(queryStr, params);

        res.json({ success: true, logs: result.recordset });
    } catch (error) {
        console.error('Error obteniendo logs:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

module.exports = router;
```

**server/package.json** (actualizar dependencias):

```json
{
  "name": "seguimiento-backend-azure",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mssql": "^9.1.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

### 3.2 Crear App Service

```bash
# Crear App Service Plan (B1 tier)
az appservice plan create \
  --name seguimiento-plan \
  --resource-group seguimiento-rg \
  --location eastus \
  --sku B1 \
  --is-linux

# Crear App Service
az webapp create \
  --name seguimiento-backend \
  --resource-group seguimiento-rg \
  --plan seguimiento-plan \
  --runtime "NODE|18-lts"

# Configurar variables de entorno
az webapp config appsettings set \
  --name seguimiento-backend \
  --resource-group seguimiento-rg \
  --settings \
    AZURE_SQL_SERVER="seguimiento-sql-server.database.windows.net" \
    AZURE_SQL_DATABASE="seguimiento-db" \
    AZURE_SQL_USER="sqladmin" \
    AZURE_SQL_PASSWORD="Admin@Seguimiento2024!" \
    NODE_ENV="production"
```

### 3.3 Desplegar Backend a Azure

**Opción A: GitHub Actions (Recomendado)**

1. Obtener credenciales de deployment:

```bash
az webapp deployment list-publishing-credentials \
  --name seguimiento-backend \
  --resource-group seguimiento-rg \
  --query publishingPassword \
  --output tsv
```

2. Crear `.github/workflows/azure-backend.yml`:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches:
      - main
    paths:
      - 'server/**'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: |
        cd server
        npm install

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'seguimiento-backend'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./server
```

3. Agregar secret en GitHub:
   - Settings → Secrets → New repository secret
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Obtener con `az webapp deployment list-publishing-profiles...`

**Opción B: Azure CLI (Manual)**

```bash
# Comprimir código
cd server
zip -r ../backend.zip .

# Desplegar
az webapp deployment source config-zip \
  --name seguimiento-backend \
  --resource-group seguimiento-rg \
  --src ../backend.zip
```

### 3.4 Verificar Backend

```bash
# Obtener URL
az webapp show \
  --name seguimiento-backend \
  --resource-group seguimiento-rg \
  --query defaultHostName \
  --output tsv

# Resultado: seguimiento-backend.azurewebsites.net

# Probar health check
curl https://seguimiento-backend.azurewebsites.net/api/health

# Probar login
curl -X POST https://seguimiento-backend.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seguimiento.com","password":"Admin2024!"}'
```

---

## Paso 4: Migración del Frontend

### 4.1 Crear Static Web App

```bash
# Crear Static Web App
az staticwebapp create \
  --name seguimiento-frontend \
  --resource-group seguimiento-rg \
  --location eastus \
  --source https://github.com/marugaul/seguimiento \
  --branch main \
  --app-location "/" \
  --output-location "/" \
  --login-with-github
```

### 4.2 Actualizar Frontend para Azure

**js/auth-azure.js** (actualizar URL):

```javascript
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'seguimiento_auth';
        // URL de Azure App Service
        this.apiBaseUrl = 'https://seguimiento-backend.azurewebsites.net/api/auth';
        this.checkCurrentUser();
    }

    // ... resto del código igual
}
```

**index-azure.html** (crear nuevo):

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Seguimiento - Azure</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="app-container"></div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js"></script>

    <!-- App Scripts -->
    <script src="js/auth-azure.js"></script>
    <script src="js/excel.js"></script>
    <script src="js/charts.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

### 4.3 Configurar CORS en Backend

Actualizar `server/server.js`:

```javascript
const corsOptions = {
    origin: [
        'https://marugaul.github.io',  // GitHub Pages (fallback)
        'https://seguimiento-frontend.azurestaticapps.net'  // Azure Static Web App
    ],
    credentials: true
};

app.use(cors(corsOptions));
```

### 4.4 Desplegar Frontend

**Opción A: GitHub Actions (Automático)**

Azure Static Web Apps crea automáticamente el workflow al crear el recurso.

Verificar archivo `.github/workflows/azure-static-web-apps-*.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "/"
```

**Opción B: Manual con CLI**

```bash
# Obtener deployment token
az staticwebapp secrets list \
  --name seguimiento-frontend \
  --resource-group seguimiento-rg

# Desplegar usando SWA CLI
npm install -g @azure/static-web-apps-cli

swa deploy \
  --deployment-token <TOKEN> \
  --app-location / \
  --output-location /
```

### 4.5 Verificar Frontend

```bash
# Obtener URL
az staticwebapp show \
  --name seguimiento-frontend \
  --resource-group seguimiento-rg \
  --query defaultHostname \
  --output tsv

# Abrir en navegador
open https://seguimiento-frontend.azurestaticapps.net
```

---

## Paso 5: Configuración de Dominio

### 5.1 Configurar Dominio Personalizado (Opcional)

Si tienes un dominio (ej: `seguimiento.tuempresa.com`):

```bash
# Agregar dominio al Static Web App
az staticwebapp hostname set \
  --name seguimiento-frontend \
  --resource-group seguimiento-rg \
  --hostname seguimiento.tuempresa.com

# Obtener CNAME record
az staticwebapp hostname show \
  --name seguimiento-frontend \
  --resource-group seguimiento-rg \
  --hostname seguimiento.tuempresa.com
```

Configurar DNS:
```
Type: CNAME
Name: seguimiento
Value: seguimiento-frontend.azurestaticapps.net
TTL: 3600
```

---

## Paso 6: Testing y Validación

### 6.1 Checklist de Testing

#### Backend API

- [ ] POST /api/auth/login - Login exitoso
- [ ] POST /api/auth/login - Credenciales incorrectas
- [ ] POST /api/auth/logout - Logout
- [ ] GET /api/auth/users - Listar usuarios (admin)
- [ ] POST /api/auth/users - Crear usuario (admin)
- [ ] PUT /api/auth/users/:email - Actualizar usuario (admin)
- [ ] DELETE /api/auth/users/:email - Eliminar usuario (admin)
- [ ] GET /api/auth/audit-logs - Obtener logs

#### Frontend

- [ ] Login con usuario admin
- [ ] Login con usuario normal
- [ ] Logout
- [ ] Carga de archivo Excel
- [ ] Visualización de gráficos
- [ ] Filtros de búsqueda
- [ ] Gestión de usuarios (admin)
- [ ] Visualización de audit logs

#### Base de Datos

- [ ] Usuarios migrados correctamente
- [ ] Audit logs migrados correctamente
- [ ] Índices creados
- [ ] Queries performan <100ms

### 6.2 Script de Testing Automático

**test-azure.sh**:

```bash
#!/bin/bash

BACKEND_URL="https://seguimiento-backend.azurewebsites.net"
ADMIN_EMAIL="admin@seguimiento.com"
ADMIN_PASSWORD="Admin2024!"

echo "=== Testing Azure Backend ==="

# Test 1: Health Check
echo "1. Testing health check..."
curl -s $BACKEND_URL/api/health | jq

# Test 2: Login
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
echo $LOGIN_RESPONSE | jq

# Test 3: Get Users
echo "3. Testing get users..."
curl -s "$BACKEND_URL/api/auth/users?role=admin" | jq

# Test 4: Get Audit Logs
echo "4. Testing audit logs..."
curl -s "$BACKEND_URL/api/auth/audit-logs?adminRole=admin" | jq

echo "=== Tests Completed ==="
```

Ejecutar:

```bash
chmod +x test-azure.sh
./test-azure.sh
```

---

## Paso 7: Cutover (Cambio de Producción)

### 7.1 Plan de Cutover

**Timeline sugerido:**

- **T-1 semana**: Testing completo en Azure
- **T-1 día**: Notificar usuarios del mantenimiento
- **T-0 hora**: Ejecutar cutover
- **T+1 hora**: Validación post-cutover
- **T+1 día**: Monitoreo intensivo

### 7.2 Pasos del Cutover

**1. Backup Final**

```bash
# Backup final de Railway
railway run --service backend "sqlite3 data/database.db .dump > /tmp/final-backup.sql"
railway download /tmp/final-backup.sql ./final-backup-$(date +%Y%m%d).sql
```

**2. Sincronización Final de Datos**

```bash
# Ejecutar script de migración una vez más
node migrate-data.js --incremental
```

**3. Actualizar URLs en Producción**

Cambiar `index.html` de GitHub Pages para apuntar a Azure:

```html
<!-- Cambiar de: -->
<script src="js/auth-railway.js"></script>

<!-- A: -->
<script src="js/auth-azure.js"></script>
```

**4. Commit y Push**

```bash
git add .
git commit -m "Cutover to Azure: Update API URLs"
git push origin main
```

**5. Verificar GitHub Pages**

```bash
# Esperar 2-3 minutos para que GitHub Pages actualice
sleep 180

# Probar
curl -I https://marugaul.github.io/seguimiento/
```

**6. Notificar Usuarios**

Email template:
```
Asunto: Sistema de Seguimiento - Migración Completada

Estimados usuarios,

Hemos completado exitosamente la migración de nuestro sistema a Microsoft Azure.

URL: https://marugaul.github.io/seguimiento/
(o https://seguimiento.tuempresa.com si configuraste dominio)

Credenciales: Sin cambios (usar las mismas)

Mejoras:
✅ Mayor velocidad
✅ Mayor confiabilidad
✅ Backups automáticos

Si experimentan algún problema, reportar a: soporte@tuempresa.com

Gracias,
Equipo de TI
```

### 7.3 Rollback Plan

Si algo falla, revertir:

```bash
# 1. Cambiar URLs de vuelta a Railway
git revert HEAD
git push origin main

# 2. Notificar a usuarios
echo "Rollback ejecutado, sistema vuelve a Railway"
```

---

## Post-Migración

### 8.1 Monitoreo con Application Insights

```bash
# Crear Application Insights
az monitor app-insights component create \
  --app seguimiento-insights \
  --location eastus \
  --resource-group seguimiento-rg \
  --application-type web

# Obtener instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app seguimiento-insights \
  --resource-group seguimiento-rg \
  --query instrumentationKey \
  --output tsv)

# Configurar en App Service
az webapp config appsettings set \
  --name seguimiento-backend \
  --resource-group seguimiento-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

Agregar al backend `server/server.js`:

```javascript
const appInsights = require('applicationinsights');
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .start();
```

### 8.2 Configurar Backups Automáticos

```bash
# Habilitar backups automáticos de SQL Database
az sql db ltr-policy set \
  --resource-group seguimiento-rg \
  --server $SQL_SERVER \
  --database $SQL_DB \
  --weekly-retention P4W \
  --monthly-retention P12M \
  --yearly-retention P5Y \
  --week-of-year 1
```

### 8.3 Configurar Alerts

```bash
# Alert: SQL Database CPU > 80%
az monitor metrics alert create \
  --name "SQL CPU High" \
  --resource-group seguimiento-rg \
  --scopes $(az sql db show -g seguimiento-rg -s $SQL_SERVER -n $SQL_DB --query id -o tsv) \
  --condition "avg Percentage CPU > 80" \
  --description "SQL Database CPU usage is above 80%"

# Alert: App Service Response Time > 5s
az monitor metrics alert create \
  --name "Backend Slow Response" \
  --resource-group seguimiento-rg \
  --scopes $(az webapp show -g seguimiento-rg -n seguimiento-backend --query id -o tsv) \
  --condition "avg ResponseTime > 5000" \
  --description "Backend response time is above 5 seconds"
```

### 8.4 Desactivar Railway (Opcional)

Una vez validado Azure:

```bash
# En Railway dashboard:
# 1. Ir a Settings
# 2. Click "Delete Service"
# 3. Confirmar eliminación
```

---

## Troubleshooting

### Problema 1: "Cannot connect to database"

**Síntomas**: Backend retorna error 500, logs muestran "Connection timeout"

**Solución**:

```bash
# Verificar firewall
az sql server firewall-rule list \
  --resource-group seguimiento-rg \
  --server $SQL_SERVER

# Agregar regla para App Service
APP_SERVICE_IP=$(az webapp show \
  --resource-group seguimiento-rg \
  --name seguimiento-backend \
  --query outboundIpAddresses \
  --output tsv)

# Crear regla para cada IP
for IP in ${APP_SERVICE_IP//,/ }; do
  az sql server firewall-rule create \
    --resource-group seguimiento-rg \
    --server $SQL_SERVER \
    --name "AllowAppService-$IP" \
    --start-ip-address $IP \
    --end-ip-address $IP
done
```

### Problema 2: "CORS error"

**Síntomas**: Frontend muestra "Access to fetch blocked by CORS policy"

**Solución**:

Actualizar `server/server.js`:

```javascript
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://marugaul.github.io',
            'https://seguimiento-frontend.azurestaticapps.net',
            'http://localhost:8080'  // para desarrollo
        ];

        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
```

### Problema 3: "Users table not found"

**Síntomas**: Backend retorna "Invalid object name 'users'"

**Solución**:

```bash
# Verificar que el schema fue creado
sqlcmd -S ${SQL_SERVER}.database.windows.net \
  -d $SQL_DB \
  -U $SQL_ADMIN \
  -P $SQL_PASSWORD \
  -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES"

# Si no existe, ejecutar schema nuevamente
sqlcmd -S ${SQL_SERVER}.database.windows.net \
  -d $SQL_DB \
  -U $SQL_ADMIN \
  -P $SQL_PASSWORD \
  -i azure-schema.sql
```

### Problema 4: "Static Web App not updating"

**Síntomas**: Cambios en código no se reflejan en Azure Static Web App

**Solución**:

```bash
# Verificar deployment status
az staticwebapp show \
  --name seguimiento-frontend \
  --resource-group seguimiento-rg \
  --query "repositoryUrl,branch"

# Forzar rebuild
# GitHub Actions → Workflow → Re-run all jobs

# Limpiar caché del navegador
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

---

## Costos Estimados

### Tier Básico (Recomendado para inicio)

| Recurso | SKU | Costo Mensual |
|---------|-----|---------------|
| Azure SQL Database | Basic (5 DTU) | ~$5 USD |
| App Service Plan | B1 (1 core, 1.75GB RAM) | ~$13 USD |
| Static Web App | Free | $0 USD |
| Application Insights | Free tier | $0 USD |
| **TOTAL** | | **~$18 USD/mes** |

### Tier Producción (Recomendado para >1000 usuarios)

| Recurso | SKU | Costo Mensual |
|---------|-----|---------------|
| Azure SQL Database | S0 (10 DTU) | ~$15 USD |
| App Service Plan | S1 (1 core, 1.75GB RAM) | ~$70 USD |
| Static Web App | Standard | ~$9 USD |
| Application Insights | Pay-as-you-go | ~$5 USD |
| Azure Front Door | Standard | ~$35 USD |
| Redis Cache | Basic (250MB) | ~$16 USD |
| **TOTAL** | | **~$150 USD/mes** |

### Calculadora de Costos

Usar la calculadora oficial:
https://azure.microsoft.com/en-us/pricing/calculator/

---

## Conclusión

Esta guía proporciona un plan completo para migrar de Railway a Azure. Puntos clave:

✅ **Migración incremental**: Probar en Azure sin afectar producción
✅ **Rollback plan**: Opción de volver a Railway si hay problemas
✅ **Escalabilidad**: Azure permite crecer hasta millones de usuarios
✅ **Monitoreo**: Application Insights para visibilidad completa
✅ **Costos**: Desde $18/mes (básico) hasta $150/mes (producción)

### Recursos Adicionales

- [Azure SQL Documentation](https://docs.microsoft.com/en-us/azure/azure-sql/)
- [App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Support](https://azure.microsoft.com/en-us/support/options/)

---

**Última actualización**: 2024
**Versión**: 1.0
**Autor**: Equipo de Desarrollo - Sistema de Seguimiento
