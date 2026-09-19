#!/usr/bin/env bash

# Usar el parámetro si se proporciona; de lo contrario, usar la carpeta actual '.'
TARGET_DIR="${1:-.}"

# Validar que el argumento recibido sea un directorio válido
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: El directorio '$TARGET_DIR' no existe."
    exit 1
fi

# Activar la opción para ignorar mayúsculas/minúsculas si no hay coincidencias de .zip
shopt -s nullglob

# Iterar sobre todos los archivos .zip del directorio objetivo (sin recursividad)
for zip_file in "$TARGET_DIR"/*.zip "$TARGET_DIR"/*.ZIP; do
    # Validar que sea un archivo existente
    if [ -f "$zip_file" ]; then
        
        # Obtener el nombre del archivo sin la ruta
        base_name="$(basename "$zip_file")"
        
        # Eliminar la extensión .zip para obtener el nombre del directorio
        folder_name="${base_name%.*}"
        
        # Definir la ruta completa donde se extraerá
        destination_dir="$(dirname "$zip_file")/$folder_name"
        
        echo "Descomprimiendo: '$base_name' en '$folder_name/'..."
        
        # Descomprimir en la carpeta destino (unzip -d la crea automáticamente)
        unzip -q "$zip_file" -d "$destination_dir"
        
        # Comprobar si la extracción fue exitosa
        if [ $? -eq 0 ]; then
            echo "Completado: '$folder_name/'"
        else
            echo "Error al descomprimir '$base_name'"
        fi
    fi
done