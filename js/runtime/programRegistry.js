// ======================================================
// 📁 js/runtime/programRegistry.js
// ======================================================

(function () {

    const FILE = "programRegistry.js";

    const log = (...a) => window.logger?.info?.(FILE, ...a);

    const registry = Object.create(null);

    window.programRegistry = {
        registerProgram,
        unregisterProgram,
        hasProgram,
        getProgram,
        execute
    };

    function registerProgram(name, program) {
        if (!name || !program) {
            log("Intento de registro inválido:", { name, program });
            return false;
        }
        registry[name] = program;
        return true;
    }

    function unregisterProgram(name) {
        return delete registry[name];
    }

    function hasProgram(name) {
        return !!registry[name];
    }

    function getProgram(name) {
        return registry[name] || null;
    }

    // ======================================================
    // 🚀 EXECUTE (Invocado por runtime.js)
    // ======================================================
    async function execute({ name, context = {} } = {}) {
        const program = registry[name];

        if (!program) {
            throw new Error(`Programa no registrado en el registry: '${name}'.`);
        }

        if (typeof program.execute !== "function") {
            throw new Error(`El programa '${name}' no implementa la función execute().`);
        }

        // Se ejecuta y si falla, el error escala directamente a runtime.js -> errorHandler.js
        return await program.execute({ context });
    }

    log(`${FILE} inicializado correctamente.`);

})();