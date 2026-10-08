// ======================================================
// 📁 js/layouts/navigationLayout.js (Safari Catalina Ready)
// ======================================================
// UNIVERSAL DECLARATIVE RUNTIME
//
// RESPONSABILIDAD:
// - Renderizar barras y botones de navegación.
//
// DELEGA NAVEGACIÓN A:
// - window.navigateRenderer.navigate()
// ======================================================

(function () {

    const FILE = "navigationLayout.js";

    const log = (...a) => window.logger?.info?.(FILE, ...a);
    const warn = (...a) => window.logger?.warn?.(FILE, ...a);
    const error = (...a) => window.logger?.error?.(FILE, ...a);

    // ==================================================
    // EXPORTS
    // ==================================================
    window.navigation = {
        render: render
    };

    // ==================================================
    // MAIN RENDER
    // ==================================================
    async function render({
        container,
        section = {},
        context = {}
    } = {}) {

        try {
            if (!container) return;

            container.innerHTML = "";

            // 1. Obtención del Dataset
            const datasetKey = section.dataset || section.dataSource;
            const dataset = context.datasets?.[datasetKey] || null;

            if (!dataset) {
                warn("Dataset inexistente para la navegación:", datasetKey);
                return;
            }

            // 2. Extracción de Ítems
            const items = dataset.value?.items || dataset.value || [];

            if (!Array.isArray(items) || items.length === 0) {
                warn("Lista de ítems de navegación vacía o inválida.");
                return;
            }

            // 3. Renderizado de Elementos (Iteración segura para Safari Catalina)
            for (var i = 0; i < items.length; i++) {
                renderItem({
                    container: container,
                    item: items[i],
                    context: context
                });
            }

        } catch (e) {
            error("Error en render de navigationLayout:", e);
            if (window.errorHandler?.handle) {
                window.errorHandler.handle({
                    error: e,
                    context: "navigationLayout",
                    step: "render"
                });
            }
        }
    }

    // ==================================================
    // RENDER ITEM
    // ==================================================
    function renderItem({
        container,
        item = {}
    } = {}) {

        try {
            const button = document.createElement("button");
            button.className = "navigation-button";

            button.innerText =
                item.label ||
                item.title ||
                item.text ||
                "Sin título";

            // Asignación de Ícono
            if (item.icon) {
                button.dataset.icon = item.icon;
            }

            // Configuración del Evento Click
            if (window.navigateRenderer?.isNavigation?.(item.navigation)) {
                button.onclick = async function () {
                    try {
                        await window.navigateRenderer.navigate(item.navigation);
                    } catch (err) {
                        error("Error al ejecutar navegación:", err);
                        if (window.errorHandler?.handle) {
                            window.errorHandler.handle({
                                error: err,
                                context: "navigationLayout",
                                step: "navigate"
                            });
                        }
                    }
                };
            } else {
                button.disabled = true;
            }

            container.appendChild(button);

        } catch (e) {
            error("Error en renderItem de navigationLayout:", e);
        }
    }

    log("✅ navigationLayout inicializado correctamente.");

})();