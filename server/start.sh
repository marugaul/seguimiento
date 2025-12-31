#!/bin/bash

echo "🚀 Iniciando servidor Seguimiento..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creando archivo .env..."
    cp .env.example .env
    echo ""
fi

echo "✅ Servidor listo"
echo "📍 API disponible en: http://localhost:3000"
echo "👤 Usuario admin: admin@seguimiento.com / Admin2024!"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "----------------------------------------"
echo ""

npm start
