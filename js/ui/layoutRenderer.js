// ======================================================
// 📁 js/renderers/layoutRenderer.js
// ======================================================

(function(){

    const FILE = "layoutRenderer.js";

    const log   = (...a)=>window.logger?.info?.(FILE,...a);
    const debug = (...a)=>window.logger?.debug?.(FILE,...a);
    const warn  = (...a)=>window.logger?.warn?.(FILE,...a);
    const error = (...a)=>window.logger?.error?.(FILE,...a);

    const layoutRegistry = Object.create(null);    

    // ==================================================
    // EXECUTE
    // ==================================================

    async function execute({ context = {} } = {}){
        try{
            await render({ context });
            return context.layout;
        }
        catch(e){
            error("execute:", e);
            throw e;
        }
    }

    // ==================================================
    // RENDER
    // ==================================================

    async function render({
        container,
        context = {},
        section = null
    } = {}){

        try{

            // Fallback robusto para encontrar el contenedor en el DOM
            container ??= 
                document.getElementById("content-view") || 
                document.getElementById("app") || 
                document.body;

            if(!container){
                error("Container no encontrado.");
                return;
            }

            const runtimeSection = section || context.layout;

            if(!runtimeSection){
                warn(`Layout no encontrado: "${runtimeSection}"`);
                return;
            }

            return await renderLayout({
                container,
                section: runtimeSection,
                context
            });

        }
        catch(e){
            error("render:", e);
        }

    }

    // ==================================================
    // RENDER LAYOUT
    // ==================================================

    async function renderLayout({
        container,
        section,
        context = {}
    } = {}){

        try{

            if(!container || !section) return;

            const component = resolveComponent(section);
            const renderer = getLayout(component);

            if(!renderer){
                error(`Layout no registrado: ${component}`);
                return;
            }

            log(`Ejecutando renderer para el componente: '${component}'`);

            const renderFn = 
                (typeof renderer.render === "function" && renderer.render) ||
                (typeof renderer.renderLayout === "function" && renderer.renderLayout) ||
                (typeof renderer === "function" && renderer);

            if(renderFn){

                // ----------------------------------------------
                // PREPARAR PARÁMETROS PARA editLayout
                // ----------------------------------------------
                if(component === "edit"){

                    const dataset = window.pathResolver?.getByPath?.(
                        context.originalRoot,
                        section.dataSource
                    );

                    const schema = await window.schemaResolver?.getSchema?.({
                        context,
                        name: section.schema
                    });

                    return await renderFn.call(renderer, {
                        container,
                        section,
                        context,
                        dataset,
                        schema
                    });

                }

                // ----------------------------------------------
                // RESTO DE LOS LAYOUTS
                // ----------------------------------------------
                return await renderFn.call(renderer, {
                    container,
                    section,
                    context
                });

            }

            error(`Renderer inválido para: ${component}`);

        }
        catch(e){
            error("renderLayout:", e);
        }

    }

    // ==================================================
    // RESOLVE COMPONENT
    // ==================================================

    function resolveComponent(section = {}){
        try{
            return String(
                section.component ||
                section.type ||
                "object"
            )
            .trim()
            .toLowerCase();
        }
        catch(e){
            error("resolveComponent:", e);
            return "object";
        }
    }

    // ==================================================
    // HAS LAYOUT
    // ==================================================

    function hasLayout(name){
        try{
            if(!name) return false;
            return !!getLayout(name);
        }
        catch(e){
            error("hasLayout:", e);
            return false;
        }
    }

    // ==================================================
    // GET LAYOUT (Con Búsqueda Global en Window)
    // ==================================================

    function getLayout(name){
        try{
            if(!name) return null;

            const key = String(name).trim().toLowerCase();

            // 1. Buscar en el registro interno
            if (layoutRegistry[key]) {
                return layoutRegistry[key];
            }

            // 2. Fallback: Buscar en window (ej. window.page, window.list)
            if (window[key]) {
                return window[key];
            }

            // 3. Fallback: Buscar con sufijo Layout en window (ej. window.pageLayout, window.listLayout)
            if (window[`${key}Layout`]) {
                return window[`${key}Layout`];
            }

            return null;

        }
        catch(e){
            error("getLayout:", e);
            return null;
        }
    }

    function registerLayout(name, layout){
        if(!name || !layout) return;

        layoutRegistry[
            String(name).trim().toLowerCase()
        ] = layout;
    }

    function unregisterLayout(name){
        delete layoutRegistry[
            String(name).trim().toLowerCase()
        ];
    }

    // ==================================================
    // EXPORT
    // ==================================================

    window.layoutRenderer = {
        execute,
        render,
        renderLayout,
        registerLayout,
        unregisterLayout,
        hasLayout,
        getLayout
    };

    log("layoutRenderer registrado correctamente.");

})();