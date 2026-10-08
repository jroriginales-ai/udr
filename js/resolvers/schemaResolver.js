// ======================================================
// 📁 js/resolvers/schemaResolver.js (Safari Catalina Ready)
// ======================================================
// UNIVERSAL DECLARATIVE RUNTIME
//
// RESPONSABILIDAD ÚNICA:
// - Resolver y normalizar esquemas (locales y externos).
// - Generar valores e items vacíos basados en la estructura del esquema.
// ======================================================

(function () {

    const FILE = "schemaResolver.js";
    const log = (...a) => window.logger?.info?.(FILE, ...a);

    window.schemaResolver = {
        execute,
        getSchema,
        loadExternalSchema,
        normalizeField,
        createEmptyItem,
        createEmptyValue
    };

    // ======================================================
    // EXECUTE (Paso del Pipeline / Resolver)
    // ======================================================
    async function execute({ context = {} } = {}) {
        const schemaName = context.profileDefinition?.schema || context.schema;

        if (!schemaName) {
            log("No se especificó un nombre de esquema en el perfil o contexto.");
            return [];
        }

        const schema = await getSchema({ name: schemaName, context: context });
        context.schema = schema;

        log(`Esquema '${schemaName}' resuelto correctamente (${schema.length} campos).`);
        return schema;
    }

    // ======================================================
    // GET SCHEMA (Local o Externo)
    // ======================================================
    async function getSchema({
        name = "",
        source = null,
        context = {}
    } = {}) {

        if (!name) return [];

        // 1. ESQUEMA LOCAL (meta.schemas[name])
        if (!source) {
            const localSchema = context?.root?.meta?.schemas?.[name];

            return Array.isArray(localSchema)
                ? localSchema.map(normalizeField)
                : [];
        }

        // 2. ESQUEMA EXTERNO (Carga remota / secundaria)
        return await loadExternalSchema({ name: name, source: source });
    }

    // ======================================================
    // LOAD EXTERNAL SCHEMA
    // ======================================================
    async function loadExternalSchema({
        name = "",
        source = {}
    } = {}) {

        if (!source || !source.file) return [];

        const json = await window.runtime?.execute?.({
            file: source.file,
            path: source.path,
            context: {},
            steps: ["loadJson"]
        });

        if (!json?.root) return [];

        const schema = await window.dataResolver?.resolve?.({
            root: json.root,
            jsonPath: "meta.schemas." + name
        });

        return Array.isArray(schema)
            ? schema.map(normalizeField)
            : [];
    }

    // ======================================================
    // CREATE EMPTY ITEM (Basado en Esquema)
    // ======================================================
    function createEmptyItem({ schema = [] } = {}) {
        if (!Array.isArray(schema)) return {};

        const record = {};

        for (var i = 0; i < schema.length; i++) {
            var field = schema[i];
            if (!field) continue;

            var campo = String(field.campo || field.field || "").trim();
            if (!campo) continue;

            record[campo] = createEmptyValue(field);
        }

        return record;
    }

    // ======================================================
    // CREATE EMPTY VALUE
    // ======================================================
    function createEmptyValue(field = {}) {
        const tipo = String(field.tipo || field.type || "text").toLowerCase().trim();

        if (tipo === "object") {
            const object = {};

            if (Array.isArray(field.fields)) {
                for (var i = 0; i < field.fields.length; i++) {
                    var child = field.fields[i];
                    var campo = String(child.campo || child.field || "").trim();
                    if (campo) {
                        object[campo] = createEmptyValue(child);
                    }
                }
            } else {
                for (var key in field) {
                    if (!Object.prototype.hasOwnProperty.call(field, key)) continue;
                    if (["campo", "field", "tipo", "type", "label", "fields"].indexOf(key) !== -1) continue;
                    object[key] = createEmptyStructure(field[key]);
                }
            }

            return object;
        }

        if (tipo === "array") return [];
        if (tipo === "boolean") return false;
        if (tipo === "number" || tipo === "integer") return "";

        return "";
    }

    // ======================================================
    // CREATE EMPTY STRUCTURE
    // ======================================================
    function createEmptyStructure(value) {
        if (value == null) return "";
        if (Array.isArray(value)) return [];

        if (typeof value === "object") {
            const result = {};
            for (var key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    result[key] = createEmptyStructure(value[key]);
                }
            }
            return result;
        }

        return "";
    }

    // ======================================================
    // NORMALIZE FIELD
    // ======================================================
    function normalizeField(field = {}) {
        if (typeof field === "string") {
            return {
                campo: field,
                tipo: "text"
            };
        }

        const normalized = Object.assign({}, field, {
            campo: String(field.campo || field.field || "").trim(),
            tipo: String(field.tipo || field.type || "text").toLowerCase().trim()
        });

        if (Array.isArray(field.fields)) {
            normalized.fields = field.fields.map(normalizeField);
        }

        return normalized;
    }

    log(`${FILE} inicializado correctamente.`);

})();