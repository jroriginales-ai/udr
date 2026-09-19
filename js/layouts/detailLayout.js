// ======================================================
// 📁 js/layouts/detailLayout.js
// ======================================================
// ✅ UNIVERSAL DECLARATIVE RUNTIME
// ✅ Layout puro
// ✅ Usa dataResolver
// ✅ Usa schemaResolver
// ✅ Usa pathResolver
// ✅ Usa fieldRenderer
// ✅ Sin inferencias
// ✅ Sin lógica de negocio
// ✅ Sin navegación
// ======================================================

(function(){

  const FILE = "detailLayout.js";

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

    context = {}

}) {

    try{

        if(!container){
            return;
        }

        context.__detailContainer =
            container;        


        container.innerHTML = "";

        //------------------------------------------------
        // ITEMS RESUELTOS POR layoutResolver
        //------------------------------------------------

        const items =

        Array.isArray(section.items)
    
            ? section.items
    
            : [];


        //------------------------------------------------
        // WRAPPER
        //------------------------------------------------

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "detail-layout";

        container.appendChild(
            wrapper
        );

        //------------------------------------------------
        // ITEMS
        //------------------------------------------------

        for(
            let i = 0;
            i < items.length;
            i++
        ){

            await renderItem({

                container:
                    wrapper,

                item:
                    items[i],

                section,

                context,

                index:
                    i

            });

        }

        debug(
            section.items === context.root.data
        );        

    }
    catch(e){

        error(
            "render:",
            e
        );

    }

}

  // ==================================================
  // ITEM
  // ==================================================

//   async function renderItem({

//     container,

//     item,

//     section,

//     context,

//     index

// }){

//     const card =
//     document.createElement(
//         "div"
//     );

// card.className =
//     "detail-card";

// container.appendChild(
//     card
// );


//     //------------------------------------------
//     // TITLE
//     //------------------------------------------

//     if(
//         section.showTitle !==
//         false
//     ){

//         const title =
//             document.createElement(
//                 "div"
//             );

//         title.className =
//             "detail-title";

//             title.style.display = "block";
//             title.style.background = "#2d2613";
//             title.style.color = "#f59e0b";
//             title.style.fontSize = "18px";
//             title.style.fontWeight = "bold";
//             title.style.padding = "6px 10px";
//             title.style.borderRadius = "4px";    

//         title.innerText =

//             item?.value?.titulo ||

//             item?.value?.title ||

//             item?.value?.nombre ||

//             `Detalle ${index + 1}`;

//         card.appendChild(
//             title
//         );

//     }

//     //------------------------------------------
//     // FIELDS
//     //------------------------------------------

//     const fieldsToRender =
//         buildVisibleFields(
//             flattenFields(
//                 item.fields || []
//             )
//         );

//         let first = true;

//         for(const field of fieldsToRender){
        
//             await renderField({
        
//                 container:
//                     card,
        
//                 item,
        
//                 field,
        
//                 context,
        
//                 section,
        
//                 first
        
//             });
        
//             first = false;
        
//         }
       
// }

// ==================================================
  // ITEM
  // ==================================================

  async function renderItem({
    container,
    item,
    section,
    context,
    index
  }) {
    const card = document.createElement("div");
    card.className = "detail-card";
    container.appendChild(card);

    // ------------------------------------------
    // TITLE
    // ------------------------------------------
    if (section.showTitle !== false) {
      const title = document.createElement("div");
      title.className = "detail-title";
      title.style.display = "block";
      title.style.background = "#2d2613";
      title.style.color = "#f59e0b";
      title.style.fontSize = "18px";
      title.style.fontWeight = "bold";
      title.style.padding = "6px 10px";
      title.style.borderRadius = "4px";

      title.innerText =
        item?.value?.titulo ||
        item?.value?.title ||
        item?.value?.nombre ||
        `Detalle ${index + 1}`;

      card.appendChild(title);
    }

    // ------------------------------------------
    // FIELDS SEGREGATION
    // ------------------------------------------
    const fieldsToRender = buildVisibleFields(
      flattenFields(item.fields || [])
    );

    const mediaFields = [];
    const audioFields = [];
    const standardFields = [];

    // Clasificar campos por su tipo/control
    for (const field of fieldsToRender) {
      const type = (field.type || field.control || "").toLowerCase();

      if (["image", "img", "video", "document", "file", "doc"].includes(type)) {
        mediaFields.push(field);
      } else if (["audio", "sound"].includes(type)) {
        audioFields.push(field);
      } else {
        standardFields.push(field);
      }
    }

    // 1. Campos estándar (Campos de texto/clave-valor normales)
    let first = true;
    for (const field of standardFields) {
      await renderField({
        container: card,
        item,
        field,
        context,
        section,
        first
      });
      first = false;
    }

    // 2. Galería Grid (Imágenes, Videos, Documentos en 4 Columnas)
    if (mediaFields.length > 0) {
      const gridContainer = document.createElement("div");
      gridContainer.className = "detail-media-grid";
      
      // CSS Grid: 4 columnas iguales. El exceso pasa automáticamente a la siguiente fila
      gridContainer.style.display = "grid";
      gridContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
      gridContainer.style.gap = "12px";
      gridContainer.style.marginTop = "15px";

      for (const field of mediaFields) {
        const gridCell = document.createElement("div");
        gridCell.className = "detail-media-item";
        
        await renderFieldCell({
          container: gridCell,
          item,
          field,
          context,
          section
        });

        gridContainer.appendChild(gridCell);
      }

      card.appendChild(gridContainer);
    }

    // 3. Audios en Lista Vertical
    if (audioFields.length > 0) {
      const audioList = document.createElement("ul");
      audioList.className = "detail-audio-list";
      audioList.style.listStyle = "none";
      audioList.style.padding = "0";
      audioList.style.marginTop = "15px";

      for (const field of audioFields) {
        const listItem = document.createElement("li");
        listItem.className = "detail-audio-item";
        listItem.style.marginBottom = "8px";

        await renderFieldCell({
          container: listItem,
          item,
          field,
          context,
          section
        });

        audioList.appendChild(listItem);
      }

      card.appendChild(audioList);
    }
  }

  // ==================================================
  // HELPER: RENDERIZAR CONTENIDO DE UN FIELD EN CELDA/LISTA
  // ==================================================
  async function renderFieldCell({ container, item, field, context, section }) {
    const valueContainer = document.createElement("div");
    valueContainer.className = "detail-value-cell";

    if (field.showLabel !== false && (field.label || field.campo)) {
      const label = document.createElement("div");
      label.className = "detail-label-cell";
      label.style.fontSize = "12px";
      label.style.fontWeight = "bold";
      label.style.marginBottom = "4px";
      label.innerText = field.label || field.campo;
      container.appendChild(label);
    }

    container.appendChild(valueContainer);

    if (window.fieldRenderer?.render) {
      await window.fieldRenderer.render({
        container: valueContainer,
        value: field.value,
        field,
        mode: section.mode || "display",
        context: {
          ...context,
          item,
          currentItem: item,
          currentField: field
        }
      });
    }
  }

  // ==================================================
  // FIELD
  // ==================================================

  async function renderField({

    container,

    item,

    field,

    context,

    section,

    first = false

}){

    //--------------------------------------------------
    // DEPTH
    //--------------------------------------------------

    const depth =
        Number(
            field.__depth ??
            field.__level ??
            0
        );

    //--------------------------------------------------
    // ROW
    //--------------------------------------------------

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "detail-row";

    //--------------------------------------------------
    // COLUMNAS
    //
    // depth 0:
    // Label | Value
    //
    // depth 1:
    //       Label | Value
    //
    // depth 2:
    //             Label | Value
    //--------------------------------------------------

    row.style.display =
        "grid";
    
    row.style.gridTemplateColumns =
        "repeat(4, 132px) 1fr";

    //--------------------------------------------------
    // EMPTY COLUMNS
    //--------------------------------------------------

    for(
        let i = 0;
        i < depth;
        i++
    ){

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "detail-indent";

        row.appendChild(
            empty
        );

    }

    //--------------------------------------------------
    // LABEL
    //--------------------------------------------------

    if(
        field.showLabel !==
        false
    ){

        const label =
            document.createElement(
                "div"
            );

        label.className =
            "detail-label";

        label.innerText =

            field.label ||

            field.campo ||

            "";

        row.appendChild(
            label
        );

    }
    else{

        //--------------------------------------------------
        // Si el label está oculto debemos conservar
        // la columna para no mover el value.
        //--------------------------------------------------

        const emptyLabel =
            document.createElement(
                "div"
            );

        emptyLabel.className =
            "detail-label";

        row.appendChild(
            emptyLabel
        );

    }

    //--------------------------------------------------
    // VALUE
    //--------------------------------------------------

    const valueContainer =
        document.createElement(
            "span"
        );

    valueContainer.className =
        "detail-value";

    row.appendChild(
        valueContainer
    );

    //--------------------------------------------------
    // FIELD RENDERER
    //--------------------------------------------------

    if(
        window.fieldRenderer
        ?.render
    ){

        await window.fieldRenderer.render({

            container:
                valueContainer,

            value:
                field.value,

            field,

            mode:
                section.mode ||
                "display",

            context:{

                ...context,

                item,

                currentItem:
                    item,

                currentField:
                    field

            }

        });

    }

    //--------------------------------------------------
    // APPEND
    //--------------------------------------------------

    container.appendChild(
        row
    );

}

  // ==================================================
  // EMPTY
  // ==================================================

  function renderEmpty(
      container,
      section
  ){

      const div =
          document.createElement(
              "div"
          );

      div.className =
          "detail-empty";

      div.innerText =

          section
          ?.emptyMessage ||

          "Sin datos";

      container.appendChild(
          div
      );

  }

  function renderEmptySchema(
      container
  ){

      const div =
          document.createElement(
              "div"
          );

      div.className =
          "detail-empty";

      div.innerText =
          "Schema no definido";

      container.appendChild(
          div
      );

  }

  function buildVisibleFields(
    fields = []
){

    return fields.filter(field => {

        return !field.hidden &&
               field.visible !== false;

    });

}

function expandFields(
    fields = [],
    parentLabel = null
){

    const result = [];

    for(const field of fields){

        const current = {
            ...field
        };

        if(
            parentLabel &&
            !current.label
        ){
            current.label =
                `${parentLabel} - ${current.campo}`;
        }

        result.push(current);

        if(
            Array.isArray(current.fields) &&
            current.fields.length
        ){

            result.push(
                ...expandFields(
                    current.fields,
                    current.label
                )
            );

        }

    }

    return result;

}

function expandResolved(resolved){

    const result = [];

    if(!resolved){
        return result;
    }

    for(const value of Object.values(resolved)){

        if(!value){
            continue;
        }

        if(Array.isArray(value.items)){

            for(const item of value.items){

                result.push(...(item.fields || []));

            }

        }
        else if(Array.isArray(value.fields)){

            result.push(...value.fields);

        }

    }

    return result;

}

function flattenFields(
    fields = [],
    level = 0
){

    const result = [];

    for(const field of fields){

        const current = {

            ...field,

            __level:
                level

        };

        result.push(
            current
        );

        if(
            Array.isArray(field.fields) &&
            field.fields.length
        ){

            result.push(

                ...flattenFields(

                    field.fields,

                    level + 1

                )

            );

        }

        if(
            Array.isArray(field.items) &&
            field.items.length
        ){

            for(
                const item
                of field.items
            ){

                result.push(

                    ...flattenFields(

                        item.fields || [],

                        level + 1

                    )

                );

            }

        }

    }

    return result;

}
    // ==================================================
    // REGISTRO GLOBAL
    // ==================================================
    window.detail = api;                    // ← Importante

    log("✅ detailLayout registrado correctamente");

})();   // ← Cierre del IIFE