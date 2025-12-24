# 🖥️ Ejecutar Localmente (Sin GitHub Pages)

## Opción A: Usando Python (Más Simple)

1. **Abre la terminal en la carpeta del proyecto:**
   ```bash
   cd seguimiento
   ```

2. **Inicia el servidor:**
   ```bash
   python -m http.server 8000
   ```
   O si tienes Python 2:
   ```bash
   python -m SimpleHTTPServer 8000
   ```

3. **Abre tu navegador:**
   ```
   http://localhost:8000
   ```

4. **Para detener el servidor:**
   - Presiona `Ctrl + C` en la terminal

---

## Opción B: Usando Node.js

1. **Instala http-server (solo la primera vez):**
   ```bash
   npm install -g http-server
   ```

2. **Inicia el servidor:**
   ```bash
   http-server -p 8000
   ```

3. **Abre tu navegador:**
   ```
   http://localhost:8000
   ```

---

## Opción C: Doble Clic en el Archivo (Más Simple pero con Limitaciones)

1. **Ve a la carpeta del proyecto**
2. **Haz doble clic en `index.html`**
3. Se abrirá en tu navegador por defecto

⚠️ **Nota:** Algunas funcionalidades pueden no funcionar correctamente debido a restricciones de CORS del navegador.

---

## 🔐 Acceso en Red Local (Opcional)

Si quieres que otros en tu red local accedan:

1. **Averigua tu IP local:**
   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. **Inicia el servidor permitiendo acceso externo:**
   ```bash
   python -m http.server 8000 --bind 0.0.0.0
   ```

3. **Comparte la URL con tu equipo:**
   ```
   http://TU_IP_LOCAL:8000
   ```
   Ejemplo: `http://192.168.1.100:8000`

---

## 🚀 Acceso desde Cualquier Lugar (IIS en Windows)

Si tienes Windows y quieres usar IIS:

1. **Habilita IIS en Windows:**
   - Panel de Control → Programas → Activar características de Windows
   - Marca "Internet Information Services"
   - OK y espera

2. **Copia la carpeta del proyecto a:**
   ```
   C:\inetpub\wwwroot\seguimiento
   ```

3. **Configura el sitio en IIS:**
   - Abre "Administrador de IIS"
   - Clic derecho en "Sitios" → Agregar sitio web
   - Nombre: Seguimiento
   - Ruta física: C:\inetpub\wwwroot\seguimiento
   - Puerto: 80 (o 8080 si 80 está ocupado)

4. **Accede desde tu navegador:**
   ```
   http://localhost
   ```
   O desde otra computadora en tu red:
   ```
   http://TU_IP:80
   ```

---

## 📝 Resumen de Opciones

| Opción | Dificultad | Acceso | Privacidad |
|--------|-----------|--------|------------|
| Python Server | Fácil | Solo tu PC | 100% Privado |
| Node.js | Fácil | Solo tu PC | 100% Privado |
| Doble clic | Muy Fácil | Solo tu PC | 100% Privado |
| IIS | Media | Red local/Internet | Privado en tu red |
| GitHub Pages | Fácil | Internet | Repo público pero app privada |
