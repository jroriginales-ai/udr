#!/bin/bash

# Directorio a procesar (por defecto el directorio actual ".")
TARGET_DIR="${1:-.}"

cd "$TARGET_DIR" || exit 1

for file in *; do
  # Verificar que sea un archivo regular
  [ -f "$file" ] || continue

  year=""
  month=""

  # Formato 1: Screen Shot YYYY-MM-DD...
  if [[ "$file" =~ ^Screen\ Shot\ ([0-9]{4})-([0-9]{2})-[0-9]{2}.*$ ]]; then
    year="${BASH_REMATCH[1]}"
    month="${BASH_REMATCH[2]}"

  # Formato 2: Screen Shot YYYY-MM - Screen Shot YYYY-MM-DD...
  elif [[ "$file" =~ ^Screen\ Shot\ ([0-9]{4})-([0-9]{2})\ -\ Screen\ Shot.*$ ]]; then
    year="${BASH_REMATCH[1]}"
    month="${BASH_REMATCH[2]}"
  fi

  # Si coincidió con alguno de los dos formatos, procesar el archivo
  if [ -n "$year" ] && [ -n "$month" ]; then
    dest_dir="${year}/${month}"
    mkdir -p "$dest_dir"

    # Preparar el nombre base y la extensión
    base="${file%.*}"
    ext="${file##*.}"

    if [ "$base" = "$ext" ]; then
      ext_suffix=""
    else
      ext_suffix=".$ext"
    fi

    # Validar si ya existe el archivo en la carpeta destino
    dest_file="${dest_dir}/${file}"
    if [ -e "$dest_file" ]; then
      count=1
      # Busca el siguiente sufijo disponible: _1, _2, _3, etc.
      while [ -e "${dest_dir}/${base}_${count}${ext_suffix}" ]; do
        ((count++))
      done
      
      target_path="${dest_dir}/${base}_${count}${ext_suffix}"
    else
      target_path="${dest_dir}/${file}"
    fi

    # Mover el archivo al destino final
    mv "$file" "$target_path"
    echo "Movido: '$file' -> '$target_path'"    
  fi
done