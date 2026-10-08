// ======================================================
// 📁 js/layouts/listLayout.js (Safari Catalina Ready)
// ======================================================
// ✅ UNIVERSAL DECLARATIVE RUNTIME
// ✅ Compatible con layoutRenderer actual
// ✅ Soporta vistas 'grid' (cards) y 'table'
// ✅ Registro automático en window.list y window.listLayout
// ======================================================

(function () {

    const FILE = "listLayout.js";

    const log = (...a) => window.logger?.info?.(FILE, ...a);
    const warn = (...a) => window.logger?.warn?.(FILE, ...a);
    const error = (...a) => window.logger?.error?.(FILE, ...a);

    // ==================================================
    // EXPORT & API
    // ==================================================
    const api = {
        render: render
    };

    // Helper para extraer valor con fallback seguro en Safari 13/14
    function getCellValue(field, itemData) {
        if (field.resolvedValue !== undefined) return field.resolvedValue;
        if (field.value !== undefined) return field.value;
        if (itemData && itemData.__resolved && itemData.__resolved[field.campo] !== undefined) {
            return itemData.__resolved[field.campo];
        }
        if (itemData && itemData[field.campo] !== undefined) {
            return itemData[field.campo];
        }
        return "";
    }

    // =====================================================
    // MAIN RENDER
    // =====================================================
    async function render({ container, section = {}, context = {} } = {}) {
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
            const view = String(layoutConfig.view || layoutConfig.tipo || "grid").toLowerCase();

            if (view === "grid" || view === "cards") {
                return await renderGrid({ container: container, items: items, fields: fields, layoutConfig: layoutConfig, context: context });
            } else {
                return await renderTable({ container: container, items: items, fields: fields, layoutConfig: layoutConfig, context: context });
            }

        } catch (e) {
            error("Error en render de listLayout:", e);
            if (window.errorHandler?.handle) {
                window.errorHandler.handle({
                    error: e,
                    context: "listLayout",
                    step: "render"
                });
            }
        }
    }

    // =====================================================
    // RESOLVERS DE DATOS Y CAMPOS
    // =====================================================
    function resolveItems(layoutConfig, context) {
        if (Array.isArray(layoutConfig.items) && layoutConfig.items.length) {
            return layoutConfig.items;
        }

        const datasetKey = layoutConfig.dataset || layoutConfig.dataSource;
        if (datasetKey && context.datasets && context.datasets[datasetKey] && context.datasets[datasetKey].items) {
            return context.datasets[datasetKey].items;
        }

        if (context.datasets && context.datasets.data && context.datasets.data.items) {
            return context.datasets.data.items;
        }

        if (context.datasets && context.datasets.main && context.datasets.main.items) {
            return context.datasets.main.items;
        }

        if (Array.isArray(context.items)) {
            return context.items;
        }

        return [];
    }

    function resolveFields(layoutConfig, items, context) {
        let rawFields = items?.[0]?.fields || layoutConfig.fields || sectionFieldsFromContext(layoutConfig, context);

        if (!rawFields || !rawFields.length) {
            const sampleItem = items?.[0]?.value || items?.[0];
            if (sampleItem && typeof sampleItem === "object") {
                rawFields = Object.keys(sampleItem)
                    .filter(function (key) { return key !== "__resolved"; })
                    .map(function (key) { return { campo: key, label: key }; });
            }
        }

        return expandFields(rawFields || []);
    }

    function sectionFieldsFromContext(layoutConfig, context) {
        const schemaName = layoutConfig.schema;
        if (schemaName && context.schemas && context.schemas[schemaName] && context.schemas[schemaName].fields) {
            return context.schemas[schemaName].fields;
        }
        return [];
    }

    // =====================================================
    // VISIBLE FIELDS
    // =====================================================
    function buildVisibleFields(fields = []) {
        return fields.filter(function (field) {
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
    function applyNavigation({ element, item } = {}) {
        if (
            !element ||
            !window.navigateRenderer?.isNavigation?.(item?.navigation)
        ) {
            return;
        }

        element.style.cursor = "pointer";
        element.onclick = async function () {
            try {
                await window.navigateRenderer.navigate(item.navigation);
            } catch (err) {
                error("Error al navegar desde listLayout:", err);
            }
        };
    }

    // =====================================================
    // TABLE VIEW
    // =====================================================
    async function renderTable({ container, items, fields, layoutConfig, context }) {
        const table = document.createElement("table");
        table.className = "list-table";

        const visibleFields = buildVisibleFields(fields);

        // HEADER
        const thead = document.createElement("thead");
        const tr = document.createElement("tr");

        for (var i = 0; i < visibleFields.length; i++) {
            var field = visibleFields[i];
            var th = document.createElement("th");
            th.className = "list-header";

            if (field.columnWidth) {
                th.style.width = field.columnWidth;
                th.style.minWidth = field.columnWidth;
                th.style.maxWidth = field.columnWidth;
            }

            th.innerText = field.label || field.campo || "";
            tr.appendChild(th);
        }

        thead.appendChild(tr);
        table.appendChild(thead);

        // BODY
        const tbody = document.createElement("tbody");

        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var row = document.createElement("tr");
            row.className = "list-row";

            var fieldsToRender = buildVisibleFields(
                expandFields(item.fields || fields)
            );

            for (var k = 0; k < fieldsToRender.length; k++) {
                var f = fieldsToRender[k];
                var td = document.createElement("td");
                td.className = "list-cell";

                if (f.columnWidth) {
                    td.style.width = f.columnWidth;
                }

                var itemData = item?.value || item;
                var cellValue = getCellValue(f, itemData);

                if (window.fieldRenderer?.render) {
                    await window.fieldRenderer.render({
                        container: td,
                        value: cellValue,
                        field: f,
                        mode: layoutConfig.mode || "display",
                        context: Object.assign({}, context, {
                            item: item,
                            currentItem: item,
                            currentField: f
                        })
                    });
                } else {
                    td.innerText = String(cellValue ?? "");
                }

                row.appendChild(td);
            }

            applyNavigation({ element: row, item: item });
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        container.appendChild(table);
    }

    // =====================================================
    // GRID / CARDS VIEW
    // =====================================================
    async function renderGrid({ container, items, fields, layoutConfig, context }) {
        const grid = document.createElement("div");
        grid.className = "list-grid";

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var card = document.createElement("div");
            card.className = "list-card";

            var fieldsToRender = item.fields || fields;

            for (var j = 0; j < fieldsToRender.length; j++) {
                var field = fieldsToRender[j];
                if (field.hidden) continue;

                var row = document.createElement("div");
                row.className = "list-card-row";

                if (field.showLabel !== false) {
                    var label = document.createElement("div");
                    label.className = "list-card-label";
                    label.innerText = field.label || field.campo || "";
                    row.appendChild(label);
                }

                var valueDiv = document.createElement("div");
                valueDiv.className = "list-card-value";

                var itemData = item?.value || item;
                var cellValue = getCellValue(field, itemData);

                if (window.fieldRenderer?.render) {
                    await window.fieldRenderer.render({
                        container: valueDiv,
                        value: cellValue,
                        field: field,
                        mode: layoutConfig.mode || "display",
                        context: Object.assign({}, context, {
                            item: item,
                            currentItem: item,
                            currentField: field
                        })
                    });
                } else {
                    valueDiv.innerText = String(cellValue ?? "");
                }

                row.appendChild(valueDiv);
                card.appendChild(row);
            }

            applyNavigation({ element: card, item: item });
            grid.appendChild(card);
        }

        container.appendChild(grid);
    }

    // =====================================================
    // EXPAND FIELDS (RECURSIVO)
    // =====================================================
    function expandFields(fields = [], parentLabel = null) {
        const result = [];

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var current = Object.assign({}, field);

            if (parentLabel && !current.label) {
                current.label = parentLabel + " - " + (current.campo || "");
            }

            result.push(current);

            if (Array.isArray(current.fields) && current.fields.length) {
                var expandedChildren = expandFields(current.fields, current.label);
                for (var j = 0; j < expandedChildren.length; j++) {
                    result.push(expandedChildren[j]);
                }
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

    log("✅ listLayout registrado correctamente.");

})();