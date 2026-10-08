// ======================================================
// 📁 js/core/router.js
// ======================================================

(function () {

    const FILE = "router.js";

    const log   = (...a) => window.logger?.info?.(FILE, ...a);
    const debug = (...a) => window.logger?.debug?.(FILE, ...a);

    window.router = {
        navigate,
        back,
        reload
    };

    // ======================================================
    // 🚀 NAVIGATE
    // ======================================================
    async function navigate(params = {}) {
        try {
            const {
                html = "index.html",
                file = "",
                path = ""
            } = params;

            if (!html) {
                throw new Error("El parámetro 'html' es requerido para la navegación.");
            }

            const query = buildURL(file, path);
            let fullURL = html + query;

            // Forzar refresco añadiendo timestamp
            fullURL += (fullURL.includes('?') ? '&' : '?') + '_t=' + Date.now();

            debug("Navegando a:", fullURL);

            window.location.assign(fullURL);

        } catch (e) {
            // 🚨 Delegación al manejador central de errores
            if (window.errorHandler?.handle) {
                window.errorHandler.handle({
                    error: e,
                    context: "Router",
                    step: "navigate",
                    fatal: false // No fatal si no detiene un pipeline activo, pero registra el fallo
                });
            } else {
                window.logger?.error?.(FILE, "navigate:", e);
            }
        }
    }

    // ======================================================
    // 🛠️ HELPERS
    // ======================================================
    function buildURL(file, path = "") {
        const query = new URLSearchParams();
        if (file) query.set("file", file);
        if (path) query.set("path", path);
        const str = query.toString();
        return str ? `?${str}` : "";
    }

    function back() {
        window.history.back();
    }

    function reload() {
        window.location.reload(true);
    }

    log("✅ router cargado e integrado con errorHandler");

})();