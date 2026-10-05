// ======================================================
// 📁 js/resolvers/definitionResolver.js
// ======================================================

(function(){

    const FILE = "definitionResolver";
    
    const log   = (...a)=>window.logger?.info?.(FILE,...a);
    const error = (...a)=>window.logger?.error?.(FILE,...a);
    
    window.definitionResolver = {

        execute,
        resolve
    
    };
    
    // ======================================================
    // EXECUTE
    // ======================================================

    async function execute({

        context = {}

    } = {}){

        try{

            const definition = resolve({

                context

            });

            context.definition = definition;
            context.definitions = definition;

            // --------------------------------------------------
            // RESOLVER PROFILE DEFINITION
            // --------------------------------------------------
            const profileName = 
                context.profile || 
                context.context?.profile || 
                "runtime";

            const profiles = 
                definition?.startup?.profiles || {};

            context.profile = profileName;
            
            // Asigna la configuración específica del perfil (ej. runtime)
            context.profileDefinition = 
                profiles[profileName] || null;

            log(`Perfil resuelto: '${profileName}'`, context.profileDefinition);

            return definition;

        }
        catch(e){

            error(
                "execute:",
                e
            );

            throw e;

        }

    }

    // ======================================================
    // RESOLVE
    // ======================================================
    
    function resolve({

        context = {}
    
    } = {}){
    
        try{
    
            const definition =
                context?.root?.definition;
    
            if(!definition){
    
                throw new Error(
                    "No existe la sección 'definition'."
                );
    
            }
    
            return definition;
    
        }
        catch(e){
    
            error(
                "resolve:",
                e
            );
    
            throw e;
    
        }
    
    }
        
})();