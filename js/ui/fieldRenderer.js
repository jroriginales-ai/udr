// ======================================================
// 📁 js/ui/fieldRenderer.js
// ======================================================

(function () {

    const FILE = "fieldRenderer.js";
    const log = (...a) => window.logger?.info?.(FILE, ...a);

    // Registry interno de funciones renderizadoras
    const registry = Object.create(null);

    const cleanKey = (name) => String(name || "").trim();

    window.fieldRenderer = {
        render,
        resolveRenderer,
        registerRenderer:   (name, r) => { if (name && r) registry[cleanKey(name)] = r; },
        unregisterRenderer: (name) => delete registry[cleanKey(name)],
        hasRenderer:        (name) => !!registry[cleanKey(name)],
        getRenderer:        (name) => registry[cleanKey(name)] || null,
        getRendererRegistry: () => ({ ...registry })
    };

    async function render({
        container,
        value,
        field = {},
        mode = "display",
        context = {}
    } = {}) {

        if (!container) return;
        container.innerHTML = "";

        const rendererName = resolveRenderer({ field, context });
        const renderer = registry[cleanKey(rendererName)];

        if (!renderer) {
            throw new Error(`Renderer no registrado: '${rendererName}'.`);
        }

        if (typeof renderer.render !== "function") {
            throw new Error(`Renderer inválido en '${rendererName}': debe implementar la función render().`);
        }

        return await renderer.render({
            container,
            value,
            field,
            mode,
            context
        });
    }

    // ==================================================
    // 🚀 RESOLVE (Lee directamente del JSON)
    // ==================================================
    function resolveRenderer({ field = {}, context = {} } = {}) {
        // 1. Renderer explícito en el campo
        if (field.renderer) {
            return cleanKey(field.renderer);
        }

        // 2. Mapeo declarativo extraído del JSON (_root.meta.fieldRenderers)
        const jsonTypeMap = context.root?.meta?.fieldRenderers || {};
        const rawType = cleanKey(field.tipo).toLowerCase();

        if (rawType && jsonTypeMap[rawType]) {
            return jsonTypeMap[rawType];
        }

        // 3. Convenio dinámico o fallback si viene tipo pero no está en el mapa
        if (field.tipo) {
            return rawType.endsWith("renderer") 
                ? cleanKey(field.tipo) 
                : `${rawType}FieldRenderer`;
        }

        // 4. Layout embebido
        if (field.component) {
            return "__layout__";
        }

        // 5. Fallback por defecto
        return "textFieldRenderer";
    }

    // Default Layout Bridge
    window.fieldRenderer.registerRenderer("__layout__", {
        async render({ container, value, field, context }) {
            return await window.layoutRenderer?.renderLayout({
                container,
                section: field,
                context: {
                    ...context,
                    currentItem: value,
                    item: value
                }
            });
        }
    });

    log(`${FILE} inicializado.`);

})();