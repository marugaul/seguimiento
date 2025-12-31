# 🚀 Guía de Deployment en Railway

Esta guía te ayudará a desplegar el backend en Railway **sin afectar** tu versión actual de GitHub Pages.

## 📋 Requisitos Previos

- Cuenta en GitHub (ya la tienes)
- Cuenta en Railway (crear gratis en https://railway.app)

## 🎯 Estrategia de Deployment

```
Producción Actual (NO TOCAR):
├── GitHub Pages → Frontend actual
└── localStorage → Usuarios actuales

Ambiente de Pruebas (NUEVO):
├── GitHub Pages → Mismo frontend
├── Railway → Backend con SQLite
└── Base de datos centralizada
```

## 📦 Opción 1: Deploy con Railway CLI (Recomendado)

### Paso 1: Instalar Railway CLI

```bash
# Usando npm
npm install -g @railway/cli

# O usando Homebrew (Mac)
brew install railway
```

### Paso 2: Login en Railway

```bash
railway login
```

Esto abrirá tu navegador para autenticarte con GitHub.

### Paso 3: Navegar a la carpeta del servidor

```bash
cd server
```

### Paso 4: Inicializar proyecto Railway

```bash
railway init
```

Te preguntará:
- **Project name:** `seguimiento-backend` (o el que prefieras)
- **Environment:** `production`

### Paso 5: Desplegar

```bash
railway up
```

Esto subirá todo el código y desplegará el servidor.

### Paso 6: Obtener la URL

```bash
railway domain
```

O generar un dominio:

```bash
railway domain generate
```

Te dará una URL como: `https://seguimiento-backend-production.up.railway.app`

### Paso 7: Verificar que funciona

```bash
# Probar health check
curl https://TU-URL-RAILWAY.up.railway.app/api/health

# Deberías ver:
# {"status":"OK","message":"Server is running"}
```

## 📦 Opción 2: Deploy desde la Web de Railway (Más Fácil)

### Paso 1: Ir a Railway

1. Abrir https://railway.app
2. Click en "Start a New Project"
3. Seleccionar "Deploy from GitHub repo"

### Paso 2: Seleccionar el Repositorio

1. Autorizar Railway a acceder a tu GitHub
2. Seleccionar el repo `marugaul/seguimiento`
3. Railway detectará automáticamente el proyecto

### Paso 3: Configurar el Root Directory

⚠️ **IMPORTANTE:** Railway necesita saber que el código está en `/server`

1. En el dashboard del proyecto, ir a "Settings"
2. En "Root Directory" poner: `server`
3. Click "Save"

### Paso 4: Agregar Variables de Entorno (Opcional)

Por defecto, el servidor usa:
- `PORT=3000` (Railway lo configura automáticamente)
- `NODE_ENV=development`

Si quieres cambiarlas:
1. Ir a "Variables"
2. Agregar: `NODE_ENV` = `production`

### Paso 5: Deploy

1. Railway empezará a desplegar automáticamente
2. Esperar 2-3 minutos
3. Ver los logs en tiempo real

### Paso 6: Generar Dominio Público

1. Ir a "Settings" → "Networking"
2. Click "Generate Domain"
3. Railway te dará una URL como: `seguimiento-backend-production.up.railway.app`
4. **COPIAR ESA URL** 📋

## 🔧 Configurar el Frontend para Usar Railway

### Opción A: Probar Localmente (Recomendado)

1. **Crear una copia local de index.html:**

```bash
cp index.html index-railway.html
```

2. **Editar `index-railway.html` línea donde carga auth.js:**

```html
<!-- Cambiar de: -->
<script src="js/auth.js"></script>

<!-- A: -->
<script src="js/auth-railway.js"></script>
```

3. **Editar `js/auth-railway.js` línea 8:**

```javascript
// Cambiar de:
this.apiBaseUrl = 'https://TU-APP-RAILWAY.up.railway.app/api/auth';

// A (tu URL real):
this.apiBaseUrl = 'https://seguimiento-backend-production.up.railway.app/api/auth';
```

4. **Abrir `index-railway.html` en tu navegador localmente**

5. **Probar login:**
   - Email: `admin@seguimiento.com`
   - Password: `Admin2024!`

### Opción B: Crear Branch de Pruebas (Si quieres en GitHub Pages)

```bash
# Crear branch separado para pruebas
git checkout -b railway-test

# Editar js/auth.js con la URL de Railway
# (editar línea 6)

# Commit
git add .
git commit -m "Test: Connect to Railway backend"

# Push
git push origin railway-test

# Ir a Settings → Pages
# Cambiar branch a "railway-test"
```

Ahora GitHub Pages mostrará la versión con Railway.

**Para volver a la versión original:**
- Settings → Pages → Cambiar branch a "main"

## ✅ Verificación del Deployment

### 1. Backend funcionando

```bash
curl https://TU-URL-RAILWAY.up.railway.app/api/health
```

Debería responder:
```json
{"status":"OK","message":"Server is running"}
```

### 2. Login funcionando

```bash
curl -X POST https://TU-URL-RAILWAY.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seguimiento.com","password":"Admin2024!"}'
```

Debería responder con un usuario:
```json
{
  "success": true,
  "user": {
    "email": "admin@seguimiento.com",
    "role": "admin",
    "name": "Administrador",
    ...
  }
}
```

### 3. Base de datos creada

En el dashboard de Railway:
1. Ir a "Data"
2. Deberías ver el archivo `seguimiento.db`

## 🔍 Troubleshooting

### Error: "Cannot connect to server"

**Causa:** El frontend no puede conectar con Railway

**Solución:**
1. Verificar que la URL en `auth-railway.js` es correcta
2. Verificar que el servidor esté corriendo en Railway
3. Revisar logs en Railway dashboard

### Error: "CORS policy"

**Causa:** Railway bloqueó la petición por CORS

**Solución:**
Ya está configurado en `server.js`:
```javascript
app.use(cors()); // Acepta todos los orígenes
```

Si necesitas restringir:
```javascript
app.use(cors({
  origin: 'https://marugaul.github.io'
}));
```

### Error: "Application failed to start"

**Causa:** Railway no encontró el código

**Solución:**
1. Verificar que "Root Directory" = `server`
2. Verificar que existe `package.json` en `/server`
3. Ver logs en Railway dashboard

## 📊 Monitoreo

### Ver Logs en Railway

```bash
railway logs
```

O en el dashboard: "Deployments" → Click en deployment → "View Logs"

### Ver Métricas

En Railway dashboard:
- CPU usage
- Memory usage
- Request count
- Response times

## 💰 Costos

Railway Free Tier:
- **$5 de crédito mensual** (renueva cada mes)
- **~500 horas de ejecución**
- Para este proyecto: **GRATIS permanentemente**

Monitorear uso:
- Dashboard → "Usage"
- Ver cuánto crédito queda

## 🔄 Actualizaciones Futuras

Railway hace **auto-deploy** desde GitHub:

1. Haces cambios en `/server`
2. Commit y push
3. Railway detecta el cambio
4. Redeploy automático

**Deshabilitar auto-deploy:**
- Settings → "Deployments" → Desactivar "Auto Deploy"

## 📝 Próximos Pasos

Una vez que confirmes que Railway funciona:

1. ✅ Crear usuarios de prueba
2. ✅ Probar desde diferentes computadoras
3. ✅ Verificar que la bitácora funciona
4. ✅ Cuando esté estable → migrar GitHub Pages a usar Railway
5. ✅ Después → migrar a Azure empresarial si es necesario

## 🆘 Ayuda

Si tienes problemas:
1. Revisar logs: `railway logs`
2. Ver documentación: https://docs.railway.app
3. Revisar status: https://status.railway.app

---

**¿Listo para desplegar?** Sigue estos pasos y en 5 minutos tendrás el backend funcionando en Railway 🚀
