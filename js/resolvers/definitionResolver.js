// ======================================================
// 📁 js/resolvers/definitionResolver.js (Safari Catalina Ready)
// ======================================================

(function () {

    const FILE = "definitionResolver";
    const log = (...a) => window.logger?.info?.(FILE, ...a);

    window.definitionResolver = {
        execute,
        resolve
    };

    // ======================================================
    // EXECUTE (Paso del Pipeline / Resolver)
    // ======================================================
    async function execute({ context = {} } = {}) {
        // Obtiene la sección 'definition' del JSON (_root.definition)
        const definition = resolve({ context });

        context.definition = definition;

        // Determina el nombre del perfil activo (por defecto: 'runtime')
        const profileName =
            context.profile ||
            context.context?.profile ;

        const profiles = definition?.startup?.profiles || {};

        context.profile = profileName;

        // Extrae la configuración específica del perfil (pipeline, layouts, etc.)
        context.profileDefinition = profiles[profileName] || null;

        if (!context.profileDefinition) {
            throw new Error(`El perfil '${profileName}' no está definido en 'definition.startup.profiles'.`);
        }

        log(`Perfil resuelto con éxito: '${profileName}'`, context.profileDefinition);

        return definition;
    }

    // ======================================================
    // RESOLVE (Extracción directa)
    // ======================================================
    function resolve({ context = {} } = {}) {
        const definition = context?.root?.definition;

        if (!definition) {
            throw new Error("No se encontró la sección 'definition' dentro del objeto raíz (_root).");
        }

        return definition;
    }

})();