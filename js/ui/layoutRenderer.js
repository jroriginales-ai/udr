// ======================================================
// 📁 js/renderers/layoutRenderer.js
// ======================================================

(function () {

    const FILE = "layoutRenderer.js";
    const log = (...a) => window.logger?.info?.(FILE, ...a);

    // Registry interno de layouts
    const registry = Object.create(null);

    const cleanKey = (name) => String(name || "").trim().toLowerCase();

    // ==================================================
    // EXPORT
    // ==================================================
    window.layoutRenderer = {
        execute,
        render,
        renderLayout,
        registerLayout:   (name, l) => { if (name && l) registry[cleanKey(name)] = l; },
        unregisterLayout: (name) => delete registry[cleanKey(name)],
        hasLayout:        (name) => !!registry[cleanKey(name)],
        getLayout:        (name) => registry[cleanKey(name)] || null,
        getLayoutRegistry: () => ({ ...registry })
    };

    // ==================================================
    // EXECUTE (Paso del Pipeline)
    // ==================================================
    async function execute({ context = {} } = {}) {
        await render({ context });
        return context.layout;
    }

    // ==================================================
    // RENDER
    // ==================================================
    async function render({
        container,
        context = {},
        section = null
    } = {}) {

        const targetContainer =
            container ||
            document.getElementById("content-view") ||
            document.getElementById("app") ||
            document.body;

        if (!targetContainer) {
            throw new Error("Contenedor DOM objetivo no encontrado para el renderizado del layout.");
        }

        const runtimeSection = section || context.layout;

        if (!runtimeSection) {
            throw new Error("No se definió una sección de 'layout' en el contexto runtime.");
        }

        return await renderLayout({
            container: targetContainer,
            section: runtimeSection,
            context
        });
    }

    // ==================================================
    // RENDER LAYOUT
    // ==================================================
    async function renderLayout({
        container,
        section,
        context = {}
    } = {}) {

        if (!container || !section) return;

        const component = resolveComponent(section);
        const renderer = getLayout(component);

        if (!renderer) {
            throw new Error(`Layout no registrado en el runtime: '${component}'.`);
        }

        log(`Ejecutando renderer para el componente: '${component}'`);

        const renderFn =
            (typeof renderer.render === "function" && renderer.render) ||
            (typeof renderer.renderLayout === "function" && renderer.renderLayout) ||
            (typeof renderer === "function" && renderer);

        if (typeof renderFn !== "function") {
            throw new Error(`El layout '${component}' no implementa una función de renderizado válida.`);
        }

        // Firma unificada: la orquestación no conoce ni modifica casos particulares por nombre de componente
        return await renderFn.call(renderer, {
            container,
            section,
            context
        });
    }

    // ==================================================
    // HELPERS
    // ==================================================
    function resolveComponent(section = {}) {
        return cleanKey(section.component || section.type || "object");
    }

    function getLayout(name) {
        if (!name) return null;

        const key = cleanKey(name);

        // 1. Registro interno
        if (registry[key]) {
            return registry[key];
        }

        // 2. Fallbacks de compatibilidad en window (ej. window.detailLayout, window.editLayout)
        return window[key] || window[`${key}Layout`] || null;
    }

    log(`${FILE} inicializado correctamente.`);

})();