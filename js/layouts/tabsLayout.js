// ======================================================
// 📁 js/layouts/tabsLayout.js (Safari Catalina Ready)
// ======================================================
// ✅ UNIVERSAL DECLARATIVE RUNTIME
// ✅ Compatible con layoutRenderer actual
// ✅ Registro automático en window.tabs
// ======================================================

(function () {

    const FILE = "tabsLayout.js";

    const log = (...a) => window.logger?.info?.(FILE, ...a);
    const warn = (...a) => window.logger?.warn?.(FILE, ...a);
    const error = (...a) => window.logger?.error?.(FILE, ...a);

    // ==================================================
    // EXPORT & API
    // ==================================================
    const api = {
        render
    };

    // ==================================================
    // MAIN RENDER
    // ==================================================
    async function render({
        container,
        section = {},
        context = {}
    } = {}) {

        try {
            if (!container) return;

            container.innerHTML = "";

            const tabs = section.tabs || section.items || [];

            if (!Array.isArray(tabs) || !tabs.length) {
                warn("Estructura 'tabs' inválida o vacía.");
                return;
            }

            // 1. Cargar Estructura Base HTML
            const wrapper = document.createElement("div");
            wrapper.className = "tabs-layout";
            container.appendChild(wrapper);

            const header = document.createElement("div");
            header.className = "tabs-header";
            wrapper.appendChild(header);

            const body = document.createElement("div");
            body.className = "tabs-body";
            wrapper.appendChild(body);

            let currentIndex = 0;

            // 2. Actualizador de Botones Activos
            function updateButtons() {
                const buttons = header.querySelectorAll(".tab-button");
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].classList.toggle("active", i === currentIndex);
                }
            }

            // 3. Renderizador del Contenido del Tab
            async function renderTab(index) {
                body.innerHTML = "";

                const tab = tabs[index];
                if (!tab) return;

                const sections = tab.sections || [];

                // TAB SIMPLE (Componente Directo)
                if (!sections.length && tab.component) {
                    await window.layoutRenderer?.renderLayout?.({
                        container: body,
                        section: tab,
                        context: Object.assign({}, context, {
                            currentTab: tab,
                            currentTabIndex: index
                        })
                    });
                    return;
                }

                // TAB CON SECCIONES ANIDADAS
                for (var i = 0; i < sections.length; i++) {
                    var childSection = sections[i];

                    var sectionContainer = document.createElement("div");
                    sectionContainer.className = "tab-section";
                    body.appendChild(sectionContainer);

                    await window.layoutRenderer?.renderLayout?.({
                        container: sectionContainer,
                        section: childSection,
                        context: Object.assign({}, context, {
                            currentTab: tab,
                            currentTabIndex: index
                        })
                    });
                }
            }

            // 4. Crear Botones de Pestañas
            tabs.forEach(function (tab, index) {
                const button = document.createElement("button");
                button.className = "tab-button";
                button.innerText = tab.label || tab.title || ("Tab " + (index + 1));

                button.onclick = async function () {
                    try {
                        currentIndex = index;
                        updateButtons();
                        await renderTab(index);
                    } catch (err) {
                        error("Error al cambiar de tab:", err);
                        if (window.errorHandler?.handle) {
                            window.errorHandler.handle({
                                error: err,
                                context: "tabsLayout",
                                step: "changeTab"
                            });
                        }
                    }
                };

                header.appendChild(button);
            });

            // 5. Renderizar Primera Pestaña por Defecto
            updateButtons();
            await renderTab(0);

        } catch (e) {
            error("render:", e);
            if (window.errorHandler?.handle) {
                window.errorHandler.handle({
                    error: e,
                    context: "tabsLayout",
                    step: "render"
                });
            }
        }
    }

    // ==================================================
    // REGISTRO GLOBAL
    // ==================================================
    window.tabs = api;

    log("✅ tabsLayout registrado correctamente.");

})();