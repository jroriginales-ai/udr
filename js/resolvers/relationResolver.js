// ======================================================
// 📁 js/runtime/relationResolver.js (Safari Catalina Ready)
// ======================================================
// UNIVERSAL DECLARATIVE RUNTIME
//
// Resuelve relaciones declarativas entre datasets:
// {
//     source: { file, path },
//     where: { campo: "{campoLocal}" }
// }
// ======================================================

(function () {

    const FILE = "relationResolver.js";

    const log = (...a) => window.logger?.info?.(FILE, ...a);
    const warn = (...a) => window.logger?.warn?.(FILE, ...a);
    const error = (...a) => window.logger?.error?.(FILE, ...a);

    window.relationResolver = {
        execute,
        resolve,
        resolveRowRelations,
        loadRelation,
        isRelation
    };

    // Helper de clonado compatible con Safari 13/14 (macOS Catalina)
    function clone(value) {
        if (value == null) return value;
        if (typeof window.structuredClone === "function") {
            return window.structuredClone(value);
        }
        return JSON.parse(JSON.stringify(value));
    }

    // ======================================================
    // EXECUTE (Paso del Pipeline / Resolver)
    // ======================================================
    async function execute({ context = {} } = {}) {
        await resolve({ context: context });
        log("Relaciones resueltas correctamente.");
        return context;
    }

    // ======================================================
    // ENTRY POINT
    // ======================================================
    async function resolve({ context = {} } = {}) {
        const dataset = context?.datasets?.data?.value;

        if (!Array.isArray(dataset) || dataset.length === 0) {
            return;
        }

        const schema = context?.datasets?.data?.schema || [];

        // Procesar las relaciones de cada fila del dataset
        for (var i = 0; i < dataset.length; i++) {
            await resolveRowRelations({
                row: dataset[i],
                schema: schema
            });
        }
    }

    // ======================================================
    // RESOLVE ROW RELATIONS
    // ======================================================
    async function resolveRowRelations({ row = {}, schema = [] } = {}) {
        if (!row || !Array.isArray(schema)) return;

        for (var i = 0; i < schema.length; i++) {
            var field = schema[i];

            if (!field || !field.relation) continue;

            var record = await loadRelation(field.relation, row);

            if (!record) continue;

            // Compatibilidad Safari Catalina (Sustituye a '??=')
            if (!row.__resolved) {
                row.__resolved = {};
            }

            row.__resolved[field.campo] = record;
        }
    }

    // ======================================================
    // LOAD RELATION
    // ======================================================
    async function loadRelation(relation, row = {}) {
        if (!isRelation(relation)) return null;

        try {
            // Ejecuta el runtime en el contexto relacionado
            const relationContext = await window.runtime?.init?.({
                file: relation.source.file,
                path: relation.source.path,
                profile: "relation",
                context: {}
            });

            const dataset = relationContext?.datasets?.data?.value || [];

            if (!Array.isArray(dataset) || dataset.length === 0) {
                return null;
            }

            // Construir criterio 'where'
            const where = {};
            const keys = Object.keys(relation.where);

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = relation.where[key];

                if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
                    var fieldName = value.slice(1, -1);
                    value = window.pathResolver?.getByPath?.(row, fieldName) ?? row[fieldName];
                }

                where[key] = value;
            }

            // Buscar en el dataset de destino
            const target = dataset.find(function (item) {
                return Object.keys(where).every(function (k) {
                    return String(item[k]) === String(where[k]);
                });
            });

            if (!target) {
                warn("Registro relacionado no encontrado para:", where);
                return null;
            }

            return clone(target);

        } catch (e) {
            error("loadRelation:", e);
            return null;
        }
    }

    // ======================================================
    // RELATION DETECTOR
    // ======================================================
    function isRelation(value) {
        return (
            value != null &&
            typeof value === "object" &&
            value.source?.file &&
            value.source?.path &&
            value.where &&
            typeof value.where === "object"
        );
    }

    log(`${FILE} inicializado correctamente.`);

})();