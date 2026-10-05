(function(){

    const FILE = "listLayout.js";
    
    const log   = (...a) => window.logger?.info?.(FILE, ...a);
    const debug = (...a) => window.logger?.debug?.(FILE, ...a);
    const warn  = (...a) => window.logger?.warn?.(FILE, ...a);
    const error = (...a) => window.logger?.error?.(FILE, ...a);

    // ==================================================
    // EXPORT
    // ==================================================

    const api = {
        render
    };    

    // =====================================================
    // MAIN
    // =====================================================

// Dentro de listLayout.js

async function render({ container, section = {}, context = {} }) {
    const layoutConfig = section || {};

    try {
        if (!container) return;
        container.innerHTML = "";

        const items = resolveItems(layoutConfig, context);

        if (!items.length) {
            warn("Sin elementos para renderizar en listLayout.");
            return;
        }

        const fields = resolveFields(layoutConfig, items, context);

        const view = String(
            layoutConfig.view || layoutConfig.tipo || "grid"
        ).toLowerCase();

        // IMPORTANTE: poner 'return await' para asegurar la renderización en el DOM
        if (view === "grid" || view === "cards") {
            return await renderGrid({ container, items, fields, layoutConfig, context });
        } else {
            return await renderTable({ container, items, fields, layoutConfig, context });
        }

    } catch(e) {
        error("Error en render de listLayout:", e);
    }
}

    // =====================================================
    // RESOLVERS DE DATOS Y CAMPOS
    // =====================================================

    function resolveItems(layoutConfig, context){
        if (Array.isArray(layoutConfig.items) && layoutConfig.items.length) {
            return layoutConfig.items;
        }

        const datasetKey = layoutConfig.dataset || layoutConfig.dataSource;
        if (datasetKey && context.datasets?.[datasetKey]?.items) {
            return context.datasets[datasetKey].items;
        }

        if (context.datasets?.data?.items) {
            return context.datasets.data.items;
        }

        if (context.datasets?.main?.items) {
            return context.datasets.main.items;
        }

        if (Array.isArray(context.items)) {
            return context.items;
        }

        return [];
    }

    function resolveFields(layoutConfig, items, context){
        let rawFields = items?.[0]?.fields || layoutConfig.fields || sectionFieldsFromContext(layoutConfig, context);

        if (!rawFields || !rawFields.length) {
            const sampleItem = items?.[0]?.value || items?.[0];
            if (sampleItem && typeof sampleItem === "object") {
                rawFields = Object.keys(sampleItem)
                    .filter(key => key !== "__resolved")
                    .map(key => ({ campo: key, label: key }));
            }
        }

        return expandFields(rawFields || []);
    }

    function sectionFieldsFromContext(layoutConfig, context){
        const schemaName = layoutConfig.schema;
        if (schemaName && context.schemas?.[schemaName]?.fields) {
            return context.schemas[schemaName].fields;
        }
        return [];
    }

    // =====================================================
    // VISIBLE FIELDS
    // =====================================================

    function buildVisibleFields(fields = []){
        return fields.filter(field => {
            return (
                field.hidden !== true &&
                field.visible !== false &&
                field.visible !== "false"
            );
        });
    }

    // =====================================================
    // NAVIGATION
    // =====================================================

    function applyNavigation({ element, item }){
        if(
            !element ||
            !window.navigateRenderer?.isNavigation(item?.navigation)
        ){
            return;
        }

        element.style.cursor = "pointer";
        element.onclick = async ()=>{
            await window.navigateRenderer.navigate(item.navigation);
        };
    }

    // =====================================================
    // TABLE
    // =====================================================

    async function renderTable({
        container,
        items,
        fields,
        layoutConfig,
        context
    }){

        const table = document.createElement("table");
        table.className = "list-table";

        const visibleFields = buildVisibleFields(fields);

        //------------------------------------------------
        // HEADER
        //------------------------------------------------

        const thead = document.createElement("thead");
        const tr = document.createElement("tr");

        for(const field of visibleFields){     
            const th = document.createElement("th");
            th.className = "list-header";

            if(field.columnWidth){
                th.style.width = field.columnWidth;
                th.style.minWidth = field.columnWidth;
                th.style.maxWidth = field.columnWidth;
            }

            th.innerText = field.label || field.campo || "";
            tr.appendChild(th);
        }

        thead.appendChild(tr);
        table.appendChild(thead);

        //------------------------------------------------
        // BODY
        //------------------------------------------------

        const tbody = document.createElement("tbody");

        for(const item of items){
            const row = document.createElement("tr");
            row.className = "list-row";          

            const fieldsToRender = buildVisibleFields(
                expandFields(item.fields || fields)
            );
                            
            for(const field of fieldsToRender){
                const td = document.createElement("td");
                td.className = "list-cell";
            
                if(field.columnWidth){
                    td.style.width = field.columnWidth;
                }

                // Extracción de valor con fallback dinámico
                const itemData = item?.value || item;
                const cellValue = 
                    field.resolvedValue ?? 
                    field.value ?? 
                    itemData?.__resolved?.[field.campo] ?? 
                    itemData?.[field.campo];
            
                await window.fieldRenderer?.render({
                    container: td,
                    value: cellValue,
                    field,
                    mode: layoutConfig.mode || "display",
                    context:{
                        ...context,
                        item,
                        currentItem: item,
                        currentField: field
                    }
                });
            
                row.appendChild(td);
            }

            applyNavigation({ element: row, item });
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        container.appendChild(table);
    }

    // =====================================================
    // GRID
    // =====================================================

    async function renderGrid({
        container,
        items,
        fields,
        layoutConfig,
        context
    }){

        const grid = document.createElement("div");
        grid.className = "list-grid";

        for(const item of items){
            const card = document.createElement("div");
            card.className = "list-card";

            const fieldsToRender = item.fields || fields;

            for(const field of fieldsToRender){
                if(field.hidden){
                    continue;
                }

                const row = document.createElement("div");
                row.className = "list-card-row";

                if(field.showLabel !== false){
                    const label = document.createElement("div");
                    label.className = "list-card-label";
                    label.innerText = field.label || field.campo;
                    row.appendChild(label);
                }

                const valueDiv = document.createElement("div");
                valueDiv.className = "list-card-value";

                const itemData = item?.value || item;
                const cellValue = 
                    field.resolvedValue ?? 
                    field.value ?? 
                    itemData?.__resolved?.[field.campo] ?? 
                    itemData?.[field.campo];

                await window.fieldRenderer?.render({
                    container: valueDiv,
                    value: cellValue,
                    field,
                    mode: layoutConfig.mode || "display",
                    context:{
                        ...context,
                        item,
                        currentItem: item,
                        currentField: field
                    }
                });

                row.appendChild(valueDiv);
                card.appendChild(row);
            }

            applyNavigation({ element: card, item });
            grid.appendChild(card);
        }

        container.appendChild(grid);
    }

    function expandFields(fields = [], parentLabel = null){
        const result = [];

        for(const field of fields){
            const current = { ...field };

            if(parentLabel && !current.label){
                current.label = `${parentLabel} - ${current.campo}`;
            }

            result.push(current);

            if(Array.isArray(current.fields) && current.fields.length){
                result.push(...expandFields(current.fields, current.label));
            }
        }

        return result;
    }

    // ==================================================
    // REGISTRO GLOBAL
    // ==================================================
    window.list = api;
    window.listLayout = api;

    if (window.layoutRenderer?.registerLayout) {
        window.layoutRenderer.registerLayout("list", api);
    }

    log("✅ listLayout registrado correctamente");

})();