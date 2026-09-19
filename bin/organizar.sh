#!/usr/bin/env bash

# Usar el parámetro si se proporciona; de lo contrario, usar la carpeta actual '.'
TARGET_DIR="${1:-.}"

# Validar que el argumento recibido sea un directorio válido
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory '$TARGET_DIR' does not exist."
    exit 1
fi

# Guardar la ruta absoluta del propio script para evitar moverlo a sí mismo
SCRIPT_REALPATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"

# Entrar al directorio especificado
cd "$TARGET_DIR" || exit 1

for file in *; do
    # Validar que sea un archivo regular y no el propio script
    if [ -f "$file" ]; then
        file_realpath="$(pwd)/$file"
        
        # Omitir el script si se está ejecutando dentro de la misma carpeta objetivo
        if [ "$file_realpath" = "$SCRIPT_REALPATH" ]; then
            continue
        fi

        # 1. Obtener la primera letra (en mayúscula)
        first_char="${file:0:1}"
        folder_dir=$(echo "$first_char" | tr '[:lower:]' '[:upper:]')

        # Crear la carpeta destino dentro del directorio indicado
        mkdir -p "$folder_dir"

        # 2. Separar nombre base y extensión
        if [[ "$file" == *.* ]]; then
            filename="${file%.*}"
            extension=".${file##*.}"
        else
            filename="$file"
            extension=""
        fi

        # 3. Determinar la ruta final con consecutivos si ya existe el archivo
        target_path="$folder_dir/$file"
        counter=1

        while [ -e "$target_path" ]; do
            target_path="$folder_dir/${filename}_${counter}${extension}"
            ((counter++))
        done

        # 4. Mover el archivo
        mv "$file" "$target_path"
        echo "Movido: '$file' -> '$target_path'"
    fi
done