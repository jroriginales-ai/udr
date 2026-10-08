// ======================================================
// 📁 js/core/logger.js
// ✅ LOGGER v3 (Sin redundancia de switch)
// ======================================================

(function () {

    const FILE = "logger.js";

    const LEVELS = {
        debug: "DEBUG",
        info:  "INFO",
        warn:  "WARN",
        error: "ERROR"
    };

    function now() {
        return new Date().toISOString().replace("T", " ").replace("Z", "");
    }

    function log(level, file, ...args) {
        // Control de nivel DEBUG global
        if (level === "debug" && !window.DEBUG) {
            return;
        }

        const prefix = `[${now()}] [${file}] [${LEVELS[level] || level.toUpperCase()}]`;
        
        // Mapeo dinámico: llama a console.debug, console.info, console.warn o console.error
        const consoleMethod = console[level] ? level : "log";
        
        console[consoleMethod](prefix, ...args);
    }

    window.logger = {
        debug: (file, ...args) => log("debug", file, ...args),
        info:  (file, ...args) => log("info",  file, ...args),
        warn:  (file, ...args) => log("warn",  file, ...args),
        error: (file, ...args) => log("error", file, ...args)
    };

    if (window.DEBUG === undefined) {
        window.DEBUG = true;
    }

    window.logger.info(FILE, "Logger v3 inicializado correctamente.");

})();