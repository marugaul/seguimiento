# Arquitectura del Sistema - Dashboard de Seguimiento

## Índice
1. [Visión General](#visión-general)
2. [Diagrama de Arquitectura General](#diagrama-de-arquitectura-general)
3. [Componentes del Sistema](#componentes-del-sistema)
4. [Flujo de Datos](#flujo-de-datos)
5. [Diagramas de Secuencia](#diagramas-de-secuencia)
6. [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
7. [Arquitectura de Seguridad](#arquitectura-de-seguridad)
8. [Escalabilidad y Rendimiento](#escalabilidad-y-rendimiento)

---

## Visión General

El sistema está diseñado con una arquitectura **Client-Server** separada en dos capas principales:

- **Frontend (Cliente)**: Aplicación SPA (Single Page Application) alojada en GitHub Pages
- **Backend (Servidor)**: API REST en Node.js/Express alojada en Railway
- **Base de Datos**: SQLite (producción) / Potencial Azure SQL (migración futura)

### Características Clave de la Arquitectura

- ✅ **Separación de Responsabilidades**: Frontend y Backend completamente desacoplados
- ✅ **Stateless API**: Backend sin estado, usa tokens/sesiones en localStorage
- ✅ **Cross-Origin**: CORS configurado para comunicación entre dominios
- ✅ **Escalable**: Fácil migración a Azure u otros proveedores cloud
- ✅ **Segura**: Autenticación con bcrypt, passwords hasheados, validación de roles

---

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USUARIO FINAL                              │
│                     (Navegador Web Chrome/Firefox/Safari)           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (GitHub Pages)                        │
│                  https://marugaul.github.io/seguimiento             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   index.html │  │  app.js      │  │ auth-railway │             │
│  │              │  │              │  │    .js       │             │
│  │  Login UI    │  │  Dashboard   │  │              │             │
│  │  Dashboard   │  │  Logic       │  │  API Client  │             │
│  └──────────────┘  └──────────────┘  └──────┬───────┘             │
│                                              │                       │
│  ┌──────────────┐  ┌──────────────┐        │                       │
│  │  excel.js    │  │  charts.js   │        │                       │
│  │              │  │              │        │                       │
│  │  Excel       │  │  Chart.js    │        │                       │
│  │  Processing  │  │  Rendering   │        │                       │
│  └──────────────┘  └──────────────┘        │                       │
└─────────────────────────────────────────────┼───────────────────────┘
                                              │
                                              │ fetch() API calls
                                              │ JSON payload
                                              │ HTTPS + CORS
                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Railway PaaS)                           │
│        https://seguimiento-production-fa3a.up.railway.app           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐          │
│  │              Express.js Server                        │          │
│  │                 (server.js)                           │          │
│  └───────────────────────┬──────────────────────────────┘          │
│                          │                                           │
│  ┌───────────────────────┼──────────────────────────────┐          │
│  │                  Middleware                           │          │
│  │  • CORS Handler                                       │          │
│  │  • JSON Body Parser                                   │          │
│  │  • Error Handler                                      │          │
│  └───────────────────────┼──────────────────────────────┘          │
│                          │                                           │
│  ┌───────────────────────┴──────────────────────────────┐          │
│  │              API Routes (/api/auth)                   │          │
│  │  (routes/auth.js)                                     │          │
│  │                                                        │          │
│  │  POST   /login          ─┐                            │          │
│  │  POST   /logout         ─┤                            │          │
│  │  GET    /users          ─┤                            │          │
│  │  POST   /users          ─┼─► Business Logic          │          │
│  │  PUT    /users/:email   ─┤   • Validation            │          │
│  │  DELETE /users/:email   ─┤   • bcrypt hashing        │          │
│  │  GET    /audit-logs     ─┘   • Role checks           │          │
│  │                                                        │          │
│  └───────────────────────┬──────────────────────────────┘          │
│                          │                                           │
│                          ▼                                           │
│  ┌─────────────────────────────────────────────────────┐           │
│  │            Database Layer (db.js)                    │           │
│  │                                                       │           │
│  │  • Connection Pool Management                        │           │
│  │  • Query Execution                                   │           │
│  │  • Transaction Handling                              │           │
│  │  • Database Initialization                           │           │
│  └───────────────────────┬─────────────────────────────┘           │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           │ SQL Queries
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SQLite Database                                 │
│                    (data/database.db)                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐         ┌──────────────────┐                │
│  │   users table    │         │ audit_logs table │                │
│  ├──────────────────┤         ├──────────────────┤                │
│  │ • id (PK)        │         │ • id (PK)        │                │
│  │ • email (UNIQUE) │         │ • email          │                │
│  │ • password       │         │ • event_type     │                │
│  │ • role           │         │ • details        │                │
│  │ • name           │         │ • timestamp      │                │
│  │ • created_at     │         │                  │                │
│  │ • updated_at     │         │                  │                │
│  └──────────────────┘         └──────────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Componentes del Sistema

### 1. Frontend (GitHub Pages)

#### 1.1 Componentes HTML
```
index.html
├─ Login Screen
├─ Dashboard Container
│  ├─ Navigation Bar
│  ├─ Statistics Cards
│  ├─ Charts Container
│  └─ Data Tables
└─ Modals
   ├─ Create User Modal
   ├─ Edit User Modal
   └─ Audit Log Modal
```

#### 1.2 Componentes JavaScript

**app.js - Aplicación Principal**
```javascript
// Responsabilidades:
- Gestión de navegación entre páginas
- Renderizado de dashboard
- Gestión de filtros
- Procesamiento de datos Excel
- Renderizado de tablas
- Gestión CRUD de usuarios
```

**auth-railway.js - Cliente de Autenticación**
```javascript
class AuthManager {
    // Responsabilidades:
    - Comunicación con API backend
    - Gestión de sesión (localStorage)
    - Operaciones CRUD usuarios
    - Obtención de audit logs
}
```

**excel.js - Procesador de Excel**
```javascript
// Responsabilidades:
- Lectura de archivos Excel (SheetJS)
- Validación de estructura
- Transformación de datos
- Cálculo de métricas
```

**charts.js - Visualización**
```javascript
// Responsabilidades:
- Renderizado de gráficos (Chart.js)
- Actualización dinámica de datos
- Configuración de estilos
```

#### 1.3 Flujo de Datos Frontend
```
Usuario → Interacción UI → app.js → authManager → fetch() API
                             ↓
                      Actualizar Estado
                             ↓
                      Renderizar Vista
```

---

### 2. Backend (Railway)

#### 2.1 Estructura del Servidor

**server.js - Servidor Express**
```javascript
// Configuración:
- Puerto: process.env.PORT || 3000
- CORS: Permite origen GitHub Pages
- Body Parser: JSON
- Rutas: /api/auth/*
- Health Check: /api/health
```

**Middleware Stack**
```
Request
  ↓
CORS Middleware (permite cross-origin)
  ↓
Body Parser (parsea JSON)
  ↓
Routes Handler (/api/auth/*)
  ↓
Error Handler (captura errores)
  ↓
Response
```

#### 2.2 Capa de Rutas (routes/auth.js)

**Endpoints Implementados:**

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | /api/auth/login | No | Login de usuario |
| POST | /api/auth/logout | No | Logout de usuario |
| GET | /api/auth/users | Sí (role check) | Listar usuarios |
| POST | /api/auth/users | Sí (admin only) | Crear usuario |
| PUT | /api/auth/users/:email | Sí (admin only) | Actualizar usuario |
| DELETE | /api/auth/users/:email | Sí (admin only) | Eliminar usuario |
| GET | /api/auth/audit-logs | Sí (role check) | Obtener logs |

#### 2.3 Capa de Base de Datos (db.js)

**Responsabilidades:**
- Inicialización de SQLite
- Creación de tablas
- Inserción de usuario admin por defecto
- Exportación de instancia db

**Tablas Gestionadas:**
```sql
users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- bcrypt hash
    role TEXT DEFAULT 'user',
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    event_type TEXT NOT NULL,  -- 'login', 'logout', 'create_user', etc.
    details TEXT,              -- JSON string
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## Flujo de Datos

### 3.1 Flujo de Autenticación (Login)

```
┌──────────┐                                    ┌──────────┐
│  USUARIO │                                    │  BACKEND │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ 1. Ingresa email/password                     │
     │    en formulario                              │
     ├──────────────────────────────────────────────►│
     │ POST /api/auth/login                          │
     │ {email, password}                             │
     │                                               │
     │                                          2. Busca usuario
     │                                             en DB por email
     │                                               │
     │                                          3. Compara password
     │                                             bcrypt.compare()
     │                                               │
     │◄──────────────────────────────────────────────┤
     │ 4. Responde con datos usuario                 │
     │    {success, user: {id, email, name, role}}   │
     │                                               │
     │ 5. Guarda en localStorage                     │
     │    'seguimiento_auth'                    6. Registra evento
     │                                             en audit_logs
     │ 7. Redirige a dashboard                       │
     │                                               │
     ▼                                               ▼
```

### 3.2 Flujo de Creación de Usuario

```
┌──────────┐                                    ┌──────────┐
│  ADMIN   │                                    │  BACKEND │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ 1. Abre modal "Nuevo Usuario"                 │
     │    Completa formulario                        │
     ├──────────────────────────────────────────────►│
     │ POST /api/auth/users                          │
     │ {email, password, name, role, adminRole}      │
     │                                               │
     │                                          2. Verifica adminRole
     │                                             (debe ser 'admin')
     │                                               │
     │                                          3. Valida email único
     │                                             SELECT email FROM users
     │                                               │
     │                                          4. Hashea password
     │                                             bcrypt.hash(pass, 10)
     │                                               │
     │                                          5. INSERT nuevo usuario
     │                                             en tabla users
     │                                               │
     │◄──────────────────────────────────────────────┤
     │ 6. Responde success                           │
     │    {success: true, user: {...}}               │
     │                                               │
     │ 7. Cierra modal                          8. Registra evento
     │    Refresca tabla usuarios                    'create_user' en logs
     │                                               │
     ▼                                               ▼
```

### 3.3 Flujo de Procesamiento de Excel

```
┌──────────┐                                    ┌──────────┐
│  USUARIO │                                    │ FRONTEND │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ 1. Arrastra archivo .xlsx                     │
     │    a zona de drop                             │
     ├──────────────────────────────────────────────►│
     │                                               │
     │                                          2. Lee archivo
     │                                             XLSX.read(file)
     │                                               │
     │                                          3. Valida estructura
     │                                             - Columnas requeridas
     │                                             - Formato de datos
     │                                               │
     │                                          4. Procesa cada fila
     │                                             - Limpia datos
     │                                             - Calcula métricas
     │                                             - Agrupa por proyecto
     │                                               │
     │                                          5. Guarda en memoria
     │                                             window.projectData
     │                                               │
     │◄──────────────────────────────────────────────┤
     │ 6. Muestra mensaje éxito                      │
     │    "X proyectos cargados"                     │
     │                                               │
     │                                          7. Renderiza dashboard
     │                                             - Estadísticas
     │                                             - Gráficos
     │                                             - Tablas
     │                                               │
     ▼                                               ▼
```

---

## Diagramas de Secuencia

### 4.1 Secuencia Completa: Login → Dashboard → Logout

```
Usuario    Browser    Frontend(app.js)    AuthManager    Backend    Database
  │           │              │                 │            │           │
  │ Abre URL  │              │                 │            │           │
  ├──────────►│              │                 │            │           │
  │           │ Carga index.html               │            │           │
  │           ├─────────────►│                 │            │           │
  │           │              │ checkAuth()     │            │           │
  │           │              ├────────────────►│            │           │
  │           │              │                 │ Lee localStorage       │
  │           │              │                 │            │           │
  │           │              │◄────────────────┤            │           │
  │           │              │ No autenticado  │            │           │
  │           │              │                 │            │           │
  │           │◄─────────────┤                 │            │           │
  │           │ Muestra Login│                 │            │           │
  │◄──────────┤              │                 │            │           │
  │ Ve login  │              │                 │            │           │
  │           │              │                 │            │           │
  │ Ingresa credenciales     │                 │            │           │
  ├──────────►│              │                 │            │           │
  │           │ Submit form  │                 │            │           │
  │           ├─────────────►│ handleLogin()   │            │           │
  │           │              ├────────────────►│ login()    │           │
  │           │              │                 ├───────────►│ POST /login
  │           │              │                 │            ├──────────►│
  │           │              │                 │            │ SELECT user
  │           │              │                 │            │◄──────────┤
  │           │              │                 │            │ bcrypt.compare
  │           │              │                 │            ├──────────►│
  │           │              │                 │            │ INSERT log
  │           │              │                 │◄───────────┤           │
  │           │              │◄────────────────┤ {success,user}         │
  │           │              │ Guarda localStorage          │           │
  │           │              │                 │            │           │
  │           │◄─────────────┤ showDashboard() │            │           │
  │◄──────────┤ Muestra dashboard              │            │           │
  │ Ve dashboard             │                 │            │           │
  │           │              │                 │            │           │
  │ Carga Excel              │                 │            │           │
  ├──────────►│              │                 │            │           │
  │           ├─────────────►│ processExcel()  │            │           │
  │           │              │ (solo frontend) │            │           │
  │           │◄─────────────┤ Renderiza datos │            │           │
  │◄──────────┤              │                 │            │           │
  │           │              │                 │            │           │
  │ Click Logout             │                 │            │           │
  ├──────────►│              │                 │            │           │
  │           ├─────────────►│ logout()        │            │           │
  │           │              ├────────────────►│ logout()   │           │
  │           │              │                 ├───────────►│ POST /logout
  │           │              │                 │            ├──────────►│
  │           │              │                 │            │ INSERT log
  │           │              │                 │            │◄──────────┤
  │           │              │◄────────────────┤            │           │
  │           │              │ Limpia localStorage          │           │
  │           │◄─────────────┤ showLogin()     │            │           │
  │◄──────────┤ Vuelve a login                 │            │           │
  │           │              │                 │            │           │
```

### 4.2 Secuencia: Admin Gestiona Usuarios

```
Admin     Frontend    AuthManager    Backend    Database
  │           │            │            │           │
  │ Click "Gestionar Accesos"          │           │
  ├──────────►│            │            │           │
  │           │ renderManageAccessPage()│           │
  │           ├───────────►│ getAllUsers()          │
  │           │            ├───────────►│ GET /users│
  │           │            │            ├──────────►│
  │           │            │            │ SELECT * FROM users
  │           │            │            │◄──────────┤
  │           │            │◄───────────┤ [users]   │
  │           │◄───────────┤            │           │
  │           │ Renderiza tabla         │           │
  │◄──────────┤            │            │           │
  │ Ve tabla  │            │            │           │
  │           │            │            │           │
  │ Click "Nuevo Usuario"  │            │           │
  ├──────────►│ Muestra modal           │           │
  │◄──────────┤            │            │           │
  │           │            │            │           │
  │ Completa y envía formulario         │           │
  ├──────────►│ handleCreateUser()      │           │
  │           ├───────────►│ createUser()           │
  │           │            ├───────────►│ POST /users
  │           │            │            ├──────────►│
  │           │            │            │ bcrypt.hash(password)
  │           │            │            ├──────────►│
  │           │            │            │ INSERT user
  │           │            │            │◄──────────┤
  │           │            │◄───────────┤ {success} │
  │           │◄───────────┤            │           │
  │           │ Cierra modal│            │           │
  │           │ Refresca tabla           │           │
  │◄──────────┤            │            │           │
  │ Ve usuario nuevo       │            │           │
  │           │            │            │           │
```

---

## Arquitectura de Base de Datos

### 5.1 Modelo Relacional

```
┌─────────────────────────────────────┐
│             users                   │
├─────────────────────────────────────┤
│ PK │ id          INTEGER            │
│ UK │ email       TEXT               │
│    │ password    TEXT (bcrypt hash) │
│    │ role        TEXT ('admin'|'user')
│    │ name        TEXT               │
│    │ created_at  DATETIME           │
│    │ updated_at  DATETIME           │
└──────────────┬──────────────────────┘
               │
               │ 1:N
               │ (email)
               │
               ▼
┌─────────────────────────────────────┐
│          audit_logs                 │
├─────────────────────────────────────┤
│ PK │ id          INTEGER            │
│ FK │ email       TEXT               │
│    │ event_type  TEXT               │
│    │ details     TEXT (JSON)        │
│    │ timestamp   DATETIME           │
└─────────────────────────────────────┘
```

### 5.2 Índices Sugeridos

```sql
-- Índice único en email para búsquedas rápidas
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Índice en role para filtrado de permisos
CREATE INDEX idx_users_role ON users(role);

-- Índice en audit_logs por email
CREATE INDEX idx_audit_logs_email ON audit_logs(email);

-- Índice en audit_logs por timestamp (para consultas recientes)
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Índice compuesto para consultas filtradas
CREATE INDEX idx_audit_logs_email_timestamp
ON audit_logs(email, timestamp DESC);
```

### 5.3 Ejemplo de Consultas Típicas

**Login - Buscar usuario por email:**
```sql
SELECT id, email, password, role, name, created_at
FROM users
WHERE email = 'admin@seguimiento.com'
LIMIT 1;
```

**Listar usuarios (Admin):**
```sql
SELECT id, email, role, name, created_at, updated_at
FROM users
ORDER BY created_at DESC;
```

**Audit log por usuario:**
```sql
SELECT event_type, details, timestamp
FROM audit_logs
WHERE email = 'admin@seguimiento.com'
ORDER BY timestamp DESC
LIMIT 50;
```

**Todos los audit logs (Admin):**
```sql
SELECT id, email, event_type, details, timestamp
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 100;
```

---

## Arquitectura de Seguridad

### 6.1 Capas de Seguridad

```
┌──────────────────────────────────────────────────────────┐
│                    Capa 1: HTTPS/TLS                     │
│  • GitHub Pages: HTTPS automático                        │
│  • Railway: HTTPS con certificado SSL                    │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    Capa 2: CORS                          │
│  • Origin permitido: marugaul.github.io                  │
│  • Métodos: GET, POST, PUT, DELETE                       │
│  • Headers: Content-Type, Authorization                  │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Capa 3: Autenticación                       │
│  • bcrypt password hashing (10 rounds)                   │
│  • localStorage para sesión                              │
│  • Validación email/password                             │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Capa 4: Autorización                        │
│  • Role-based: 'admin' vs 'user'                         │
│  • Validación en backend (adminRole check)              │
│  • Operaciones CRUD: solo admin                          │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Capa 5: Auditoría                           │
│  • Log de login/logout                                   │
│  • Log de operaciones CRUD                               │
│  • Timestamp + detalles en audit_logs                    │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│            Capa 6: Validación de Datos                   │
│  • Validación email format                               │
│  • Password strength (mínimo 8 caracteres)               │
│  • Sanitización de inputs                                │
│  • Prepared statements (SQLite)                          │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Flujo de Seguridad en Login

```
1. Usuario envía: {email: "admin@...", password: "Admin2024!"}
   │
   ▼
2. HTTPS/TLS encripta la transmisión
   │
   ▼
3. CORS verifica origen permitido
   │
   ▼
4. Backend busca usuario por email
   │
   ▼
5. bcrypt.compare(plainPassword, hashedPassword)
   │
   ├─ Si falla ──► Responde: {success: false, message: "Credenciales inválidas"}
   │
   └─ Si pasa ──►
                 │
                 ▼
6. Verifica role (admin/user)
   │
   ▼
7. Registra evento en audit_logs
   │
   ▼
8. Responde: {success: true, user: {id, email, name, role}}
   │
   ▼
9. Frontend guarda en localStorage (solo datos públicos, NO password)
```

---

## Escalabilidad y Rendimiento

### 7.1 Limitaciones Actuales (SQLite + Railway)

| Aspecto | Límite Actual | Recomendación |
|---------|---------------|---------------|
| Conexiones concurrentes | ~50-100 | Para >100: migrar a PostgreSQL |
| Tamaño DB | ~1 GB (Railway free) | Monitorear uso de disco |
| Memoria | 512 MB (Railway free) | Optimizar queries |
| CPU | Compartida | Para alta carga: plan Pro |
| Escritura concurrente | 1 thread (SQLite) | Para alta concurrencia: SQL Server |

### 7.2 Optimizaciones Implementadas

**Frontend:**
- ✅ Lazy loading de gráficos
- ✅ Caché de datos en memoria (window.projectData)
- ✅ Procesamiento Excel en cliente (reduce carga backend)
- ✅ Debounce en filtros de búsqueda

**Backend:**
- ✅ Queries optimizadas con índices
- ✅ Prepared statements (previene SQL injection)
- ✅ Respuestas sin datos sensibles (no retorna passwords)
- ✅ Error handling centralizado

### 7.3 Plan de Escalabilidad

**Fase 1: Optimización SQLite (0-1000 usuarios)**
```
- Mantener arquitectura actual
- Agregar índices adicionales
- Monitorear performance
- Implementar caching con Redis (opcional)
```

**Fase 2: Migración a Azure SQL (1000-10000 usuarios)**
```
- Migrar de SQLite a Azure SQL Database
- Implementar connection pooling
- Agregar CDN para assets estáticos
- Separar frontend en Azure Static Web Apps
```

**Fase 3: Arquitectura Escalable (>10000 usuarios)**
```
- Microservicios:
  ├─ Servicio de Autenticación (Azure AD B2C)
  ├─ Servicio de Datos (Azure SQL + Cosmos DB)
  └─ Servicio de Analytics (Azure Analysis Services)

- Load Balancer: Azure Application Gateway
- Cache: Azure Redis Cache
- Storage: Azure Blob Storage (para Excel files)
- Monitoring: Azure Monitor + Application Insights
```

### 7.4 Diagrama de Arquitectura Escalada (Futuro Azure)

```
                         ┌─────────────────┐
                         │   Azure CDN     │
                         │  (Static Assets)│
                         └────────┬────────┘
                                  │
┌───────────┐            ┌────────▼────────┐
│  Usuarios │───HTTPS───►│ Application     │
└───────────┘            │ Gateway         │
                         │ (Load Balancer) │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼────────┐         ┌────────▼───────┐
            │   Static Web   │         │  App Service   │
            │   Apps         │         │  (Backend API) │
            │  (Frontend)    │         │                │
            └────────────────┘         └────────┬───────┘
                                                 │
                                    ┌────────────┼────────────┐
                                    │            │            │
                            ┌───────▼──────┐ ┌──▼─────┐ ┌────▼────┐
                            │  Azure SQL   │ │ Redis  │ │  Blob   │
                            │  Database    │ │ Cache  │ │ Storage │
                            └──────────────┘ └────────┘ └─────────┘
```

---

## Conclusiones

### Fortalezas de la Arquitectura Actual

1. ✅ **Simplicidad**: Fácil de entender y mantener
2. ✅ **Separación clara**: Frontend/Backend desacoplados
3. ✅ **Costo**: GitHub Pages + Railway free tier = $0/mes
4. ✅ **Seguridad**: bcrypt, CORS, role-based access
5. ✅ **Escalable**: Fácil migración a Azure

### Áreas de Mejora

1. ⚠️ **Autenticación**: Considerar JWT tokens en lugar de localStorage
2. ⚠️ **Caché**: Implementar Redis para queries frecuentes
3. ⚠️ **Monitoring**: Agregar Application Insights
4. ⚠️ **Testing**: Implementar tests unitarios e integración
5. ⚠️ **CI/CD**: Automatizar despliegue con GitHub Actions

---

**Última actualización**: 2024
**Versión**: 1.0
**Autor**: Equipo de Desarrollo - Sistema de Seguimiento
