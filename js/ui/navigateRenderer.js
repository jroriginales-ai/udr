// ======================================================
// 📁 js/ui/navigateRenderer.js
// ======================================================

(function () {

    const FILE = "navigateRenderer.js";
    const log = (...a) => window.logger?.info?.(FILE, ...a);

    window.navigateRenderer = {
        buildHref,
        navigate,
        isNavigation
    };

    // ==========================================
    // DETECTA OBJETO NAVIGATION
    // ==========================================
    function isNavigation(value) {
        return !!(
            value &&
            typeof value === "object" &&
            value.html &&
            value.source
        );
    }

    // ==========================================
    // BUILD HREF
    // ==========================================
    function buildHref(navigation = {}) {
        if (!navigation || typeof navigation !== "object") {
            return "#";
        }

        const html = navigation.html || "index.html";
        const file = navigation.source?.file;
        const path = navigation.source?.path;
        const parameters = navigation.parameters || {};

        const params = new URLSearchParams();

        if (file) params.append("file", file);
        if (path) params.append("path", path);

        // Incorporar parámetros adicionales
        for (const [key, val] of Object.entries(parameters)) {
            if (val !== undefined && val !== null) {
                params.append(key, val);
            }
        }

        const query = params.toString();
        return query ? `${html}?${query}` : html;
    }

    // ==========================================
    // NAVEGAR (Con reporte al errorHandler)
    // ==========================================
    async function navigate(navigation = {}) {
        try {
            const href = buildHref(navigation);

            if (href === "#") {
                throw new Error("Estructura de navegación inválida o vacía.");
            }

            log("Navegando a:", href);
            window.location.href = href;

        } catch (e) {
            // Reporte al errorHandler centralizado (fatal: false)
            if (window.errorHandler?.handle) {
                window.errorHandler.handle({
                    error: e,
                    context: "NavigateRenderer",
                    step: "navigate",
                    fatal: false
                });
            } else {
                window.logger?.error?.(FILE, "navigate:", e);
            }
        }
    }

    log(`${FILE} inicializado correctamente.`);

})();