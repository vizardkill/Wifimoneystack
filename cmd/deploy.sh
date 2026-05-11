#!/bin/bash
set -e  # Detener el script si ocurre un error

# Define Environment
ENV=$1

# Validar que se pase un entorno como argumento
if [ -z "$ENV" ]; then
  echo "❌ Error: No se especificó el entorno (dev o prod)."
  exit 1
fi

# Connection variables
EC2_USER="abacaxi_admin"
EC2_IP="ec2-18-230-11-102.sa-east-1.compute.amazonaws.com"
EC2_HOST="$EC2_USER@$EC2_IP"

# Directory on EC2
APP_DIR="/home/$EC2_USER/app-$ENV"
TEMP_DIR="${APP_DIR}-temp"

# Crear directorio temporal y copiar código al servidor EC2
echo "📂 Creando directorio temporal en EC2 y copiando archivos..."
ssh -o StrictHostKeyChecking=no -i id_rsa $EC2_HOST "mkdir -p $TEMP_DIR"
rsync -avz --progress -e "ssh -i id_rsa -o StrictHostKeyChecking=no" ./ $EC2_HOST:$TEMP_DIR

# SSH al servidor EC2 y realizar el despliegue
echo "🚀 Iniciando despliegue en EC2..."
ssh -o StrictHostKeyChecking=no -i id_rsa $EC2_HOST << EOF
  set -e
  echo "🗑️ Eliminando directorio anterior y moviendo nuevo código..."
  rm -rf $APP_DIR
  mv $TEMP_DIR $APP_DIR
  cd $APP_DIR

  echo "🛑 Deteniendo y eliminando contenedor existente..."
  docker stop abacaxiapp-container-$ENV || true
  docker rm abacaxiapp-container-$ENV || true

  echo "🐳 Construyendo imagen Docker..."
  if [ "$ENV" == "dev" ]; then
    docker build -f docker/dockerfile.dev -t abacaxiapp:latest-dev .
    docker run -d --name abacaxiapp-container-dev -p 443:3000 abacaxiapp:latest-dev
  elif [ "$ENV" == "prod" ]; then
    docker build -f docker/dockerfile.prod -t abacaxiapp:latest-prod .
    docker run -d --name abacaxiapp-container-prod -p 443:8080 abacaxiapp:latest-prod
  else
    echo "❌ Entorno inválido: $ENV"
    exit 1
  fi

  echo "✅ Despliegue completado exitosamente."
EOF

# Limpiar clave SSH local
echo "🧹 Limpiando clave SSH local..."
rm -f id_rsa
