# 📊 Sistema de Seguimiento de Proyectos

Sistema web privado para visualizar y analizar el seguimiento de proyectos mediante archivos Excel. Completamente estático y desplegable en GitHub Pages.

## 🌟 Características

- ✅ **Autenticación Segura**: Control de acceso con contraseña maestra y lista de usuarios autorizados
- 📤 **Carga de Excel**: Soporte para archivos .xls y .xlsx procesados del lado del cliente
- 📈 **Dashboard Interactivo**: Visualización de métricas y KPIs en tiempo real
- 📊 **Gráficos Dinámicos**: Múltiples gráficos con Chart.js (estados, etapas, líderes, países, etc.)
- 🔍 **Filtros Avanzados**: Filtrado por líder técnico, país, estado y etapa
- 💾 **Almacenamiento Local**: Los datos se guardan en el navegador (localStorage)
- 🎨 **Diseño Responsivo**: Funciona en desktop, tablet y móvil
- 🚀 **Sin Backend**: Aplicación 100% del lado del cliente

## 🚀 Demo en Vivo

Una vez configurado GitHub Pages, tu aplicación estará disponible en:
```
https://[tu-usuario].github.io/seguimiento/
```

## 📋 Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Archivo Excel con la estructura de DETPROYECTOS

## 🔧 Instalación

### Opción 1: GitHub Pages (Recomendado)

1. **Fork o Clone este repositorio**
   ```bash
   git clone https://github.com/[tu-usuario]/seguimiento.git
   ```

2. **Sube los cambios a GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Habilita GitHub Pages**
   - Ve a Settings → Pages
   - En "Source", selecciona la rama `main` o `claude/project-tracking-dashboard-l9p9C`
   - Selecciona la carpeta `/ (root)`
   - Haz clic en "Save"
   - Espera unos minutos y tu sitio estará disponible

### Opción 2: Ejecutar Localmente

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/[tu-usuario]/seguimiento.git
   cd seguimiento
   ```

2. **Inicia un servidor web local**

   Usando Python:
   ```bash
   python3 -m http.server 8000
   ```

   Usando Node.js:
   ```bash
   npx http-server -p 8000
   ```

3. **Abre tu navegador**
   ```
   http://localhost:8000
   ```

## 🔐 Configuración de Seguridad

### Credenciales por Defecto

- **Email por defecto**: `admin@example.com`
- **Contraseña maestra**: `Admin2024!`

### Cambiar la Contraseña Maestra

1. Abre el archivo `js/auth.js`
2. Busca la línea:
   ```javascript
   this.masterPassword = 'Admin2024!';
   ```
3. Cambia `'Admin2024!'` por tu contraseña deseada
4. Guarda y haz commit de los cambios

### Agregar Usuarios Autorizados

1. Inicia sesión en la aplicación
2. Ve a **Gestionar Accesos**
3. Ingresa el correo electrónico del usuario
4. Haz clic en "Agregar"
5. Comparte la contraseña maestra con el nuevo usuario

## 📤 Cómo Usar

### 1. Iniciar Sesión

- Ingresa tu correo electrónico autorizado
- Ingresa la contraseña maestra
- Haz clic en "Iniciar Sesión"

### 2. Cargar Archivo Excel

- Ve a **Cargar Excel**
- Selecciona tu archivo de seguimiento (.xls o .xlsx)
- El sistema procesará automáticamente el archivo
- Serás redirigido al dashboard con los datos cargados

### 3. Visualizar Dashboard

El dashboard muestra:

- **Tarjetas de Resumen**: Total de proyectos, horas estimadas, horas registradas y líderes técnicos
- **Filtros**: Filtra por líder técnico, país, estado o etapa
- **Gráficos**:
  - Proyectos por Estado (dona)
  - Proyectos por Etapa (pastel)
  - Horas por Mes (barras)
  - Top 10 Líderes (barras horizontales)
  - Proyectos por País (dona)
- **Tabla Detallada**: Lista completa de proyectos con toda la información

### 4. Aplicar Filtros

- Usa los selectores en la sección de filtros
- Los gráficos y tabla se actualizarán automáticamente
- Haz clic en "Limpiar Filtros" para ver todos los proyectos

### 5. Gestionar Accesos

- Ve a **Gestionar Accesos**
- Agrega nuevos usuarios ingresando su correo
- Elimina usuarios que ya no necesiten acceso
- Comparte la contraseña maestra con los usuarios autorizados

## 📁 Estructura del Proyecto

```
seguimiento/
├── index.html              # Página principal
├── css/
│   └── style.css          # Estilos personalizados
├── js/
│   ├── app.js             # Lógica principal de la aplicación
│   ├── auth.js            # Gestión de autenticación
│   ├── storage.js         # Almacenamiento en localStorage
│   ├── excel.js           # Procesamiento de archivos Excel
│   └── dashboard.js       # Lógica del dashboard y gráficos
├── DETPROYECTOS_23122025.xls  # Archivo de ejemplo
└── README.md              # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura de la aplicación
- **CSS3 + Bootstrap 5**: Diseño y estilos responsivos
- **JavaScript ES6+**: Lógica de la aplicación
- **Chart.js**: Gráficos interactivos
- **SheetJS (xlsx)**: Lectura de archivos Excel
- **Bootstrap Icons**: Iconografía

## 🔒 Seguridad y Privacidad

- ✅ Los datos **NUNCA** salen de tu navegador
- ✅ No hay conexión a servidores externos
- ✅ Todo se procesa del lado del cliente
- ✅ Los datos se almacenan localmente en localStorage
- ⚠️ **Importante**: Si limpias el caché del navegador, perderás los datos guardados
- ⚠️ Mantén copias de seguridad de tus archivos Excel originales

## 📝 Estructura del Excel

El archivo Excel debe tener las siguientes columnas (en este orden):

1. ID. LT
2. NOMBRE LT
3. PAÍS
4. CASO FS
5. PROYECTO FS
6. TIPO
7. ES PADRE?
8. PROY. PADRE
9. INICIATIVA
10. NOMBRE
11. TIPO PROYECTO
12. PRODUCTO
13. ÁREA
14. ESTADO
15. ETAPA
16-27. Meses (1/2025 - 12/2025)
28. ESTIMACIÓN
29. CONTROL CAMBIO
30. TOTAL ESTIMACIÓN
31. TOTAL REGISTRADO
32. TOTAL DISPONIBLE
33. % AVANCE HORAS
34. % AVANCE REAL
35. % AVANCE ESPERADO
36. DESVIACIÓN HORAS
37. % DESVIACIÓN
38-50. Fechas (varios campos)
51. COMENTARIOS

## ❓ Preguntas Frecuentes

### ¿Con qué frecuencia debo actualizar el archivo?

Se recomienda cargar el archivo diariamente para mantener la información actualizada.

### ¿Qué pasa si cierro el navegador?

Los datos permanecen guardados en localStorage. La próxima vez que ingreses, verás la última versión cargada.

### ¿Puedo usar esto en mi empresa?

Sí, pero ten en cuenta que:
- Los datos se almacenan en el navegador del usuario
- Para uso compartido, cada usuario debe cargar su propio archivo
- Para datos sensibles, considera usar HTTPS (GitHub Pages lo incluye automáticamente)

### ¿Funciona offline?

Sí, una vez cargada la página, funciona completamente offline. Solo necesitas conexión para la primera carga.

## 🐛 Solución de Problemas

### El archivo Excel no se carga

- Verifica que sea .xls o .xlsx
- Asegúrate de que tenga la estructura correcta
- Revisa la consola del navegador (F12) para ver errores

### Los gráficos no se muestran

- Asegúrate de tener una conexión a internet activa la primera vez (para cargar Chart.js)
- Verifica que el archivo Excel tenga datos válidos

### Olvidé la contraseña maestra

- Edita el archivo `js/auth.js` y cambia el valor de `masterPassword`
- O revisa la documentación en "Gestionar Accesos" dentro de la app

## 📄 Licencia

Este proyecto es de uso privado e interno.

## 👤 Contacto

Para soporte o preguntas, contacta al administrador del sistema.

---

**⚡ Desarrollado para facilitar el seguimiento y análisis de proyectos**
