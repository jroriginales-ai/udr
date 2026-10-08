// ======================================================
// 📁 js/core/dataResolver.js (Safari Catalina Ready)
// ======================================================
// UNIVERSAL DECLARATIVE RUNTIME
//
// RESPONSABILIDAD ÚNICA:
// - Resolver información dentro de un JSON ya cargado.
//
// NO HACE:
// - fetch de archivos / cargar schemas / resolver datasets / navegación
// ======================================================

(function () {

    const FILE = "dataResolver.js";
    const log = (...a) => window.logger?.info?.(FILE, ...a);

    // Cache interno aislado
    let CACHE = Object.create(null);

    // ==================================================
    // EXPORTS
    // ==================================================
    window.dataResolver = {
        resolve,
        clearCache,
        getCache
    };

    // ==================================================
    // RESOLVE (Extracción por jsonPath con Caché)
    // ==================================================
    async function resolve({
        root = null,
        jsonPath = null
    } = {}) {

        if (!root) return null;

        // 1. Root Completo
        if (!jsonPath || jsonPath === "") {
            return root;
        }

        // 2. Retorno desde Caché
        const cacheKey = String(jsonPath).trim();

        if (CACHE[cacheKey] !== undefined) {
            return CACHE[cacheKey];
        }

        // 3. Extracción vía pathResolver
        const value = window.pathResolver?.getByPath?.(root, jsonPath) ?? null;

        // 4. Guardar en Caché
        CACHE[cacheKey] = value;

        return value;
    }

    // ==================================================
    // CACHE MANAGEMENT
    // ==================================================
    function clearCache() {
        CACHE = Object.create(null);
        log("Caché limpiado correctamente.");
    }

    function getCache() {
        return Object.assign(Object.create(null), CACHE);
    }

    log(`${FILE} inicializado correctamente.`);

})();