// ======================================================
// 📁 js/runtime/render.js
// ======================================================

(function(){

    const FILE = "render.js";

    const log   = (...a)=>window.logger?.info?.(FILE,...a);
    const error = (...a)=>window.logger?.error?.(FILE,...a);

    window.render = {

        execute

    };

    async function execute({

        context = {}

    } = {}){

        try{

            log("Ejecutando render con layout:", context.layout);

            // Identifica el contenedor objetivo en la página (ej. #content-view o document.body)
            const container = 
                context.container || 
                document.getElementById("content-view") || 
                document.body;

            return await window.layoutRenderer.render({

                container,

                context

            });

        }
        catch(e){

            error(
                "execute:",
                e
            );

            throw e;

        }

    }

    log(
        `${FILE} inicializado correctamente.`
    );

})();