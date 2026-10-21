// ======================================================
// 📁 js/runtime/errorHandler.js
// ======================================================

(function () {

  const FILE = "errorHandler.js";

  window.errorHandler = {
    handle
  };

  function handle({ error, context = "Sistema", step = null, fatal = true } = {}) {
    const errorMessage = error?.message || String(error);
    const stepInfo = step ? ` [Paso: ${step}]` : "";
    const formattedMessage = `[UDR Error] ${context}${stepInfo}: ${errorMessage}`;

    // 1. Log unificado usando la consola / logger existente
    if (window.logger?.error) {
      window.logger.error(FILE, formattedMessage, error);
    } else {
      console.error(formattedMessage, error);
    }

    // 2. Opcional: Feedback visual en la UI si es un error fatal
    if (fatal) {
      renderErrorUI(formattedMessage);
    }

    return {
      success: false,
      error: formattedMessage
    };
  }

  function renderErrorUI(message) {
    const container = document.getElementById("app") || document.body;
    const errorBanner = document.createElement("div");
    
    errorBanner.style.cssText = `
      background: #3b1419;
      color: #f87171;
      border: 1px solid #ef4444;
      padding: 16px;
      margin: 20px;
      border-radius: 12px;
      font-family: sans-serif;
      font-size: 14px;
    `;
    
    errorBanner.innerHTML = `<strong>⚠️ Error de Runtime:</strong> ${message}`;
    container.prepend(errorBanner);
  }

})();