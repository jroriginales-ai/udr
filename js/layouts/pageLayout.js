// ======================================================
// 📁 js/layouts/pageLayout.js
// ======================================================

(function(){

    const FILE = "pageLayout.js";

    const log   = (...a) => window.logger?.info?.(FILE, ...a);
    const debug = (...a) => window.logger?.debug?.(FILE, ...a);
    const warn  = (...a) => window.logger?.warn?.(FILE, ...a);
    const error = (...a) => window.logger?.error?.(FILE, ...a);

    const api = {

        render

    };

    async function render({

        container,
        section = {},
        context = {}

    } = {}){

        try{

            if(!container){
                warn("Contenedor DOM no proporcionado.");
                return;
            }

            container.innerHTML = "";

            // Soporta recibir el layout directamente en section o dentro de context.layout
            const currentSection = section.sections ? section : (context.layout || {});
            const sections = currentSection.sections || [];

            log(`Renderizando pageLayout con ${sections.length} secciones.`);

            if(!Array.isArray(sections)){
                warn("sections inválido.", sections);
                return;
            }

            // Identifica la función de renderizado disponible en layoutRenderer
            const renderFn = 
                window.layoutRenderer?.renderLayout || 
                window.layoutRenderer?.render;

            if(!renderFn){
                error("No se encontró el método de renderizado en window.layoutRenderer");
                return;
            }

            for(const childSection of sections){

                const sectionContainer = document.createElement("div");
                sectionContainer.className = "page-section";
                container.appendChild(sectionContainer);

                await renderFn.call(window.layoutRenderer, {
                    container: sectionContainer,
                    section: childSection,
                    context
                });

            }

        }
        catch(e){

            error("render:", e);

        }

    }

    // Registrar en ambas llaves para evitar fallos de resolución por nombre
    window.page = api;
    window.pageLayout = api;

    log("✅ pageLayout registrado correctamente");

})();