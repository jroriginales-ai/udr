// ======================================================
// 📁 js/resolvers/datasetResolver.js (Safari Catalina Ready)
// ======================================================

(function () {

    const FILE = "datasetResolver.js";
    const log = (...a) => window.logger?.info?.(FILE, ...a);

    window.datasetResolver = {
        execute,
        resolve
    };

    // ======================================================
    // EXECUTE (Paso del Pipeline / Resolver)
    // ======================================================
    async function execute({ context = {} } = {}) {
        // Resuelve todos los datasets y los asigna al contexto global
        context.datasets = await resolve({ context });

        log("Datasets resueltos correctamente:", Object.keys(context.datasets));

        return context.datasets;
    }

    // ======================================================
    // RESOLVE (Paralelización asíncrona)
    // ======================================================
    async function resolve({ context = {} } = {}) {
        const definitions = context?.definition?.datasets || [];
        const datasets = Object.create(null);

        if (!Array.isArray(definitions) || definitions.length === 0) {
            log("No hay datasets definidos en 'definition.datasets'.");
            return datasets;
        }

        // 1. Resolver todos los datasets y schemas en paralelo
        const resolvedList = await Promise.all(
            definitions.map(async function (def) {
                if (!def || !def.id) return null;

                // Resolución del valor de datos usando dataResolver
                const value = await window.dataResolver?.resolve?.({
                    root: context.root,
                    jsonPath: def.path
                });

                // Obtención del esquema asociado usando schemaResolver
                const schema = await window.schemaResolver?.getSchema?.({
                    name: def.schema,
                    context: context
                });

                return {
                    id: def.id,
                    dataset: {
                        id: def.id,
                        definition: def,
                        value: value !== undefined ? value : null,
                        schema: schema || []
                    }
                };
            })
        );

        // 2. Mapear los resultados resueltos al diccionario de datasets
        for (var i = 0; i < resolvedList.length; i++) {
            var item = resolvedList[i];
            if (item && item.id) {
                datasets[item.id] = item.dataset;
            }
        }

        return datasets;
    }

    log(`${FILE} inicializado correctamente.`);

})();