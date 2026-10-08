// ======================================================
// 📁 js/runtime/validateSchemas.js
// ======================================================

(function () {

    const FILE = "validateSchemas.js";

    const log   = (...a) => window.logger?.info?.(FILE, ...a);
    const error = (...a) => window.logger?.error?.(FILE, ...a);

    window.validateSchemas = {
        execute
    };

    // ======================================================
    // 🚀 EXECUTE (Punto de entrada de la pipeline)
    // ======================================================
    async function execute({ context = {} } = {}) {
        const root = context.root;
        const schemas = root?.meta?.schemas || {};

        // --------------------------------------------------
        // 1. NODO RAÍZ DECLARATIVO (_root)
        // --------------------------------------------------
        if (!schemas._root) {
            throw new Error(
                "Error de Schema: No existe el esquema raíz '_root' en 'meta.schemas'."
            );
        }

        // Si existe, ejecuta la validación recursiva
        validateRootObject({
            rootSchema: schemas._root,
            rootData: root,
            path: "root"
        });

        const startup = root?.definition?.startup || {};
        const definitions = root?.definition?.datasets || [];
        const metaName = startup.meta_schema || "_meta";
        const meta = schemas[metaName];

        if (!meta) {
            throw new Error(`No existe el meta_schema '${metaName}'.`);
        }

        // --------------------------------------------------
        // 2. _META -> SCHEMAS
        // --------------------------------------------------
        for (const definition of definitions) {
            const schema = schemas[definition.schema];

            if (!schema) {
                throw new Error(`No existe el schema '${definition.schema}'.`);
            }

            validateSchemaDefinition({
                meta,
                schema,
                schemaName: definition.schema
            });
        }

        // --------------------------------------------------
        // 3. SCHEMA -> DATASETS (Datos reales)
        // --------------------------------------------------
        if (context.datasets) {
            for (const dataset of Object.values(context.datasets)) {
                if (Array.isArray(dataset.value)) {
                    validateDataset({
                        schema: dataset.schema,
                        data: dataset.value,
                        datasetName: dataset.id
                    });
                } else if (dataset.value != null) {
                    validateObject({
                        schema: dataset.schema,
                        object: dataset.value,
                        path: dataset.id
                    });
                }
            }
        }

        log("Validación de esquema raíz, esquemas y datasets completada.");
        return true;
    }

    // ======================================================
    // 🌳 VALIDADOR RECURSIVO DEL NODO RAÍZ (_root)
    // ======================================================
    function validateRootObject({ rootSchema = [], rootData = {}, path = "root" }) {
        for (const rule of rootSchema) {
            const key = rule.campo;
            const isRequired = rule.required === true || rule.obligatorio === true;
            const value = rootData ? rootData[key] : undefined;
            const currentPath = `${path}.${key}`;

            // 1. Validar Presencia
            if (!(key in rootData) || value === null || value === undefined) {
                if (isRequired) {
                    throw new Error(`Error en Root JSON: Falta el nodo obligatorio '${currentPath}'.`);
                }
                continue;
            }

            // 2. Validar Tipo de Dato
            if (rule.tipo === "array" && !Array.isArray(value)) {
                throw new Error(`Error en Root JSON: '${currentPath}' debe ser un Array.`);
            }

            if (rule.tipo === "object" && (typeof value !== "object" || Array.isArray(value))) {
                throw new Error(`Error en Root JSON: '${currentPath}' debe ser un Objeto.`);
            }

            // 3. Recursividad para subniveles (fields)
            if (Array.isArray(rule.fields) && value != null) {
                if (rule.tipo === "array" && Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        validateRootObject({
                            rootSchema: rule.fields,
                            rootData: value[i],
                            path: `${currentPath}[${i}]`
                        });
                    }
                } else {
                    validateRootObject({
                        rootSchema: rule.fields,
                        rootData: value,
                        path: currentPath
                    });
                }
            }
        }
    }

    // ======================================================
    // 📐 _META -> SCHEMA
    // ======================================================
    function validateSchemaDefinition({ meta, schema, schemaName = "" }) {
        const properties = meta.properties || {};

        for (const field of schema) {
            // Validar que la propiedad esté permitida en _meta
            for (const property of Object.keys(field)) {
                if (!(property in properties)) {
                    throw new Error(
                        `El atributo '${property}' no existe en _meta (${schemaName}).`
                    );
                }
            }

            // Validar atributos obligatorios requeridos por _meta
            for (const property in properties) {
                if (properties[property].obligatorio && !(property in field)) {
                    throw new Error(
                        `Falta '${property}' en '${field.campo}' (${schemaName}).`
                    );
                }
            }

            // Recursividad en subcampos
            if (Array.isArray(field.fields)) {
                validateSchemaDefinition({
                    meta,
                    schema: field.fields,
                    schemaName
                });
            }
        }
    }

    // ======================================================
    // 📊 SCHEMA -> DATASET
    // ======================================================
    function validateDataset({ schema = [], data = [], datasetName = "" }) {
        if (!Array.isArray(data)) {
            throw new Error(`Dataset '${datasetName}' debe ser un Array.`);
        }

        for (const row of data) {
            validateObject({
                schema,
                object: row,
                path: datasetName
            });
        }
    }

    // ======================================================
    // 🧱 SCHEMA -> OBJETO
    // ======================================================
    function validateObject({ schema = [], object, path = "" }) {
        if (Array.isArray(object)) {
            for (const item of object) {
                validateObject({ schema, object: item, path });
            }
            return;
        }

        if (object === null || typeof object !== "object") {
            throw new Error(`'${path}' debe ser un objeto. Valor recibido: ${JSON.stringify(object)}`);
        }

        for (const field of schema) {
            const isRequired = field.required === true || field.obligatorio === true;

            // Validar presencia si el campo es obligatorio
            if (!(field.campo in object)) {
                if (isRequired) {
                    throw new Error(`Falta el campo obligatorio '${path}.${field.campo}'.`);
                }
                continue;
            }

            const value = object[field.campo];

            // Validar recursivamente subcampos si existen
            if (Array.isArray(field.fields) && value != null) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        validateObject({
                            schema: field.fields,
                            object: item,
                            path: `${path}.${field.campo}`
                        });
                    }
                } else {
                    validateObject({
                        schema: field.fields,
                        object: value,
                        path: `${path}.${field.campo}`
                    });
                }
            }
        }
    }

})();