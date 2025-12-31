# Manual Técnico
## Sistema de Seguimiento de Proyectos

**Versión:** 2.0
**Fecha:** Diciembre 2025
**Audiencia:** Desarrolladores, Personal de IT, DevOps

---

## 📑 Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Base de Datos](#base-de-datos)
5. [API Backend](#api-backend)
6. [Frontend](#frontend)
7. [Deployment](#deployment)
8. [Seguridad](#seguridad)
9. [Monitoreo y Logs](#monitoreo-y-logs)
10. [Troubleshooting](#troubleshooting)
11. [Mantenimiento](#mantenimiento)

---

## 🏗️ Arquitectura del Sistema

### **Diagrama de Arquitectura**

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIOS                             │
│              (Navegadores Web)                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
    ┌────────────▼────────────┬─────────────────────────┐
    │                         │                         │
┌───▼─────────────────┐  ┌───▼─────────────────┐  ┌───▼──────────┐
│  GitHub Pages       │  │  Railway            │  │  CDN         │
│  (Frontend)         │  │  (Backend)          │  │  (Assets)    │
│                     │  │                     │  │              │
│  - HTML/CSS/JS      │  │  - Node.js/Express  │  │  - Bootstrap │
│  - SPA              │  │  - SQLite           │  │  - Chart.js  │
│  - Static Site      │  │  - API REST         │  │  - Icons     │
└─────────────────────┘  └──────┬──────────────┘  └──────────────┘
                                │
                         ┌──────▼──────────┐
                         │   SQLite DB     │
                         │                 │
                         │  - users        │
                         │  - audit_logs   │
                         └─────────────────┘
```

### **Flujo de Datos**

```
1. Usuario accede a GitHub Pages
   ↓
2. Se carga el frontend (HTML/CSS/JS)
   ↓
3. Usuario hace login
   ↓
4. Frontend → POST /api/auth/login → Backend Railway
   ↓
5. Backend valida credenciales en SQLite
   ↓
6. Backend retorna token de sesión
   ↓
7. Frontend guarda sesión en localStorage
   ↓
8. Usuario carga Excel
   ↓
9. Frontend procesa Excel (client-side con SheetJS)
   ↓
10. Frontend muestra dashboard con datos procesados
```

### **Componentes Principales**

| Componente | Tecnología | Función | Hosting |
|-----------|-----------|---------|---------|
| **Frontend** | HTML/CSS/JS | Interfaz de usuario | GitHub Pages |
| **Backend API** | Node.js/Express | Autenticación y lógica | Railway |
| **Base de Datos** | SQLite | Almacenamiento de usuarios | Railway (volumen) |
| **Excel Parser** | SheetJS (xlsx.js) | Procesamiento de archivos | Cliente (browser) |
| **Gráficos** | Chart.js | Visualización de datos | Cliente (browser) |

---

## 💻 Stack Tecnológico

### **Frontend**

```javascript
// Core
- Vanilla JavaScript (ES6+)
- HTML5
- CSS3

// Frameworks & Libraries
- Bootstrap 5.3.0          // UI Framework
- Bootstrap Icons 1.11.0   // Iconos
- Chart.js 4.4.0          // Gráficos
- SheetJS (xlsx) 0.20.1   // Procesamiento Excel

// Hosting
- GitHub Pages            // Static site hosting
```

### **Backend**

```javascript
// Runtime
- Node.js >= 14.0.0

// Framework
- Express.js 4.18.2       // Web framework

// Base de Datos
- SQLite3 5.1.6           // Database

// Seguridad
- bcryptjs 2.4.3          // Password hashing

// Utilidades
- cors 2.8.5              // Cross-Origin Resource Sharing
- dotenv 16.3.1           // Environment variables
- body-parser 1.20.2      // Request parsing

// Hosting
- Railway                 // PaaS hosting
```

### **DevOps & Tools**

```bash
- Git/GitHub              // Control de versiones
- GitHub Actions          // CI/CD (potencial)
- Railway CLI             // Deployment
```

---

## 📁 Estructura del Proyecto

```
seguimiento/
│
├── index.html                    # Página principal (versión localStorage)
├── index-railway.html            # Página con backend Railway
│
├── css/
│   └── style.css                 # Estilos personalizados
│
├── js/
│   ├── auth.js                   # Autenticación localStorage (legacy)
│   ├── auth-railway.js           # Autenticación con API Railway
│   ├── app.js                    # Lógica principal de la aplicación
│   ├── dashboard.js              # Lógica del dashboard
│   ├── excel.js                  # Procesamiento de archivos Excel
│   └── storage.js                # Manejo de localStorage
│
├── server/                       # Backend Node.js
│   ├── server.js                 # Servidor Express principal
│   ├── db.js                     # Configuración de SQLite
│   ├── routes/
│   │   └── auth.js               # Rutas de autenticación
│   ├── package.json              # Dependencias del backend
│   ├── .env.example              # Variables de entorno ejemplo
│   ├── .gitignore                # Archivos ignorados
│   ├── railway.json              # Configuración Railway
│   ├── Procfile                  # Comando de inicio
│   └── README.md                 # Documentación del backend
│
├── DOCUMENTS/                    # Documentación del proyecto
│   ├── README.md                 # Índice de documentación
│   ├── MANUAL_TECNICO.md         # Este archivo
│   ├── MANUAL_USUARIO.md         # Manual para usuarios
│   ├── ARQUITECTURA.md           # Diagramas de arquitectura
│   ├── MIGRACION_AZURE.md        # Guía migración a Azure
│   └── MANTENIMIENTO_RAILWAY.md  # Guía mantenimiento Railway
│
├── BACKEND_SETUP.md              # Guía setup del backend
├── RAILWAY_DEPLOY.md             # Guía deployment Railway
│
└── README.md                     # README principal del proyecto
```

### **Descripción de Archivos Clave**

#### **Frontend**

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `index-railway.html` | Página principal con backend Railway | ~150 |
| `js/auth-railway.js` | Gestión de autenticación vía API | ~230 |
| `js/app.js` | Lógica de UI y gestión de eventos | ~630 |
| `js/dashboard.js` | Procesamiento y renderizado del dashboard | ~900 |
| `js/excel.js` | Parsing de archivos Excel | ~200 |
| `css/style.css` | Estilos personalizados | ~190 |

#### **Backend**

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `server/server.js` | Servidor Express principal | ~30 |
| `server/db.js` | Inicialización de SQLite | ~65 |
| `server/routes/auth.js` | Endpoints de autenticación | ~200 |

---

## 🗄️ Base de Datos

### **SQLite Schema**

#### **Tabla: users**

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,           -- bcrypt hash
    role TEXT DEFAULT 'user',         -- 'admin' o 'user'
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Ejemplo de registro:**
```json
{
  "id": 1,
  "email": "admin@seguimiento.com",
  "password": "$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "role": "admin",
  "name": "Administrador",
  "created_at": "2025-12-31 10:30:00",
  "updated_at": "2025-12-31 10:30:00"
}
```

#### **Tabla: audit_logs**

```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    event_type TEXT NOT NULL,        -- 'login', 'logout', 'login_failed'
    details TEXT,                     -- JSON string
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_logs_email ON audit_logs(email);
CREATE INDEX idx_logs_timestamp ON audit_logs(timestamp);
```

**Ejemplo de registro:**
```json
{
  "id": 1,
  "email": "admin@seguimiento.com",
  "event_type": "login",
  "details": "{\"name\":\"Administrador\",\"role\":\"admin\"}",
  "timestamp": "2025-12-31 10:30:00"
}
```

### **Ubicación de la Base de Datos**

```
Railway: /app/server/seguimiento.db (volumen persistente)
Local: /server/seguimiento.db
```

### **Backup de Base de Datos**

```bash
# Desde Railway CLI
railway run sqlite3 seguimiento.db .dump > backup_$(date +%Y%m%d).sql

# Restaurar
railway run sqlite3 seguimiento.db < backup_20251231.sql
```

---

## 🔌 API Backend

### **Base URL**

```
Producción: https://seguimiento-production-fa3a.up.railway.app
Desarrollo: http://localhost:3000
```

### **Endpoints Disponibles**

#### **1. Health Check**

```http
GET /api/health
```

**Respuesta:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

#### **2. Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "user": {
    "email": "usuario@ejemplo.com",
    "role": "admin",
    "name": "Nombre Usuario",
    "loginTime": "2025-12-31T10:30:00.000Z"
  }
}
```

**Respuesta Error:**
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

#### **3. Logout**

```http
POST /api/auth/logout
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta:**
```json
{
  "success": true
}
```

#### **4. Obtener Usuarios (Admin)**

```http
GET /api/auth/users?role=admin
```

**Respuesta:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "admin@seguimiento.com",
      "role": "admin",
      "name": "Administrador",
      "created_at": "2025-12-31 10:30:00"
    }
  ]
}
```

#### **5. Crear Usuario (Admin)**

```http
POST /api/auth/users
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "password": "Password123!",
  "name": "Nuevo Usuario",
  "role": "user",
  "adminRole": "admin"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "userId": 2
}
```

#### **6. Actualizar Usuario (Admin)**

```http
PUT /api/auth/users/:email
Content-Type: application/json

{
  "name": "Nombre Actualizado",
  "password": "NuevaPassword123!",
  "role": "admin",
  "adminRole": "admin"
}
```

#### **7. Eliminar Usuario (Admin)**

```http
DELETE /api/auth/users/:email
Content-Type: application/json

{
  "adminRole": "admin"
}
```

#### **8. Obtener Audit Logs (Admin)**

```http
GET /api/auth/audit-logs?adminRole=admin&email=usuario@ejemplo.com
```

**Respuesta:**
```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "event_type": "login",
      "details": {
        "name": "Usuario",
        "role": "user"
      },
      "timestamp": "2025-12-31T10:30:00.000Z"
    }
  ]
}
```

### **Códigos de Estado HTTP**

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Credenciales incorrectas |
| 403 | Forbidden | Sin permisos (no admin) |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## 🎨 Frontend

### **Arquitectura Frontend**

```
Single Page Application (SPA)
├── No framework (Vanilla JS)
├── Bootstrap 5 para UI
├── Client-side rendering
└── localStorage para sesión
```

### **Módulos JavaScript**

#### **auth-railway.js**

**Clase Principal:** `AuthManager`

**Métodos Públicos:**
```javascript
class AuthManager {
  // Constructor
  constructor()

  // Autenticación
  async login(email, password)
  async logout()
  isAuthenticated()
  getCurrentUser()
  isAdmin()

  // Gestión de usuarios
  async getAllUsers()
  async createUser(userData)
  async updateUser(email, updates)
  async deleteUser(email)

  // Audit logs
  async getAuditLogs(email = null)
}
```

**Ejemplo de uso:**
```javascript
// Login
const result = await authManager.login('user@example.com', 'password');
if (result.success) {
  console.log('Login exitoso');
}

// Crear usuario (admin only)
const user = await authManager.createUser({
  email: 'new@example.com',
  name: 'Nuevo Usuario',
  password: 'Pass123!',
  role: 'user'
});
```

#### **dashboard.js**

**Clase Principal:** `Dashboard`

**Funcionalidades:**
- Procesamiento de datos de Excel
- Cálculos de métricas
- Generación de gráficos
- Filtrado y búsqueda
- Ordenamiento de tablas

**Estructura de datos:**
```javascript
{
  nombre: "PROYECTO-001",
  gerente: "Nombre Gerente",
  totalEstimacion: 100,
  totalRegistrado: 80,
  avanceRealNumerico: 75,
  porcentajeDesviacion: 5,
  porcentajePresupuestoUsado: 80,
  difAvanceVsPresupuesto: 5,
  fecRegistroIniciativa: "31/12/2025"
}
```

#### **excel.js**

**Funciones Principales:**
```javascript
function handleFileUpload(event)
function processExcelFile(file)
function parseExcelToJSON(workbook)
```

### **LocalStorage Schema**

```javascript
// Sesión del usuario
localStorage.setItem('seguimiento_auth', JSON.stringify({
  email: "usuario@ejemplo.com",
  role: "admin",
  name: "Nombre Usuario",
  loginTime: "2025-12-31T10:30:00.000Z"
}));
```

---

## 🚀 Deployment

### **Frontend (GitHub Pages)**

**Branch:** `claude/gh-pages-l9p9C`

**Configuración:**
1. Repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `claude/gh-pages-l9p9C`
4. Folder: `/ (root)`

**URL Resultante:**
```
https://marugaul.github.io/seguimiento/index-railway.html
```

**Actualizar Frontend:**
```bash
git checkout claude/gh-pages-l9p9C
# Hacer cambios
git add .
git commit -m "Update frontend"
git push origin claude/gh-pages-l9p9C
# GitHub Pages actualiza automáticamente en 1-2 minutos
```

### **Backend (Railway)**

**Proyecto:** `seguimiento`
**URL:** `https://seguimiento-production-fa3a.up.railway.app`

**Variables de Entorno:**
```bash
PORT=3000                    # Auto-configurado por Railway
NODE_ENV=production
```

**Deployment:**

**Opción 1: Auto-deploy (configurado)**
```bash
git push origin claude/project-tracking-dashboard-l9p9C
# Railway detecta cambios y redespliega automáticamente
```

**Opción 2: Manual con Railway CLI**
```bash
cd server
railway login
railway up
```

**Logs:**
```bash
railway logs
# O en Dashboard → Deployments → View Logs
```

---

## 🔒 Seguridad

### **Implementaciones de Seguridad**

#### **1. Autenticación**

```javascript
// Passwords hasheadas con bcrypt (10 rounds)
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

#### **2. Validación de Roles**

```javascript
// Middleware de autenticación
if (adminRole !== 'admin') {
  return res.status(403).json({
    success: false,
    message: 'Solo administradores'
  });
}
```

#### **3. Protección contra Eliminación**

```javascript
// No permite eliminar el último admin
const adminCount = await db.get('SELECT COUNT(*) FROM users WHERE role = ?', ['admin']);
if (user.role === 'admin' && adminCount.count === 1) {
  return res.status(400).json({
    message: 'No se puede eliminar el último administrador'
  });
}
```

#### **4. CORS Configurado**

```javascript
// server.js
app.use(cors()); // Permite todos los orígenes en desarrollo
// En producción, restringir:
app.use(cors({
  origin: 'https://marugaul.github.io'
}));
```

#### **5. SQL Injection Prevention**

```javascript
// Uso de prepared statements
db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
// NO usar string concatenation
```

### **Mejoras de Seguridad Futuras**

```javascript
// TODO: Implementar
- [ ] JWT tokens con expiración
- [ ] Rate limiting (express-rate-limit)
- [ ] Helmet.js para headers de seguridad
- [ ] Password reset con tokens
- [ ] 2FA (autenticación de dos factores)
- [ ] Session timeout
- [ ] CSRF protection
```

---

## 📊 Monitoreo y Logs

### **Railway Logs**

**Acceder a logs:**
```bash
# Via CLI
railway logs

# Via Dashboard
https://railway.app → Proyecto → Deployments → Logs
```

**Tipos de logs:**
```javascript
// Info
console.log('Connected to SQLite database');

// Error
console.error('Database error:', err.message);

// Debug
console.debug('User created:', userId);
```

### **Métricas en Railway**

**Dashboard de Railway muestra:**
- CPU usage
- Memory usage
- Request count
- Response times
- Deployment history

**Alertas:**
```
Settings → Notifications
- Deployment failed
- High memory usage
- Service down
```

### **Audit Logs en Aplicación**

**Eventos registrados:**
- `login`: Login exitoso
- `logout`: Logout
- `login_failed`: Intento fallido

**Query de ejemplo:**
```sql
SELECT * FROM audit_logs
WHERE email = 'usuario@ejemplo.com'
ORDER BY timestamp DESC
LIMIT 50;
```

---

## 🔧 Troubleshooting

### **Problema: Usuario no puede hacer login**

**Síntomas:**
- Error "Usuario no encontrado"
- Error "Contraseña incorrecta"

**Diagnóstico:**
```bash
# 1. Verificar que el backend está corriendo
curl https://seguimiento-production-fa3a.up.railway.app/api/health

# 2. Ver logs del backend
railway logs

# 3. Verificar usuario en base de datos
railway run sqlite3 seguimiento.db "SELECT * FROM users WHERE email='usuario@ejemplo.com';"
```

**Soluciones:**
1. Verificar que el usuario existe en la base de datos
2. Resetear contraseña del usuario
3. Verificar que el backend está desplegado correctamente

### **Problema: Frontend no se actualiza**

**Síntomas:**
- Cambios no se reflejan en la página
- Versión antigua del código

**Soluciones:**
```bash
# 1. Limpiar caché del navegador
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)

# 2. Verificar que los cambios están en GitHub
git log --oneline -5

# 3. Verificar deployment de GitHub Pages
Settings → Pages → Ver fecha de último deployment
```

### **Problema: Error 500 en API**

**Diagnóstico:**
```bash
# Ver logs del servidor
railway logs --tail

# Ver stack trace completo
```

**Causas comunes:**
1. Error en base de datos (tabla no existe)
2. Variable de entorno faltante
3. Error en código (typo, null reference)

**Solución:**
1. Ver logs para identificar la línea exacta
2. Corregir el error
3. Redesplegar

### **Problema: Base de datos corrupta**

**Síntomas:**
- Error "database disk image is malformed"
- Queries fallan

**Solución:**
```bash
# 1. Backup inmediato
railway run sqlite3 seguimiento.db .dump > backup_emergency.sql

# 2. Crear nueva base de datos
railway run rm seguimiento.db

# 3. Restaurar desde backup
railway run sqlite3 seguimiento.db < backup_emergency.sql

# 4. Reiniciar servicio
railway restart
```

---

## 🔨 Mantenimiento

### **Tareas Diarias**
- [ ] Verificar que el sistema está accesible
- [ ] Revisar logs en busca de errores

### **Tareas Semanales**
- [ ] Backup de base de datos
- [ ] Revisar audit logs
- [ ] Verificar uso de recursos en Railway

### **Tareas Mensuales**
- [ ] Actualizar dependencias npm
- [ ] Revisar usuarios inactivos
- [ ] Limpiar logs antiguos (>90 días)
- [ ] Revisar métricas de uso

### **Scripts de Mantenimiento**

**Backup automatizado:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
railway run sqlite3 seguimiento.db .dump > backups/backup_$DATE.sql
echo "Backup creado: backup_$DATE.sql"
```

**Limpiar audit logs antiguos:**
```sql
DELETE FROM audit_logs
WHERE timestamp < datetime('now', '-90 days');
```

---

## 📚 Referencias

### **Documentación Oficial**
- [Node.js](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [SQLite](https://sqlite.org/docs.html)
- [Railway](https://docs.railway.app/)
- [Chart.js](https://www.chartjs.org/docs/)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/)

### **Repositorio**
```
https://github.com/marugaul/seguimiento
```

### **Contacto**
```
IT Support: [Insertar contacto]
Admin Sistema: admin@seguimiento.com
```

---

**Última actualización:** 31 de Diciembre, 2025
**Versión del documento:** 1.0
