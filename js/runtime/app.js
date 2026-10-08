// ======================================================
// 📁 js/app.js (Safari Catalina Ready)
// ✅ UNIVERSAL DECLARATIVE RUNTIME
// ✅ Compatible con window.router
// ✅ Sin ES Modules
// ======================================================

(function () {

  const FILE = "app.js";

  const log = (...a) => window.logger?.info?.(FILE, ...a);
  const warn = (...a) => window.logger?.warn?.(FILE, ...a);

  // ==========================================
  // PARSER DE PARÁMETROS URL
  // ==========================================
  function getRuntimeParams() {
    const search = new URLSearchParams(window.location.search);
    const context = {};

    // Iteración compatible con Safari 13+ (macOS Catalina)
    search.forEach(function (value, key) {
      context[key] = value;
    });

    return {
      file: search.get("file"),
      path: search.get("path"),
      profile: search.get("profile"),
      context: context
    };
  }

  // ==========================================
  // INICIALIZACIÓN DE LA APLICACIÓN
  // ==========================================
  async function startApp() {
    try {
      log("Iniciando Universal Declarative Runtime...");

      if (!window.runtime || typeof window.runtime.init !== "function") {
        throw new Error("El módulo 'window.runtime' no está disponible o no se ha cargado.");
      }

      const params = getRuntimeParams();
      log("Parámetros de ejecución extraídos:", params);

      // Inicia el ciclo de vida del runtime
      await window.runtime.init(params);

      log("Runtime e interfaz inicializados con éxito.");

    } catch (e) {
      // Escalación al sistema centralizado de errores
      if (window.errorHandler?.handle) {
        window.errorHandler.handle({
          error: e,
          context: "AppBootstrap",
          step: "startApp",
          fatal: true
        });
      } else {
        window.logger?.error?.(FILE, "startApp:", e);
      }
    }
  }

  // ==========================================
  // DISPARADOR
  // ==========================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }

})();