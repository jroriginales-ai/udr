// ======================================================
// 📁 js/resolvers/layoutResolver.js (Safari / Catalina Ready)
// ======================================================

(function () {

    const FILE = "layoutResolver.js";
    const log = (...a) => window.logger?.info?.(FILE, ...a);

    window.layoutResolver = {
        execute
    };

    // Helper de clonado compatible con Safari 13/14 (macOS Catalina)
    function clone(val) {
        if (val == null) return val;
        if (typeof window.structuredClone === "function") {
            return window.structuredClone(val);
        }
        return JSON.parse(JSON.stringify(val));
    }

    // ==================================================
    // EXECUTE
    // ==================================================
    async function execute({ context = {} } = {}) {
        const layoutSource = context.profileDefinition?.layout
            ? context.root?.[context.profileDefinition.layout]
            : context.datasets?.layout?.value;

        if (!layoutSource) {
            log("No se encontró estructura de layout para resolver.");
            return null;
        }

        context.layout = await resolveLayout({ layout: layoutSource, context });

        log("Layout resuelto correctamente.");
        return context.layout;
    }

    // ==================================================
    // RESOLVE LAYOUT
    // ==================================================
    async function resolveLayout({ layout, context }) {
        return await resolveNode({
            node: clone(layout),
            context
        });
    }

    // ==================================================
    // RESOLVE NODE (Recursión Asíncrona)
    // ==================================================
    async function resolveNode({ node, context }) {
        if (node == null || typeof node !== "object") {
            return node;
        }

        // Resolución de Arreglos en Paralelo
        if (Array.isArray(node)) {
            return await Promise.all(
                node.map(function (item) {
                    return resolveNode({ node: item, context });
                })
            );
        }

        // Resolución de Componentes UI
        if (typeof node.component === "string") {
            const resolved = Object.assign({}, node);

            const dsName = resolved.dataset || resolved.dataSource;
            if (dsName) {
                const dataset = context.datasets?.[dsName];
                const schema = Array.isArray(dataset?.schema) ? dataset.schema : [];

                if (!Array.isArray(resolved.fields) || resolved.fields.length === 0) {
                    resolved.fields = clone(schema);
                }

                const records = Array.isArray(dataset?.value)
                    ? dataset.value
                    : dataset?.value != null
                    ? [dataset.value]
                    : [];

                resolved.items = await Promise.all(
                    records.map(async function (record) {
                        return {
                            value: clone(record),
                            navigation: clone(record?.navigation),
                            fields: await resolveFields({
                                fields: resolved.fields,
                                schema: schema,
                                record: record,
                                context: context
                            })
                        };
                    })
                );

                delete resolved.fields;
            }

            for (const key of Object.keys(resolved)) {
                if (key === "items") continue;
                resolved[key] = await resolveNode({ node: resolved[key], context });
            }

            return resolved;
        }

        // Objeto Estándar
        const result = {};
        for (const [key, value] of Object.entries(node)) {
            result[key] = await resolveNode({ node: value, context });
        }

        return result;
    }

    // ==================================================
    // RESOLVE FIELDS
    // ==================================================
    async function resolveFields({ fields = [], schema = [], record = null, context = {} }) {
        return await Promise.all(
            fields.map(function (layoutField) {
                return resolveField({ layoutField, schema, record, context });
            })
        );
    }

    // ==================================================
    // RESOLVE FIELD
    // ==================================================
    async function resolveField({ layoutField = {}, schema = [], record = null, context = {} }) {
        const schemaField = schema.find(function (f) {
            return f.campo === layoutField.campo;
        }) || {};

        const field = mergeField({ schemaField, layoutField });

        field.value = resolveValue({ record, campo: field.campo });
        field.__resolved = resolveResolved({ record, campo: field.campo });
        field.resolvedValue = field.__resolved != null ? clone(field.__resolved) : null;

        if (field.fields?.length && field.__resolved) {
            field.fields = await resolveFields({
                fields: field.fields,
                schema: schemaField.fields || [],
                record: field.__resolved,
                context
            });
        } else if (field.value && typeof field.value === "object" && !Array.isArray(field.value)) {
            field.fields = await resolveFields({
                fields: field.fields || [],
                schema: schemaField.fields || [],
                record: Object.assign({}, field.value),
                context
            });
        }

        if (Array.isArray(field.value)) {
            field.items = await Promise.all(
                field.value.map(async function (item) {
                    return {
                        value: clone(item),
                        navigation: clone(item?.navigation),
                        fields: await resolveFields({
                            fields: field.fields || [],
                            schema: schemaField.fields || [],
                            record: item,
                            context: context
                        })
                    };
                })
            );
        }

        return field;
    }

    // ==================================================
    // HELPERS
    // ==================================================
    function mergeField({ schemaField = {}, layoutField = {} }) {
        const schemaChildren = schemaField.fields || [];
        const layoutChildren = layoutField.fields || [];

        const mergedChildren = layoutChildren.map(function (layoutChild) {
            const schemaChild = schemaChildren.find(function (s) {
                return s.campo === layoutChild.campo;
            }) || {};
            return mergeField({ schemaField: schemaChild, layoutField: layoutChild });
        });

        return Object.assign({}, schemaField, layoutField, {
            fields: mergedChildren.length ? mergedChildren : schemaChildren
        });
    }

    function resolveValue({ record, campo }) {
        if (record == null || !campo) return null;

        if (Object.prototype.hasOwnProperty.call(record, campo)) {
            return clone(record[campo]);
        }

        const parts = String(campo).split(".");
        let value = record;

        for (const part of parts) {
            value = value?.[part];
            if (value === undefined) return null;
        }

        return clone(value);
    }

    function resolveResolved({ record, campo }) {
        if (!record?.__resolved || !campo) return null;
        return clone(record.__resolved[campo]) ?? null;
    }

    log(`${FILE} inicializado correctamente.`);

})();