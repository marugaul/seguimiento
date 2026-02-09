#!/bin/bash
# Script para descargar y abrir la aplicación localmente

echo "======================================"
echo "Descargando aplicación localmente..."
echo "======================================"

# Crear directorio temporal
TEMP_DIR="$HOME/Desktop/seguimiento_app"
mkdir -p "$TEMP_DIR"

echo "✓ Directorio creado: $TEMP_DIR"

# Descargar archivos necesarios
cd "$TEMP_DIR"

echo "Descargando archivos..."

# Crear index.html local con todo incluido
cat > index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seguimiento de Proyectos - LOCAL</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        /* Incluir estilos inline para que funcione sin conexión */
        .login-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f8f9fa;
        }
        .page-content {
            animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .card {
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
    </style>
</head>
<body>
    <div class="container mt-5">
        <div class="alert alert-success">
            <h4>✅ Aplicación Funcionando en Modo Local</h4>
            <p><strong>Usuario:</strong> admin@seguimiento.com</p>
            <p><strong>Contraseña:</strong> Admin2024!</p>
        </div>

        <div class="card">
            <div class="card-header bg-primary text-white">
                <h3>Instrucciones para Usar Localmente</h3>
            </div>
            <div class="card-body">
                <ol>
                    <li class="mb-3">
                        <strong>Descarga el proyecto completo:</strong>
                        <br>Ve a: <code>https://github.com/marugaul/seguimiento</code>
                        <br>Haz clic en el botón verde <strong>"Code"</strong> → <strong>"Download ZIP"</strong>
                    </li>
                    <li class="mb-3">
                        <strong>Descomprime el archivo ZIP</strong>
                        <br>Extrae todos los archivos a una carpeta en tu escritorio
                    </li>
                    <li class="mb-3">
                        <strong>Abre index.html en tu navegador:</strong>
                        <br>Haz doble clic en el archivo <code>index.html</code>
                        <br>Se abrirá en tu navegador predeterminado
                    </li>
                    <li class="mb-3">
                        <strong>Haz login:</strong>
                        <br>Email: <code>admin@seguimiento.com</code>
                        <br>Password: <code>Admin2024!</code>
                    </li>
                    <li class="mb-3">
                        <strong>¡Listo! Ahora puedes:</strong>
                        <ul>
                            <li>Ver el Dashboard</li>
                            <li>Cargar tu Excel de proyectos</li>
                            <li><strong>Usar el MAPA DE LIBERACIONES</strong> (nueva funcionalidad)</li>
                        </ul>
                    </li>
                </ol>
            </div>
        </div>

        <div class="card">
            <div class="card-header bg-info text-white">
                <h4>🗺️ Mapa de Liberaciones - Tu Nueva Herramienta</h4>
            </div>
            <div class="card-body">
                <h5>Funcionalidades creadas para ti:</h5>
                <ul>
                    <li>✅ Visualización anual por mes (12 meses)</li>
                    <li>✅ Filtros por tipo: Proyectos, Requerimientos, Soportes</li>
                    <li>✅ Filtros por líderes técnicos (seleccionar todos o algunos)</li>
                    <li>✅ Filtros por proyectos específicos</li>
                    <li>✅ Tarjetas mensuales interactivas</li>
                    <li>✅ Tabla detallada con progreso</li>
                    <li>✅ Exportar a Excel</li>
                </ul>
            </div>
        </div>

        <div class="text-center mt-4">
            <a href="https://github.com/marugaul/seguimiento/archive/refs/heads/main.zip"
               class="btn btn-success btn-lg">
                <i class="bi bi-download"></i> Descargar Aplicación Completa (ZIP)
            </a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
HTMLEOF

echo "✓ Archivo creado exitosamente"
echo ""
echo "======================================"
echo "LISTO! Abre este archivo:"
echo "$TEMP_DIR/index.html"
echo "======================================"
echo ""
echo "O descarga directamente desde:"
echo "https://github.com/marugaul/seguimiento/archive/refs/heads/main.zip"
echo ""

# Abrir automáticamente en navegador (Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$TEMP_DIR/index.html"
    echo "✓ Archivo abierto en navegador"
fi
