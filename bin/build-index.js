// ======================================================
// 📁 build-index.js (RAÍZ)
// 🧠 GENERADOR DE _index.json
// ======================================================

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const OUTPUT = path.join(DATA_DIR, "_index.json");

(function(){

  console.log("🔍 Generando índice...");

  const files = walk(DATA_DIR);

  let index = {};
  let errors = [];

  files.forEach(file => {

    try {

      const json = JSON.parse(fs.readFileSync(file, "utf-8"));

      const rel = toUnix(path.relative(DATA_DIR, file));
      const slug = buildSlug(rel);

      if (index[slug]){
        errors.push(`Slug duplicado: ${slug}`);
        return;
      }

      const data = json.data?.[0] || {};

      index[slug] = {
        file: "data/" + rel,
        tipo: json.meta?.tipo || inferTipo(slug),
        titulo: data.titulo || data.nombre || slug,
        id: data.id || null
      };

    } catch(e){
      errors.push(`Error en ${file}`);
    }
  });

  fs.writeFileSync(
    OUTPUT,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      total: Object.keys(index).length,
      index
    }, null, 2)
  );

  console.log("✅ Index generado");

  if (errors.length){
    console.error(errors);
  }

})();

// ======================================================
function walk(dir){

  let results = [];

  fs.readdirSync(dir).forEach(file => {

    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()){
      results = results.concat(walk(full));
    } else if (file.endsWith(".json")){
      results.push(full);
    }
  });

  return results;
}

// ======================================================
function buildSlug(rel){

  const parts = rel.split("/");

  if (parts[parts.length - 1] === "index.json"){
    parts.pop();
  }

  return parts.join("/");
}

// ======================================================
function inferTipo(slug){

  if (slug.includes("peliculas")) return "pelicula";
  if (slug.includes("series")) return "serie";
  if (slug.includes("personas")) return "persona";

  return "generic";
}

// ======================================================
function toUnix(p){
  return p.replace(/\\/g, "/");
}