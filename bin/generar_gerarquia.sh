#!/bin/zsh

SEQUENCE_FILE="$(pwd)/sequence.json"

# Crear sequence.json si no existe
[[ ! -f "$SEQUENCE_FILE" ]] && echo '{"seq": 1}' > "$SEQUENCE_FILE"

get_next_id() {
  local current_id=$(jq '.seq' "$SEQUENCE_FILE")
  echo "{\"seq\": $((current_id + 1))}" > "$SEQUENCE_FILE"
  echo "$current_id"
}

procesar_carpeta() {
  local dir_path="$1"
  local folder_name=$(basename "$dir_path")
  local output_json="${dir_path}/${folder_name}.json"
  
  local items_json="[]"

  # Procesar cada subcarpeta directa
  for sub in "$dir_path"/*/; do
    [[ -d "$sub" ]] || continue
    
    # 1. Llamada recursiva para procesar la subcarpeta
    procesar_carpeta "${sub%/}"
    
    # 2. Obtener metadatos y construir objeto con jq
    local sub_name=$(basename "$sub")
    local item_id=$(get_next_id)
    local sub_json_name="${sub_name}.json"
    
    items_json=$(echo "$items_json" | jq \
      --arg id "$item_id" \
      --arg folder "$sub_name" \
      --arg file "$sub_json_name" \
      --arg path "${sub%/}" \
      '. + [{id: ($id | tonumber), folder: $folder, source: {file: $file, path: $path}}]')
  done

  # Guardar el JSON formateado
  echo "$items_json" | jq '.' > "$output_json"
  echo "Generado: $output_json"
}

procesar_carpeta "$(cd "${1:-.}" && pwd)"