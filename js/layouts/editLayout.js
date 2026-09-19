// ======================================================
// 📁 js/layouts/editLayout.js
// ======================================================
// ✅ UNIVERSAL DECLARATIVE RUNTIME
// ✅ Layout puro de edición
// ✅ Usa dataResolver
// ✅ Usa schemaResolver
// ✅ Usa fieldRenderer
// ✅ Sin layout_resuelto
// ✅ Sin lógica de negocio
// ======================================================

(function(){

    const FILE = "editLayout.js";

    const log   = (...a) => window.logger?.info?.(FILE,...a);
    const debug = (...a) => window.logger?.debug?.(FILE,...a);
    const warn  = (...a) => window.logger?.warn?.(FILE,...a);
    const error = (...a) => window.logger?.error?.(FILE,...a);

    // ==================================================
    // EXPORT
    // ==================================================

    const api = {

        render

    };

    // ==================================================
    // RENDER
    // ==================================================

    async function render({

        container,
    
        section = {},
    
        context = {},
    
        dataset,
    
        schema
    
    }){

        try{

            if(!container){
                return;
            }

            context.__editContainer = container;
            context.currentDataset = dataset;
            context.__editSchema = schema;

            container.innerHTML = "";

            //--------------------------------------------------
            // DATASET
            //--------------------------------------------------

            // const dataset =

            //     await window.dataResolver.getDataset({

            //         context,

            //         id: section.dataSource

            //     });

            if(!dataset){

                // warn(
                //     "Dataset no encontrado:",
                //     section.dataSource
                // );

                renderEmpty(
                    container,
                    "Dataset no encontrado."
                );

                return;

            }

            // //--------------------------------------------------
            // // SCHEMA
            // //--------------------------------------------------

            // const schema =

            //     await window.schemaResolver.getSchema({

            //         context,

            //         id: section.schema

            //     });

            // if(!schema){

            //     warn(
            //         "Schema no encontrado:",
            //         section.schema
            //     );

            //     renderEmpty(
            //         container,
            //         "Schema no encontrado."
            //     );

            //     return;

            // }

            //--------------------------------------------------
            // DATASET EDITABLE
            //--------------------------------------------------

            if(dataset.editable === false){

                renderEmpty(

                    container,

                    "Este dataset no puede editarse."

                );

                return;

            }

            //--------------------------------------------------
            // ACTIONS
            //--------------------------------------------------

            renderActions({

                container,

                dataset,

                schema,

                // section,

                context

            });

            //--------------------------------------------------
            // WRAPPER
            //--------------------------------------------------

            const wrapper =

                document.createElement("div");

            wrapper.className =

                "edit-layout";

            container.appendChild(
                wrapper
            );

            //--------------------------------------------------
            // RENDER DATASET
            //--------------------------------------------------

            await renderDataset({

                container : wrapper,

                dataset,

                schema,

                // section,

                context

            });

        }
        catch(e){

            error(
                "render:",
                e
            );

        }

    }

    // ==================================================
    // ACTIONS
    // ==================================================

    function renderActions({

        container,

        dataset,

        schema,

        // section,

        context

    }){

        const actions =

            document.createElement("div");

        actions.className =

            "detail-actions";

        //--------------------------------------------------
        // NUEVO
        //--------------------------------------------------

        const addButton =

            document.createElement("button");

        addButton.className =

            "detail-button detail-button-add";

        addButton.innerText =

            "➕ Nuevo";


            addButton.onclick = () =>

                createItem({
            
                    dataset,
            
                    schema,
            
                    // section,
            
                    context
            
                });

        actions.appendChild(
            addButton
        );

        //--------------------------------------------------
        // GUARDAR
        //--------------------------------------------------

        const saveButton =

            document.createElement("button");

        saveButton.className =

            "detail-button detail-button-save";

        saveButton.innerText =

            "💾 Guardar";

            saveButton.onclick = () => {

                console.log(
                    "context.currentDataset",
                    context.currentDataset
                );
            
                console.log(
                    "context",
                    context
                );
            
                window.updateProgram.executeDirect({
            
                    root:
                        context.originalRoot,
            
                    data_original:
                        context.originalRoot?.data,
            
                    source:
                        context.source,
            
                    data_modif:
                        context.currentDataset
            
                });
            
            };

        actions.appendChild(
            saveButton
        );

        container.appendChild(
            actions
        );

    }

    // ==================================================
    // DATASET
    // ==================================================

    async function renderDataset({

        container,

        dataset,

        schema,

        // section,

        context

    }){

        if(Array.isArray(dataset)){

            for(let i = 0; i < dataset.length; i++){

                await renderItem({

                    container,

                    record : dataset[i],

                    schema,

                    // section,

                    context,

                    index : i

                });

            }

            return;

        }

        await renderItem({

            container,

            record : dataset,

            schema,

            // section,

            context,

            index : 0

        });

    }

// ==================================================
// ITEM
// ==================================================

async function renderItem({

    container,

    record,

    schema,

    // section,

    context,

    index

}){

    const card =
        document.createElement("div");

    card.className =
        "detail-card";

    if(index > 0){

        card.style.borderTop =
            "8px solid red";

    }

    container.appendChild(
        card
    );

    //------------------------------------------
    // DELETE
    //------------------------------------------

    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "detail-button detail-button-delete";

    deleteButton.innerText =
        "🗑 Eliminar";

    deleteButton.onclick = () =>

        deleteItem({

            dataset :

                context.currentDataset,

            index,

            // section,

            context

        });

    card.appendChild(
        deleteButton
    );

    //------------------------------------------
    // TITLE
    //------------------------------------------

    // if(section.showTitle !== false){

        const title =
            document.createElement("div");

        title.className =
            "detail-title";

        title.innerText =

            record?.titulo ||

            record?.title ||

            record?.nombre ||

            `Registro ${index + 1}`;

        card.appendChild(
            title
        );

    //}

    //------------------------------------------
    // CAMPOS
    //------------------------------------------

    // debug(
    //     "RENDER ITEM SCHEMA:",
    //     schema
    // );
    
    // debug(
    //     "RENDER ITEM SCHEMA LENGTH:",
    //     Array.isArray(schema)
    //         ? schema.length
    //         : "NO ARRAY"
    // );    


    const fields =

    Array.isArray(schema)

        ? schema

        : [];

// debug("FIELDS:d", fields);

    for(const field of fields){

        await renderField({

            container : card,

            record,

            field,

            schema,

            // section,

            context

        });

    }

}

// ==================================================
// FIELD
// ==================================================

async function renderField({

    container,

    record,

    field,

    schema,

    // section,

    context

}){

    const row =
        document.createElement("div");

    row.className =
        "detail-row";

    //------------------------------------------
    // LABEL
    //------------------------------------------

    if(field.showLabel !== false){

        const label =
            document.createElement("div");

        label.className =
            "detail-label";

        label.innerText =

            field.label ||

            field.campo;

        row.appendChild(
            label
        );

    }

    //------------------------------------------
    // VALUE
    //------------------------------------------

    const valueContainer =
        document.createElement("span");

    valueContainer.className =
        "detail-value";

        const valueWrapper =
        document.createElement("div");
    
    valueWrapper.style.display =
        "flex";
    
    valueWrapper.style.alignItems =
        "center";
    
    valueWrapper.style.gap =
        "8px";
    
    valueWrapper.appendChild(
        valueContainer
    );
    
    const ui = field.selector?.ui;

    if (ui === "combobox") {

        const select =
            document.createElement(
                "select"
            );

            await renderRelationCombo({

                select,
            
                field,
            
                record,
            
                valueContainer,
            
                context,
            
                schema
            
            });

        valueWrapper.appendChild(
            select
        );

    };

    if(ui === "selector"){
    
            const button =
                document.createElement("button");
        
            button.className =
                "detail-button";
        
            button.innerText =
                "🔍";
        
            button.onclick =
                async () => {

                    await openSelector({

                        record,

                        field,

                        context

                    });

                };

            valueWrapper.appendChild(
                button
            );
    
        }
    
        row.appendChild(
            valueWrapper
    );
    
    //------------------------------------------
    // RENDERER
    //------------------------------------------

    await renderFieldValue({

        container : valueContainer,

        record,

        field,

        schema,

        // section,

        context

    });

    container.appendChild(
        row
    );

}

// ==================================================
// FIELD VALUE
// ==================================================

// async function renderFieldValue({

//     container,
//     record,
//     field,
//     schema,
//     context

// }){

//     const value =
//         record?.[
//             field.campo
//         ];

//     const resolvedValue =
//         record?.__resolved?.[
//             field.campo
//         ];        

//         if(field.selector){

//             const button =
//                 document.createElement("button");
        
//             button.innerText = "🔍";
        
//             button.onclick = async () => {
        
//                 await window.selectorLayout?.open({
        
//                     record,
        
//                     field,
        
//                     context
        
//                 });
        
//             };
        
//             container.appendChild(
//                 button
//             );
        
//         }        

//     switch(field.tipo){

//         case "object":

//             await renderObject({

//                 container,
//                 value,
//                 field,
//                 schema,
//                 context

//             });

//             return;

//         case "array":

//             await renderArray({

//                 container,
//                 value,
//                 field,
//                 schema,
//                 context

//             });

//             return;

//         default:
            
//         if(
//             field.campo === "tipos_media" &&
//             field.selector
//         ){
        
//             const button =
//                 document.createElement("button");
        
//             button.innerText = "🔍";
        
//             button.onclick = () => {
        
//                 console.log(
//                     "SELECTOR CLICK",
//                     field
//                 );
        
//             };
        
//             container.appendChild(
//                 button
//             );
        
//         }

//         await window.fieldRenderer.render({

//             container,
        
//             value,
        
//             resolvedValue,
        
//             field,
        
//             mode: "edit",

//                 context: {

//                     ...context,

//                     record,

//                     currentRecord: record,

//                     currentField: field

//                 }

//             });

//     }

// }

async function renderFieldValue({

    container,
    record,
    field,
    schema,
    context

}){

    if(field.selector){

        // console.log(
        //     "SELECTOR DETECTADO",
        //     field.campo
        // );
    
    }    

    const value =
        record?.[
            field.campo
        ];

    const resolvedValue =
        record?.__resolved?.[
            field.campo
        ];



    //--------------------------------------------------
    // TYPE
    //--------------------------------------------------

    switch(field.tipo){

        case "object":

            await renderObject({

                container,
                value,
                field,
                schema,
                context

            });

            return;

        case "array":

            await renderArray({

                container,
                value,
                field,
                schema,
                context

            });

            return;

        default:

            await window.fieldRenderer.render({

                container,

                value,

                resolvedValue,

                field,

                mode: "edit",

                context: {

                    ...context,

                    record,

                    currentRecord: record,

                    currentField: field

                }

            });

    }

}

// ==================================================
// OBJECT
// ==================================================

async function renderObject({

    container,

    value = {},

    field,

    schema,

    // section,

    context

}){

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "detail-object";

    container.appendChild(
        wrapper
    );

    //--------------------------------------------------
    // CAMPOS HIJOS
    //--------------------------------------------------

    const fields =

        Array.isArray(field.fields)

            ? field.fields

            : [];

    for(const childField of fields){

        if(field.campo === "tipos_media"){

            // console.log(
            //     "RENDERING TIPOS_MEDIA",
            //     field
            // );
        
        }

        await renderField({

            container : wrapper,

            record    : value,

            field     : childField,

            schema,

            // section,

            context

        });

    }

}

// ==================================================
// ARRAY
// ==================================================

// async function renderArray({

//     container,

//     value = [],

//     field,

//     schema,

//     context

// }){

//     const wrapper =
//         document.createElement("div");

//     wrapper.className =
//         "detail-array";

//     container.appendChild(
//         wrapper
//     );

// //--------------------------------------------------
// // ADD ITEM
// //--------------------------------------------------

// const addButton =
//     document.createElement("button");

// addButton.className =
//     "detail-button detail-button-add";

// addButton.innerText =
//     "➕ Agregar";

// addButton.onclick = () => {

//     value.push(
//         createEmptyRecord(
//             field.fields || []
//         )
//     );

//     render({

//         container:
//             context.__editContainer,

//         context,

//         dataset:
//             context.currentDataset,

//         schema:
//             context.__editSchema

//     });

// };

// wrapper.appendChild(
//     addButton
// );

//     if(!Array.isArray(value)){

//         renderEmpty(
//             wrapper,
//             "Sin elementos"
//         );

//         return;

//     }

//     //--------------------------------------------------
//     // ITEMS
//     //--------------------------------------------------

//     for(let i = 0; i < value.length; i++){

//         const item =
//             value[i];

//         const card =
//             document.createElement("div");

//         card.className =
//             "detail-array-item";

//         wrapper.appendChild(
//             card
//         );

//         const removeButton =
//         document.createElement("button");
    
//     removeButton.className =
//         "detail-button detail-button-delete";
    
//     removeButton.innerText =
//         "🗑 Eliminar";
    
//     removeButton.onclick = () => {
    
//         value.splice(
//             i,
//             1
//         );
    
//         render({
    
//             container:
//                 context.__editContainer,
    
//             context,
    
//             dataset:
//                 context.currentDataset,
    
//             schema:
//                 context.__editSchema
    
//         });
    
//     };
    
//     card.appendChild(
//         removeButton
//     );

//         //--------------------------------------------------
//         // PREVIEW MEDIA
//         //--------------------------------------------------

//         if(
//             item?.tipos_media === "image" &&
//             item?.source?.file &&
//             item?.source?.path
//         ){

//             const img =
//                 document.createElement("img");

//             img.src =
//                 `${item.source.path}/${item.source.file}`;

//             img.style.maxWidth =
//                 "200px";

//             img.style.maxHeight =
//                 "150px";

//             img.style.display =
//                 "block";

//             img.style.marginBottom =
//                 "12px";

//             img.style.border =
//                 "1px solid #ccc";

//             card.appendChild(
//                 img
//             );
//         }

//         //--------------------------------------------------
//         // CAMPOS
//         //--------------------------------------------------

//         const fields =

//             Array.isArray(field.fields)

//                 ? field.fields

//                 : [];

//         for(const childField of fields){

//             await renderField({

//                 container : card,

//                 record    : item,

//                 field     : childField,

//                 schema,

//                 context

//             });

//         }

//     }

// }
// ==================================================
// ARRAY (Hereda la visualización de detailLayout)
// ==================================================

// ==================================================
// RENDER ARRAY (Edit Mode)
// ==================================================

async function renderArray({
    container,
    value = [],
    field,
    schema,
    context
}) {
    const wrapper = document.createElement("div");

    // Detectar si la UI es una cuadrícula de medios o una lista
    const isMediaGrid = field.ui === "media-grid" || field.fields?.some(f => f.campo === "tipos_media");
    const isAudioList = field.ui === "audio-list" || field.fields?.some(f => f.campo === "audio");

    if (isMediaGrid) {
        wrapper.className = "detail-media-grid";
    } else if (isAudioList) {
        wrapper.className = "detail-audio-list";
    } else {
        wrapper.className = "detail-array";
    }

    container.appendChild(wrapper);

    // --------------------------------------------------
    // BOTÓN AGREGAR
    // --------------------------------------------------
    const addButton = document.createElement("button");
    addButton.className = "detail-button detail-button-add";
    addButton.type = "button";
    addButton.innerText = "➕ Agregar";
    addButton.style.gridColumn = "1 / -1"; // Ocupa todo el ancho superior del grid

    addButton.onclick = () => {
        if (!Array.isArray(value)) value = [];
        value.push(createEmptyRecord(field.fields || []));
        render({
            container: context.__editContainer,
            context,
            dataset: context.currentDataset,
            schema: context.__editSchema
        });
    };

    wrapper.appendChild(addButton);

    if (!Array.isArray(value) || value.length === 0) {
        renderEmpty(wrapper, "Sin elementos");
        return;
    }

    // --------------------------------------------------
    // RENDERIZADO DE ELEMENTOS
    // --------------------------------------------------
    for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const card = document.createElement("div");

        if (isMediaGrid) {
            card.className = "detail-media-item";
        } else if (isAudioList) {
            card.className = "detail-audio-item";
        } else {
            card.className = "detail-array-item";
        }

        // Cabecera con Flexbox (reemplaza a float)
        const header = document.createElement("div");
        header.className = "array-item-header";

        const removeButton = document.createElement("button");
        removeButton.className = "detail-button detail-button-delete";
        removeButton.type = "button";
        removeButton.innerText = "🗑 Eliminar";

        removeButton.onclick = () => {
            value.splice(i, 1);
            render({
                container: context.__editContainer,
                context,
                dataset: context.currentDataset,
                schema: context.__editSchema
            });
        };

        header.appendChild(removeButton);
        card.appendChild(header);

        // Previsualización dinámica de medios si existen rutas
        if (item?.source?.file && item?.source?.path) {
            const mediaPath = `${item.source.path}/${item.source.file}`;
            const tipo = item.tipos_media || item.tipo;

            if (tipo === "image") {
                const img = document.createElement("img");
                img.src = mediaPath;
                card.appendChild(img);
            } else if (tipo === "video") {
                const video = document.createElement("video");
                video.src = mediaPath;
                video.controls = true;
                card.appendChild(video);
            } else if (tipo === "audio") {
                const audio = document.createElement("audio");
                audio.src = mediaPath;
                audio.controls = true;
                card.appendChild(audio);
            }
        }

        // Formulario de campos internos
        const fields = Array.isArray(field.fields) ? field.fields : [];
        for (const childField of fields) {
            await renderField({
                container: card,
                record: item,
                field: childField,
                schema,
                context
            });
        }

        wrapper.appendChild(card);
    }
}
// ==================================================
// EMPTY
// ==================================================

function renderEmpty(

    container,

    message = "Sin datos"

){

    const div =
        document.createElement("div");

    div.className =
        "detail-empty";

    div.innerText =
        message;

    container.appendChild(
        div
    );

}

// ==================================================
// CREATE
// ==================================================

function createItem({

    dataset,

    schema,

    section,

    context

}){

    try{

        if(!Array.isArray(dataset)){

            error(
                "createItem: dataset inválido."
            );

            return;

        }

        if(!Array.isArray(schema)){

            error(
                "createItem: schema inválido."
            );

            return;

        }

        //--------------------------------------------------
        // NUEVO REGISTRO
        //--------------------------------------------------

        const record =
            createEmptyRecord(
                schema
            );

        //--------------------------------------------------
        // INSERTAR AL FINAL
        //--------------------------------------------------

        dataset.push(
            record
        );

        //--------------------------------------------------
        // VOLVER A RENDERIZAR
        //--------------------------------------------------

        render({

            container:
                context.__editContainer,

            section,

            context,

            dataset,

            schema

        });

    }
    catch(e){

        error(
            "createItem:",
            e
        );

    }

}

function createEmptyRecord(
    schema = []
){

    const record = {};

    for(const field of schema){

        if(!field?.campo){
            continue;
        }

        const campo =
            field.campo;

        const tipo =
            String(
                field.tipo ||
                "text"
            )
            .toLowerCase()
            .trim();

        //--------------------------------------------------
        // OBJECT
        //--------------------------------------------------

        if(tipo === "object"){

            record[campo] =
                createEmptyRecord(
                    field.fields || []
                );

            continue;

        }

        //--------------------------------------------------
        // ARRAY
        //--------------------------------------------------

        if(tipo === "array"){

            record[campo] = [];

            continue;

        }

        //--------------------------------------------------
        // VALOR
        //--------------------------------------------------

        record[campo] = "";

    }

    return record;

}



// ==================================================
// FOOTER
// ==================================================

function renderFooter({

    container,

    dataset,

    schema,

    // section,

    context

}){

    const footer =
        document.createElement("div");

    footer.className =
        "detail-actions";

    //--------------------------------------------------
    // SAVE
    //--------------------------------------------------

    const saveButton =
        document.createElement("button");

    saveButton.className =
        "detail-button detail-button-save";

    saveButton.innerText =
        "💾 Guardar";

        saveButton.onclick = () => {

            console.log(
                "context.currentDataset",
                context.currentDataset
            );
        
            console.log(
                "context",
                context
            );
        
            window.updateProgram.executeDirect({
        
                root:
                    context.originalRoot,
        
                data_original:
                    context.originalRoot?.data,
        
                source:
                    context.source,
        
                data_modif:
                    context.currentDataset
        
            });
        
        };

    footer.appendChild(
        saveButton
    );

    container.appendChild(
        footer
    );

}

// ==================================================
// SAVE
// ==================================================

// function saveDocument({

//     context,

//     fileName = "document.json"

// }){

//     try{

//         if(!context){

//             warn(
//                 "No existe el context."
//             );

//             return;

//         }

//         if(!context.root){

//             warn(
//                 "No existe el documento."
//             );

//             return;

//         }

//         //--------------------------------------------------
//         // SERIALIZAR
//         //--------------------------------------------------

//         //--------------------------------------------------
//         // ACTUALIZAR DATA ORIGINAL CON LOS CAMBIOS
//         //--------------------------------------------------

//         if(
//             context.originalRoot &&
//             context.datasets?.data?.value
//         ){

//             context.originalRoot.data =
//                 context.datasets.data.value;

//         }        

//         const json =

//             JSON.stringify(
//                 context.originalRoot,
//                 null,
//                 4
//             );

//         //--------------------------------------------------
//         // DOWNLOAD
//         //--------------------------------------------------

//         downloadJson({

//             json,

//             fileName

//         });

//     }
//     catch(e){

//         error(
//             "saveDocument:",
//             e
//         );

//     }

// }

// ==================================================
// SAVE DOCUMENT
// ==================================================

// 

// async function saveDocument({

//     context = null

// } = {}){

//     try{

//         if(!context){

//             logger.warn(
//                 "editLayout",
//                 "Contexto no disponible."
//             );

//             return;

//         }


//         const document =
//             context.originalRoot;

//         const dataModif =
//             context.currentDataset;

//         const path =
//             context.path || "data";


//         if(!document){

//             logger.error(
//                 "editLayout",
//                 "Documento original no disponible."
//             );

//             return;

//         }


//         if(
//             dataModif === undefined ||
//             dataModif === null
//         ){

//             logger.error(
//                 "editLayout",
//                 "Data modificada no disponible."
//             );

//             return;

//         }


//         return await window.updateProgram.execute({

//             source:
//                 context.source,
        
//             data_modif:
//                 dataModif
        
//         });

//     }
//     catch(error){

//         logger.error(
//             "editLayout",
//             "Error al guardar documento:",
//             error
//         );

//         throw error;

//     }

// }

// ==================================================
// DOWNLOAD
// ==================================================

// function downloadJson({

//     json,

//     fileName = "document.json"

// }){

//     try{

//         if(
//             json === undefined ||
//             json === null
//         ){

//             warn(
//                 "No hay contenido para descargar."
//             );

//             return;

//         }

//         //--------------------------------------------------
//         // BLOB
//         //--------------------------------------------------

//         const blob =

//             new Blob(

//                 [json],

//                 {

//                     type:
//                         "application/json"

//                 }

//             );

//         //--------------------------------------------------
//         // URL
//         //--------------------------------------------------

//         const url =

//             URL.createObjectURL(
//                 blob
//             );

//         //--------------------------------------------------
//         // LINK
//         //--------------------------------------------------

//         const link =

//             document.createElement(
//                 "a"
//             );

//         link.href =
//             url;

//         link.download =
//             fileName;

//         document.body.appendChild(
//             link
//         );

//         link.click();

//         document.body.removeChild(
//             link
//         );

//         //--------------------------------------------------
//         // CLEANUP
//         //--------------------------------------------------

//         URL.revokeObjectURL(
//             url
//         );

//         log(
//             "Documento descargado:",
//             fileName
//         );
        
//         showTerminalCommand(
//             fileName
//         );

//     }
//     catch(e){

//         error(
//             "downloadJson:",
//             e
//         );

//     }

// }

// ==================================================
// DELETE
// ==================================================

function deleteItem({

    dataset,

    index,

    // section,

    context

}){

    try{

        if(!Array.isArray(dataset)){
            return;
        }

        if(
            index < 0 ||
            index >= dataset.length
        ){
            return;
        }

        //--------------------------------------------------
        // ELIMINAR REGISTRO
        //--------------------------------------------------

        dataset.splice(
            index,
            1
        );

        //--------------------------------------------------
        // VOLVER A RENDERIZAR
        //--------------------------------------------------

        render({

            container:
                context.__editContainer,

            //section,

            context,

            dataset,

            schema:
                context.__editSchema

        });

    }
    catch(e){

        error(
            "deleteItem:",
            e
        );

    }

}

function renderMediaPreview(
    item,
    container
){

    if(!item){
        return;
    }

    const type =
        item.tipos_media;

    const file =
        item?.source?.file;

    const path =
        item?.source?.path;

    if(!file || !path){
        return;
    }

    const url =
        `${path}/${file}`;

    switch(type){

        case "image":

            const img =
                document.createElement("img");

            img.src = url;

            img.style.maxWidth =
                "200px";

            container.appendChild(img);

            break;
    }

}

function showTerminalCommand(
    fileName
){

    const existing =
        document.getElementById(
            "terminal-command"
        );

    if(existing){
        existing.remove();
    }

    const div =
        document.createElement("div");

    div.id =
        "terminal-command";

    div.style.marginTop =
        "20px";

    div.style.padding =
        "12px";

    div.style.background =
        "#111";

    div.style.color =
        "#0f0";

    div.style.fontFamily =
        "monospace";

    div.innerHTML =

`<div>
Archivo descargado.
</div>

<pre>
./mover.sh ~/downloads/${fileName}
</pre>`;

    document.body.appendChild(
        div
    );
}

async function openSelector({

    record,

    field,

    context

}){

    // alert("aqui");

    // console.log("PASO 1");

    // debug("context", context);
    // console.log("PASO 2");

    // debug("context.originalRoot", context?.originalRoot);
    // debug("context.source", context?.source);
    // debug("jsonDownloader", window.jsonDownloader);
    
    try {
    
        // debug("GENERANDO UPDATE.JSON");

        const fileName = "update.json";
    
        const result = window.jsonDownloader.download({
            json: {
                ...context.originalRoot,
                source: context.source
            },
            fileName: fileName
        });

        showTerminalCommand(
            fileName
        );        
    
        // debug("DOWNLOAD RESULT", result);
    
    } catch(ex) {
    
        error("ERROR DOWNLOAD", ex);
        alert(ex.message);
    
    }

    //--------------------------------------------------
    // DATOS DEL CAMPO
    //--------------------------------------------------

    const selectedId =
        record?.id;

    const selectedField =
        field?.campo;

        const currentValue =
        record?.[
            field.campo
        ];
    
    const selectedValue =
        JSON.stringify(
            Array.isArray(currentValue)
                ? currentValue
                : (
                    currentValue
                        ? [currentValue]
                        : []
                )
        );

    //--------------------------------------------------
    // NAVEGAR A SELECTOR
    //--------------------------------------------------

    alert("Proceso Termino");

    await window
        .navigateRenderer
        ?.navigate({

            html:
                "index.html",

            source:
                field.relation?.source,

            parameters: {

                profile:
                    "selector",

                selectedId,

                selectedField,

                selectedValue

            }

        });

}

async function renderRelationCombo({

    select,

    field,

    record,

    valueContainer,

    context,

    schema

}){


    debug(
        "COMBO FIELD",
        field
    );
    
    debug(
        "COMBO RELATION",
        field?.relation
    );

    const relation =
        field.relation;

    const json =
        await window
            .jsonLoader
            .load({

                file:
                    field.relation?.source.file,

                path:
                    field.relation?.source.path

            });

        const dataset =
            json.definition.datasets.find(
                d => d.id === "data"
            );
        
        const items =
            json[dataset.path] || [];


        debug(
            "COMBO JSON KEYS",
            Object.keys(json || {})
        );
        
        debug(
            "COMBO JSON",
            json
        );        

    for(const item of items){

        const option =
            document.createElement(
                "option"
            );

        const valueField =
            Object.keys(
                relation.where
            )[0];
        
        option.value =
            item[valueField];
        
        option.innerText =
            item[
                relation.displayField
            ];

        if(

            String(
                record[
                    field.campo
                ]
            ) ===

            String(
                option.value
            )

        ){

            option.selected =
                true;

        }

        select.appendChild(
            option
        );

    }

    select.onchange =
    async () => {

        record[
            field.campo
        ] =
            select.value;

        valueContainer.innerHTML =
            "";

        await renderFieldValue({

            container:
                valueContainer,

            record,

            field,

            schema,

            context

        });

    };

}
    window.edit = api;

    log("✅ editLayout registrado correctamente");

})();
