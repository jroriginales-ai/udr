// runtime.js


(function () {

    const FILE = "runtime.js";
    
    const log   = (...a) => window.logger?.info?.(FILE, ...a);
    const debug = (...a) => window.logger?.debug?.(FILE, ...a);
    const warn  = (...a) => window.logger?.warn?.(FILE, ...a);
    const error = (...a) => window.logger?.error?.(FILE, ...a);
    
    //==================================================
    // EXPORTS
    //==================================================
    
    window.runtime = {
    
        init,
        run,
        execute
    
    };
    
    //==================================================
    // INIT
    //==================================================
    
    async function init({
    
        file = null,
        path = null,
        profile = null,
        context = {}
    
    } = {}){
    
        try{
    
            context.file = file;
            
            context.path = path;

            context.source = {

                file,
            
                path
            
            };

            context.profile = profile;
    
            return await execute({
    
                context
    
            });
    
        }
        catch(e){
    
            error(
                "init:",
                e
            );
    
            throw e;
    
        }
    
    }
    
    //==================================================
    // RUN
    //==================================================
    
    async function run({
    
        context = {}
    
    } = {}){
    
        return execute({
    
            context
    
        });
    
    }
    
    //==================================================
    // EXECUTE
    //==================================================
    
    async function execute({
    
        context = {}
    
    } = {}){
    
        try{
    
            //--------------------------------------------------
            // LOAD DOCUMENT
            //--------------------------------------------------
    
            if(!context.root){
    
                context.root =
                    await window.jsonLoader.load({

                        file: context.file,

                        path: context.path

                    });

    
            }
    
            if(!context.root){
    
                throw new Error(
                    "No fue posible cargar el documento."
                );
    
            }

            //--------------------------------------------------
            // DOCUMENTO ORIGINAL PARA EDIT MODE
            //--------------------------------------------------

            if(!context.originalRoot){

                context.originalRoot =
                    structuredClone(
                        context.root
                    );

            }          
    
            //--------------------------------------------------
            // STARTUP
            //--------------------------------------------------
    
            const startup =
    
                context.root
                    ?.definition
                    ?.startup
    
                ||
    
                {};
    
            //--------------------------------------------------
            // REGISTRY
            //--------------------------------------------------
    
            await registerRegistry({
    
                startup,
                context
    
            });
    
            //--------------------------------------------------
            // PROFILE
            //--------------------------------------------------
    
            const profileName =
    
                context.profile ||
    
                startup.profile ||
    
                "default";
    
            const profile =
    
                startup
                    ?.profiles
                    ?.[profileName];
    
            if(!profile){
    
                throw new Error(
    
                    `No existe el profile ${profileName}`
    
                );
    
            }

            context.profileDefinition = profile;            
    
            //--------------------------------------------------
            // EXECUTE PROFILE
            //--------------------------------------------------
    
            await executeProfile({
    
                profile,
                context
    
            });
    
            return context;
    
        }
        catch(e){
    
            error(
                "execute:",
                e
            );
    
            throw e;
    
        }
    
    }
    
    //==================================================
    // EXECUTE PROFILE
    //==================================================
    
// ======================================================
// EXECUTE PROFILE (runtime.js)
// ======================================================

async function executeProfile({ profile = {}, context = {} } = {}) {
  const pipeline = profile.pipeline || [];

  for (const step of pipeline) {
    const programName = typeof step === "string" ? step : step?.name;

    try {
      await window.programRegistry.execute({
        name: programName,
        context
      });
    } catch (e) {
      // 🚨 Captura centralizada de cualquier fallo en la tubería
      window.errorHandler?.handle({
        error: e,
        context: `Ejecución de Perfil '${context.profile}'`,
        step: programName,
        fatal: true
      });

      // Detiene la ejecución del resto de la tubería
      throw e; 
    }
  }
}
    
    //==================================================
    // REGISTER REGISTRY
    //==================================================
    
    async function registerRegistry({
    
        startup = {},
        context = {}
    
    } = {}){
    
        //--------------------------------------------------
        // PROGRAMS
        //--------------------------------------------------
    
        await registerItems({
    
            registry:
    
                startup.registry?.programs || [],
    
            type: "Programa",
    
            register: (name, instance) =>
    
                window.programRegistry
                    ?.registerProgram(
                        name,
                        instance
                    )
    
        });
    
        //--------------------------------------------------
        // FIELD RENDERERS
        //--------------------------------------------------
    
        await registerItems({
    
            registry:
    
                startup.registry?.fieldRenderers || [],
    
            type: "FieldRenderer",
    
            register: (name, instance) =>
    
                window.fieldRenderer
                    ?.registerRenderer(
                        name,
                        instance
                    )
    
        });
    
        //--------------------------------------------------
        // LAYOUT RENDERERS
        //--------------------------------------------------
    
        await registerItems({
    
            registry:
    
                startup.registry?.layoutRenderers || [],
    
            type: "LayoutRenderer",
    
            register: (name, instance) =>
    
                window.layoutRenderer
                    ?.registerLayout(
                        name,
                        instance
                    )
    
        });
    
    }
    
    //==================================================
    // REGISTER ITEMS
    //==================================================
    
    async function registerItems({
    
        registry = [],
    
        register = null,
    
        type = "Item"
    
    } = {}){
    
        for(const item of registry){
    
            try{
    
                await loadScript(
                    item.file
                );
    
                const instance =
                    window[item.name];

                    // console.log(
                    //     "REGISTER LAYOUT",
                    //     item.name,
                    //     instance,
                    //     Object.keys(window).filter(
                    //         k => k.toLowerCase().includes(
                    //             item.name.toLowerCase()
                    //         )
                    //     )
                    // );            
    
                if(!instance){
    
                    warn(
                        `${type} inexistente: ${item.name}`
                    );
    
                    continue;
    
                }
    
                register?.(
                    item.name,
                    instance
                );
    
                // debug(
                //     `${type} registrado:`,
                //     item.name
                // );
    
            }
            catch(e){
    
                error(
                    `registerItems(${type}):`,
                    e
                );
    
            }
    
        }
    
    }
    
    //==================================================
    // LOAD SCRIPT
    //==================================================
    
    async function loadScript(file){
    
        try{
    
            // debug(
            //     "Cargado script: ",
            //     file
            // );

            if(!file){
                return;
            }
    
            if(
    
                document.querySelector(
    
                    `script[src="${file}"]`
    
                )
    
            ){
    
                return;
    
            }
    
            await new Promise(
    
                (resolve,reject)=>{
    
                    const script =
    
                        document.createElement(
                            "script"
                        );
    
                    script.src = file;
    
                    script.onload =
                        resolve;
    
                    script.onerror =
                        reject;
    
                    document.head.appendChild(
                        script
                    );
    
                }
    
            );
    
            // debug(
            //     "Script cargado:",
            //     file
            // );
    
        }
        catch(e){
    
            error(
                "loadScript:",
                e
            );
    
            throw e;
    
        }
    
    }
    
    //==================================================
    // LOAD JSON
    //==================================================
    
    // async function loadJSON({
    
    //     file = null,
    //     path = ""
    
    // } = {}){
    
    //     try{
    
    //         if(!file){
    
    //             throw new Error(
    //                 "No se especificó el archivo."
    //             );
    
    //         }
    
    //         //--------------------------------------------------
    //         // RESOLVE PATH
    //         //--------------------------------------------------
    
    //         const fullPath =
    
    //             window.pathResolver
    //                 ?.resolve(
    
    //                     path,
    
    //                     file
    
    //                 )
    
    //             ||
    
    //             file;
    
    //         // debug(
    //         //     "Cargando JSON:",
    //         //     fullPath
    //         // );
    
    //         //--------------------------------------------------
    //         // DATALOADER
    //         //--------------------------------------------------
    
    //         if(
    //             window.dataLoader?.load
    //         ){
    
    //             const json =
    //                 await window.dataLoader.load(
    //                     fullPath
    //                 );
    
    //             if(json){
    
    //                 return json;
    
    //             }
    
    //         }
    
    //         //--------------------------------------------------
    //         // FETCH
    //         //--------------------------------------------------
    
    //         const response =
    //             await fetch(
    
    //                 fullPath,
    
    //                 {
    
    //                     cache: "no-store"
    
    //                 }
    
    //             );
    
    //         if(
    //             !response.ok
    //         ){
    
    //             throw new Error(
    
    //                 `HTTP ${response.status}`
    
    //             );
    
    //         }
    
    //         return await response.json();
    
    //     }
    //     catch(e){
    
    //         error(
    //             "loadJSON:",
    //             e
    //         );
    
    //         throw e;
    
    //     }
    
    // }
    
    //==================================================
    // END
    //==================================================
    
    log(
        "runtime inicializado."
    );
    
    })();