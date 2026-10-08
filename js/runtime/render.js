// ======================================================
// 📁 js/runtime/render.js
// ======================================================

(function () {

    const FILE = "render.js";
    const log = (...a) => window.logger?.info?.(FILE, ...a);

    window.render = {
        execute
    };

    // ======================================================
    // 🚀 EXECUTE (Paso del Pipeline)
    // ======================================================
    async function execute({ context = {} } = {}) {
        log("Ejecutando render con layout:", context.layout);

        // Resolvemos el contenedor o permitimos que layoutRenderer aplique sus fallbacks
        const container =
            context.container ||
            document.getElementById("content-view") ||
            document.body;

        if (!window.layoutRenderer?.render) {
            throw new Error("El módulo 'layoutRenderer' no está cargado o registrado en el entorno global.");
        }

        // Delegación directa: Si layoutRenderer falla, el error escala automáticamente
        // hacia runtime.js y es procesado centralizadamente por errorHandler.js
        return await window.layoutRenderer.render({
            container,
            context
        });
    }

    log(`${FILE} inicializado correctamente.`);

})();