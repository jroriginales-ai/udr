// ======================================================
// 📁 js/layouts/pageLayout.js (Safari Catalina Ready)
// ======================================================
// ✅ UNIVERSAL DECLARATIVE RUNTIME
// ✅ Compatible con layoutRenderer actual
// ✅ Registro automático en window.page y window.pageLayout
// ======================================================

(function () {

    const FILE = "pageLayout.js";

    const log = (...a) => window.logger?.info?.(FILE, ...a);
    const warn = (...a) => window.logger?.warn?.(FILE, ...a);
    const error = (...a) => window.logger?.error?.(FILE, ...a);

    const api = {
        render
    };

    // ======================================================
    // RENDER MAIN
    // ======================================================
    async function render({
        container,
        section = {},
        context = {}
    } = {}) {

        try {
            if (!container) {
                warn("Contenedor DOM no proporcionado.");
                return;
            }

            container.innerHTML = "";

            // Soporta recibir el layout directamente en section o dentro de context.layout
            const currentSection = section.sections ? section : (context.layout || {});
            const sections = currentSection.sections || [];

            log(`Renderizando pageLayout con ${sections.length} secciones.`);

            if (!Array.isArray(sections)) {
                warn("Estructura 'sections' inválida:", sections);
                return;
            }

            // Identifica la función de renderizado disponible en layoutRenderer
            const renderFn =
                window.layoutRenderer?.renderLayout ||
                window.layoutRenderer?.render;

            if (!renderFn) {
                error("No se encontró el método de renderizado en window.layoutRenderer");
                return;
            }

            // Iteración tradicional para compatibilidad con Safari 13/14 (macOS Catalina)
            for (var i = 0; i < sections.length; i++) {
                var childSection = sections[i];

                var sectionContainer = document.createElement("div");
                sectionContainer.className = "page-section";
                container.appendChild(sectionContainer);

                await renderFn.call(window.layoutRenderer, {
                    container: sectionContainer,
                    section: childSection,
                    context: context
                });
            }

        } catch (e) {
            error("render:", e);
            if (window.errorHandler?.handle) {
                window.errorHandler.handle({
                    error: e,
                    context: "pageLayout",
                    step: "render"
                });
            }
        }
    }

    // Registrar en ambas llaves para evitar fallos de resolución por nombre
    window.page = api;
    window.pageLayout = api;

    log("✅ pageLayout registrado correctamente.");

})();