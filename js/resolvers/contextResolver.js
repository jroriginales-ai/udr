// ======================================================
// 📁 js/resolvers/contextResolver.js (Safari Catalina Ready)
// ======================================================

(function () {

    const FILE = "contextResolver.js";
    const log = (...a) => window.logger?.info?.(FILE, ...a);
    const debug = (...a) => window.logger?.debug?.(FILE, ...a);
    const warn = (...a) => window.logger?.warn?.(FILE, ...a);

    window.contextResolver = {
        execute,
        resolveIntent,
        extractNodes,
        buildOutput
    };

    // Helper de clonado compatible con Safari 13/14 (macOS Catalina)
    function clone(value) {
        if (value == null) return value;
        if (typeof window.structuredClone === "function") {
            return window.structuredClone(value);
        }
        return JSON.parse(JSON.stringify(value));
    }

    // ======================================================
    // EXECUTE (Paso del Pipeline / Resolver)
    // ======================================================
    async function execute({
        persona1 = null,
        intencion = "",
        persona2 = [],
        field = null,
        selectedId = null,
        selectedField = null,
        selectedValue = null
    } = {}) {

        if (!persona1) {
            throw new Error("El parámetro 'persona1' es requerido.");
        }

        if (!intencion) {
            throw new Error("El parámetro 'intencion' es requerido.");
        }

        if (!Array.isArray(persona2)) {
            throw new Error("El parámetro 'persona2' debe ser una lista.");
        }

        const motorConfig = persona1?.definition?.motor_config || {};
        const rutas = motorConfig.rutas_orquestacion || {};
        const estructuraBase = motorConfig.estructura_salida_base;

        if (!estructuraBase) {
            throw new Error("No existe 'estructura_salida_base' dentro de motor_config.");
        }

        // 1. Resolver Intención desde el Mapa
        const mapaIntenciones = window.pathResolver?.getByPath?.(
            persona1,
            rutas.contenedor,
            []
        ) || [];

        const contexto = resolveIntent({
            mapaIntenciones: mapaIntenciones,
            intencion: intencion,
            campoContexto: rutas.campo_contexto
        });

        if (!contexto) {
            debug("Intención no encontrada en el mapa:", intencion);
            return null;
        }

        // 2. Extraer Nodos del Emisor (persona1)
        const datosEmisor = extractNodes({
            root: persona1,
            paths: window.pathResolver?.getByPath?.(
                contexto,
                rutas.campo_emisor,
                []
            ) || []
        });

        // 3. Obtener Personas Receptoras (si viene vacío, intenta resolver vía relación)
        let personasReceptor = persona2;

        if (personasReceptor.length === 0 && field?.relation?.source?.file) {
            const source = field.relation.source;

            const receptorRuntimeContext = await window.runtime?.init?.({
                file: source.file,
                path: source.path,
                profile: "selector",
                context: {
                    parameters: {
                        selectedId: selectedId,
                        selectedField: selectedField,
                        selectedValue: selectedValue
                    }
                }
            });

            const receptorRoot = receptorRuntimeContext?.root;

            if (Array.isArray(receptorRoot)) {
                personasReceptor = receptorRoot;
            } else if (receptorRoot) {
                personasReceptor = [receptorRoot];
            }
        }

        // 4. Extraer Nodos para la Lista de Receptores (Soporta 0 a N)
        const pathsReceptor = window.pathResolver?.getByPath?.(
            contexto,
            rutas.campo_receptor,
            []
        ) || [];

        const datosReceptor = personasReceptor.map(function (persona) {
            return extractNodes({
                root: persona,
                paths: pathsReceptor
            });
        });

        // 5. Construir Estructura de Salida
        return buildOutput({
            estructuraBase: estructuraBase,
            contexto: contexto,
            intencion: intencion,
            persona1: persona1,
            persona2: personasReceptor,
            datosEmisor: datosEmisor,
            datosReceptor: datosReceptor
        });
    }

    // ======================================================
    // HELPERS
    // ======================================================

    function resolveIntent({
        mapaIntenciones = [],
        intencion = "",
        campoContexto = ""
    } = {}) {
        if (!Array.isArray(mapaIntenciones) || !campoContexto) {
            return null;
        }

        return mapaIntenciones.find(function (item) {
            return window.pathResolver?.getByPath?.(
                item,
                campoContexto,
                undefined
            ) === intencion;
        }) || null;
    }

    function extractNodes({
        root = {},
        paths = []
    } = {}) {
        const resultado = {};

        if (!Array.isArray(paths)) {
            return resultado;
        }

        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            var value = window.pathResolver?.getByPath?.(
                root,
                path,
                undefined
            );

            if (value === undefined) continue;

            window.pathResolver?.setByPath?.(
                resultado,
                path,
                value
            );
        }

        return resultado;
    }

    function buildOutput({
        estructuraBase,
        contexto,
        intencion,
        persona1,
        persona2 = [],
        datosEmisor,
        datosReceptor = []
    } = {}) {

        const resultado = clone(estructuraBase);
        const nombreEmisor = persona1?.nombre || persona1?.id || "";

        window.pathResolver?.setByPath?.(
            resultado,
            "contexto_sistema.intencion_detectada",
            intencion
        );

        // Mapear Entidades Cruzadas (Múltiples Receptores 0 a N)
        const entidadesCruzadas = {
            [nombreEmisor]: datosEmisor
        };

        for (var i = 0; i < persona2.length; i++) {
            var persona = persona2[i];
            var nombreReceptor = persona?.nombre || persona?.id || "";

            if (!nombreReceptor) continue;

            entidadesCruzadas[nombreReceptor] = datosReceptor[i] || {};
        }

        window.pathResolver?.setByPath?.(
            resultado,
            "datos_encontrados.entidades_cruzadas",
            entidadesCruzadas
        );

        // Construir Instrucción Consolidada (Sin espacios extra si persona2 está vacía)
        const nombresReceptores = persona2
            .map(function (p) { return p?.nombre || p?.id || ""; })
            .filter(Boolean);

        const partesInstruccion = [nombreEmisor, intencion].concat(nombresReceptores);

        window.pathResolver?.setByPath?.(
            resultado,
            "instruccion_usuario",
            partesInstruccion.join(" ")
        );

        log("Resultado de contexto construido correctamente:", resultado);

        // Descarga opcional del JSON resultante
        if (window.jsonDownloader?.download) {
            window.jsonDownloader.download({
                json: resultado,
                fileName: "resultado.json"
            });
        } else {
            warn("jsonDownloader no está disponible en window.");
        }

        return resultado;
    }

    log(`${FILE} inicializado correctamente.`);

})();