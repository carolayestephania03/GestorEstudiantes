(() => {
    'use strict';

    // =========================================================
    // DOM
    // =========================================================
    const tbodyEscalafones = document.getElementById('tbodyEscalafones');
    const tbodyRenglones = document.getElementById('tbodyRenglones');
    const tbodyMaterias = document.getElementById('tbodyMaterias');
    const tbodyAmbitos = document.getElementById('tbodyAmbitos');

    const inputEscalafon = document.getElementById('inputEscalafon');
    const inputRenglon = document.getElementById('inputRenglon');
    const inputAmbito = document.getElementById('inputAmbito');
    const inputDescripcionAmbito = document.getElementById('inputDescripcionAmbito');

    const inputNombreMateria = document.getElementById('inputNombreMateria');
    const inputDescripcionMateria = document.getElementById('inputDescripcionMateria');
    const contenedorGradosMateria = document.getElementById('contenedorGradosMateria');

    const btnCrearEscalafon = document.getElementById('btnCrearEscalafon');
    const btnCrearRenglon = document.getElementById('btnCrearRenglon');
    const btnCrearAmbito = document.getElementById('btnCrearAmbito');
    const btnCrearMateria = document.getElementById('btnCrearMateria');

    const modalConfiguracionMateriasEl = document.getElementById('modalConfiguracionMaterias');
    const modalConfiguracionMaterias = modalConfiguracionMateriasEl
        ? new bootstrap.Modal(modalConfiguracionMateriasEl)
        : null;

    // ===== Materias por grado =====
    const selectGradoMaterias = document.getElementById('selectGradoMaterias');
    const gridMateriasPorGrado = document.getElementById('gridMateriasPorGrado');
    const btnEditarBasico = document.getElementById('btnEditarBasico');
    const btnGuardarBasico = document.getElementById('btnGuardarBasico');

    // =========================================================
    // Estado
    // =========================================================
    let gradosCache = [];
    let materiasCache = [];
    let materiasActivasPorGradoCache = [];
    let ambitosCache = [];
    let modoEdicionMateriasPorGrado = false;

    // =========================================================
    // Helpers
    // =========================================================
    function safeText(value) {
        return String(value ?? '').replace(/[&<>"']/g, (c) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    }

    function normalizarTexto(valor) {
        return String(valor ?? '').trim();
    }

    function renderEmptyRow(tbody, cols, mensaje = 'Sin información disponible') {
        if (!tbody) return;
        tbody.innerHTML = `
            <tr>
                <td colspan="${cols}" class="text-center text-muted py-4">${safeText(mensaje)}</td>
            </tr>
        `;
    }

    function crearBotonesAccion(tipo, id, descripcion = '', descripcion2 = '') {
        return `
            <div class="d-flex justify-content-center gap-2 flex-wrap">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-primary btn-actualizar-catalogo"
                    data-tipo="${safeText(tipo)}"
                    data-id="${safeText(id)}"
                    data-descripcion="${safeText(descripcion)}"
                    data-descripcion2="${safeText(descripcion2)}">
                    Actualizar
                </button>

                <button
                    type="button"
                    class="btn btn-sm btn-outline-danger btn-eliminar-catalogo"
                    data-tipo="${safeText(tipo)}"
                    data-id="${safeText(id)}"
                    data-descripcion="${safeText(descripcion)}">
                    Eliminar
                </button>
            </div>
        `;
    }

        function crearBotonesAccionSimple(tipo, id, descripcion = '', descripcion2 = '') {
        return `
            <div class="d-flex justify-content-center gap-2 flex-wrap">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-primary btn-actualizar-catalogo"
                    data-tipo="${safeText(tipo)}"
                    data-id="${safeText(id)}"
                    data-descripcion="${safeText(descripcion)}"
                    data-descripcion2="${safeText(descripcion2)}">
                    Actualizar
                </button>
            </div>
        `;
    }

    function obtenerUrlAbsoluta(path) {
        return `http://localhost:8001/${path}`;
    }

    async function getJSON(path) {
        const res = await fetch(obtenerUrlAbsoluta(path), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} - ${path}`);
        }

        return res.json();
    }

    async function postJSON(path, payload) {
        const res = await fetch(obtenerUrlAbsoluta(path), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} - ${path}`);
        }

        return res.json();
    }

    async function deleteJSON(path, payload) {
        const res = await fetch(obtenerUrlAbsoluta(path), {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} - ${path}`);
        }

        return res.json();
    }

    async function putJSON(path, payload) {
        const res = await fetch(obtenerUrlAbsoluta(path), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} - ${path}`);
        }

        return res.json();
    }

    function setBotonesMateriasPorGradoEstado() {
        if (!btnEditarBasico || !btnGuardarBasico) return;

        btnGuardarBasico.disabled = !modoEdicionMateriasPorGrado || !selectGradoMaterias?.value;
        btnEditarBasico.textContent = modoEdicionMateriasPorGrado ? 'Cancelar' : 'Editar';
        btnEditarBasico.classList.toggle('btn-outline-secondary', !modoEdicionMateriasPorGrado);
        btnEditarBasico.classList.toggle('btn-outline-danger', modoEdicionMateriasPorGrado);
    }

    function obtenerGradosSeleccionadosMateria() {
        return Array.from(document.querySelectorAll('.chk-grado-materia:checked'))
            .map(chk => Number(chk.value))
            .filter(id => !Number.isNaN(id));
    }

    function limpiarFormularioMateria() {
        if (inputNombreMateria) inputNombreMateria.value = '';
        if (inputDescripcionMateria) inputDescripcionMateria.value = '';

        document.querySelectorAll('.chk-grado-materia').forEach(chk => {
            chk.checked = false;
        });
    }

    function renderGradosMateria() {
        if (!contenedorGradosMateria) return;

        if (!gradosCache.length) {
            contenedorGradosMateria.innerHTML = `
                <div class="col-12">
                    <div class="text-muted text-center py-2">No hay grados disponibles</div>
                </div>
            `;
            return;
        }

        contenedorGradosMateria.innerHTML = gradosCache.map(grado => `
            <div class="col-12 col-sm-6 col-lg-4">
                <div class="grado-check-item">
                    <div class="form-check">
                        <input
                            class="form-check-input chk-grado-materia"
                            type="checkbox"
                            value="${safeText(grado.grado_id)}"
                            id="gradoMateria_${safeText(grado.grado_id)}">
                        <label class="form-check-label" for="gradoMateria_${safeText(grado.grado_id)}">
                            ${safeText(grado.descripcion || grado.grado_des)}
                        </label>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // =========================================================
    // Render catálogo
    // =========================================================
    function renderEscalafones(data = []) {
        if (!tbodyEscalafones) return;
        if (!data.length) return renderEmptyRow(tbodyEscalafones, 3);

        tbodyEscalafones.innerHTML = data.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${safeText(item.descripcion)}</td>
                <td class="text-center">
                    ${crearBotonesAccion('escalafon', item.escalafon_id, item.descripcion)}
                </td>
            </tr>
        `).join('');
    }

    function renderRenglones(data = []) {
        if (!tbodyRenglones) return;
        if (!data.length) return renderEmptyRow(tbodyRenglones, 3);

        tbodyRenglones.innerHTML = data.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${safeText(item.descripcion)}</td>
                <td class="text-center">
                    ${crearBotonesAccion('renglon', item.renglon_id, item.descripcion)}
                </td>
            </tr>
        `).join('');
    }

    function renderMaterias(data = []) {
        if (!tbodyMaterias) return;
        if (!data.length) return renderEmptyRow(tbodyMaterias, 4);

        tbodyMaterias.innerHTML = data.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${safeText(item.nombre_materia)}</td>
                <td>${safeText(item.descripcion_materia)}</td>
                <td class="text-center">
                    ${crearBotonesAccionSimple('materia', item.materia_id, item.nombre_materia, item.descripcion_materia)}
                </td>
            </tr>
        `).join('');
    }

    function renderAmbitos(data = []) {
        if (!tbodyAmbitos) return;
        if (!data.length) return renderEmptyRow(tbodyAmbitos, 4);

        tbodyAmbitos.innerHTML = data.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${safeText(item.nombre_topico)}</td>
                <td>${safeText(item.descripcion)}</td>
                <td class="text-center">
                    ${crearBotonesAccion('ambito', item.topico_id, item.nombre_topico, item.descripcion)}
                </td>
            </tr>
        `).join('');
    }

    // =========================================================
    // Materias por grado
    // =========================================================
    function renderSelectGrados() {
        if (!selectGradoMaterias) return;

        const opciones = gradosCache.map(grado => `
            <option value="${safeText(grado.grado_id)}">${safeText(grado.descripcion || grado.grado_des)}</option>
        `).join('');

        selectGradoMaterias.innerHTML = `
            <option value="">Seleccione un grado</option>
            ${opciones}
        `;
    }

    function obtenerMateriasActivasDeGrado(gradoId) {
        const registro = materiasActivasPorGradoCache.find(item => Number(item.grado_id) === Number(gradoId));
        return Array.isArray(registro?.materias) ? registro.materias : [];
    }

    function renderMateriasPorGrado(gradoId) {
        if (!gridMateriasPorGrado) return;

        if (!gradoId) {
            gridMateriasPorGrado.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-secondary mb-0 text-center">
                        Seleccione un grado para visualizar las materias.
                    </div>
                </div>
            `;
            return;
        }

        const materiasActivas = obtenerMateriasActivasDeGrado(gradoId);
        const idsActivos = new Set(materiasActivas.map(item => Number(item.materia_id)));

        if (!Array.isArray(materiasCache) || !materiasCache.length) {
            gridMateriasPorGrado.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning mb-0 text-center">
                        No hay materias disponibles para mostrar.
                    </div>
                </div>
            `;
            return;
        }

        gridMateriasPorGrado.innerHTML = materiasCache.map((materia) => {
            const materiaId = Number(materia.materia_id);
            const checked = idsActivos.has(materiaId);
            const disabled = !modoEdicionMateriasPorGrado ? 'disabled' : '';

            return `
                <div class="col-12 col-sm-6 col-md-4 col-xl-2">
                    <div class="materia-check-card p-3 ${checked ? 'activa' : ''} ${!modoEdicionMateriasPorGrado ? 'disabled-card' : ''}">
                        <div class="form-check">
                            <input
                                class="form-check-input chk-materia-grado"
                                type="checkbox"
                                value="${safeText(materiaId)}"
                                id="materiaGrado_${safeText(materiaId)}"
                                ${checked ? 'checked' : ''}
                                ${disabled}
                            >
                            <label class="form-check-label" for="materiaGrado_${safeText(materiaId)}">
                                <div class="materia-check-nombre">${safeText(materia.nombre_materia)}</div>
                            </label>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        actualizarEstiloCardsMaterias();
        setBotonesMateriasPorGradoEstado();
    }

    function actualizarEstiloCardsMaterias() {
        document.querySelectorAll('.chk-materia-grado').forEach(chk => {
            const card = chk.closest('.materia-check-card');
            if (!card) return;

            card.classList.toggle('activa', chk.checked);
            card.classList.toggle('disabled-card', chk.disabled);
        });
    }

    function obtenerMateriasSeleccionadas() {
        return Array.from(document.querySelectorAll('.chk-materia-grado:checked'))
            .map(chk => Number(chk.value))
            .filter(id => !Number.isNaN(id));
    }

    async function cargarMateriasPorGrado() {
        try {
            const [gradosRes, materiasRes, activasRes] = await Promise.all([
                getJSON('grado'),
                getJSON('materia'),
                postJSON('grado/obtenerGradoMateria', { grado_id: 0 })
            ]);

            gradosCache = Array.isArray(gradosRes.data) ? gradosRes.data : [];
            materiasCache = Array.isArray(materiasRes.data) ? materiasRes.data : [];
            materiasActivasPorGradoCache = Array.isArray(activasRes.data) ? activasRes.data : [];

            renderSelectGrados();
            renderGradosMateria();

            if (gradosCache.length) {
                const primerGradoId = Number(gradosCache[0].grado_id);
                if (selectGradoMaterias) selectGradoMaterias.value = String(primerGradoId);
                renderMateriasPorGrado(primerGradoId);
            } else {
                renderMateriasPorGrado('');
            }

            modoEdicionMateriasPorGrado = false;
            setBotonesMateriasPorGradoEstado();

        } catch (error) {
            console.error('Error cargando materias por grado:', error);

            if (gridMateriasPorGrado) {
                gridMateriasPorGrado.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger mb-0 text-center">
                            No fue posible cargar la configuración de materias por grado.
                        </div>
                    </div>
                `;
            }
        }
    }

    async function guardarMateriasActivasPorGrado() {
        const gradoId = Number(selectGradoMaterias?.value);

        if (!gradoId) {
            alert('Debe seleccionar un grado.');
            return;
        }

        const materiasSeleccionadas = obtenerMateriasSeleccionadas();

        try {
            const confirmar = confirm('¿Desea guardar la configuración de materias activas para este grado?');
            if (!confirmar) return;

            await putJSON('grado/actualizarMateriasActivasPorGrado', {
                grado_id: gradoId,
                materias: materiasSeleccionadas
            });

            await cargarMateriasPorGrado();
            modoEdicionMateriasPorGrado = false;
            renderMateriasPorGrado(gradoId);
            setBotonesMateriasPorGradoEstado();

            alert('Materias activas por grado actualizadas correctamente.');
        } catch (error) {
            console.error('Error guardando materias activas por grado:', error);
            alert('No fue posible guardar la configuración de materias activas por grado.');
        }
    }

    function initMateriasPorGradoEventos() {
        selectGradoMaterias?.addEventListener('change', () => {
            const gradoId = Number(selectGradoMaterias.value || 0);
            modoEdicionMateriasPorGrado = false;
            renderMateriasPorGrado(gradoId);
            setBotonesMateriasPorGradoEstado();
        });

        btnEditarBasico?.addEventListener('click', () => {
            const gradoId = Number(selectGradoMaterias?.value || 0);

            if (!gradoId) {
                alert('Seleccione un grado.');
                return;
            }

            modoEdicionMateriasPorGrado = !modoEdicionMateriasPorGrado;
            renderMateriasPorGrado(gradoId);
            setBotonesMateriasPorGradoEstado();
        });

        btnGuardarBasico?.addEventListener('click', async () => {
            await guardarMateriasActivasPorGrado();
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('chk-materia-grado')) {
                actualizarEstiloCardsMaterias();
            }
        });
    }

    // =========================================================
    // Carga inicial
    // =========================================================
    async function cargarCatalogosPanel() {
        try {
            const [escalafonesRes, renglonesRes, materiasRes, ambitosRes, gradosRes] = await Promise.all([
                getJSON('escalafon'),
                getJSON('renglon'),
                getJSON('materia'),
                getJSON('actitudinal/topicosActitudinal'),
                getJSON('grado')
            ]);

            gradosCache = Array.isArray(gradosRes.data) ? gradosRes.data : [];
            materiasCache = Array.isArray(materiasRes.data) ? materiasRes.data : [];
            ambitosCache = Array.isArray(ambitosRes.data) ? ambitosRes.data : [];

            renderEscalafones(Array.isArray(escalafonesRes.data) ? escalafonesRes.data : []);
            renderRenglones(Array.isArray(renglonesRes.data) ? renglonesRes.data : []);
            renderMaterias(materiasCache);
            renderAmbitos(ambitosCache);
            renderGradosMateria();
        } catch (error) {
            console.error('Error cargando catálogos:', error);
            renderEmptyRow(tbodyEscalafones, 3, 'No se pudo cargar escalafones');
            renderEmptyRow(tbodyRenglones, 3, 'No se pudo cargar renglones');
            renderEmptyRow(tbodyMaterias, 4, 'No se pudo cargar materias');
            renderEmptyRow(tbodyAmbitos, 4, 'No se pudo cargar ámbitos');
        }
    }

    // =========================================================
    // Toggle tablas
    // =========================================================
    function initToggleTablas() {
        document.querySelectorAll('.btn-toggle-tabla').forEach(btn => {
            btn.addEventListener('click', () => {
                const selector = btn.dataset.target;
                const target = document.querySelector(selector);
                if (!target) return;

                const oculto = target.classList.toggle('d-none');
                btn.textContent = oculto ? 'Mostrar tabla' : 'Ocultar tabla';
            });
        });
    }

    // =========================================================
    // CRUD Escalafón
    // =========================================================
    async function crearEscalafon() {
        const descripcion = normalizarTexto(inputEscalafon?.value);
        if (!descripcion) {
            alert('Ingrese la descripción del escalafón.');
            return;
        }

        try {
            const confirmar = confirm(`¿Desea crear el escalafón "${descripcion}"?`);
            if (!confirmar) return;

            await postJSON('escalafon/CrearEscalafon', { descripcion });

            if (inputEscalafon) inputEscalafon.value = '';
            await cargarCatalogosPanel();
            alert('Escalafón creado correctamente.');
        } catch (error) {
            console.error('Error creando escalafón:', error);
            alert('No fue posible crear el escalafón.');
        }
    }

    async function actualizarEscalafon(escalafon_id, descripcionActual) {
        const nuevaDescripcion = prompt('Actualizar descripción del escalafón:', descripcionActual);
        if (nuevaDescripcion === null) return;

        const descripcion = normalizarTexto(nuevaDescripcion);
        if (!descripcion) {
            alert('La descripción del escalafón es obligatoria.');
            return;
        }

        try {
            const confirmar = confirm(`¿Desea actualizar el escalafón a "${descripcion}"?`);
            if (!confirmar) return;

            await putJSON('escalafon/ActualizarEscalafon', {
                escalafon_id: Number(escalafon_id),
                descripcion
            });

            await cargarCatalogosPanel();
            alert('Escalafón actualizado correctamente.');
        } catch (error) {
            console.error('Error actualizando escalafón:', error);
            alert('No fue posible actualizar el escalafón.');
        }
    }

    async function eliminarEscalafon(escalafon_id, descripcionActual) {
        try {
            const confirmar = confirm(`¿Desea eliminar el escalafón "${descripcionActual}"?`);
            if (!confirmar) return;

            await deleteJSON('escalafon/EliminarEscalafon', {
                escalafon_id: Number(escalafon_id)
            });

            await cargarCatalogosPanel();
            alert('Escalafón eliminado correctamente.');
        } catch (error) {
            console.error('Error eliminando escalafón:', error);
            alert('No fue posible eliminar el escalafón.');
        }
    }

    // =========================================================
    // CRUD Renglón
    // =========================================================
    async function crearRenglon() {
        const descripcion = normalizarTexto(inputRenglon?.value);
        if (!descripcion) {
            alert('Ingrese la descripción del renglón.');
            return;
        }

        try {
            const confirmar = confirm(`¿Desea crear el renglón "${descripcion}"?`);
            if (!confirmar) return;

            await postJSON('renglon/CrearRenglon', { descripcion });

            if (inputRenglon) inputRenglon.value = '';
            await cargarCatalogosPanel();
            alert('Renglón creado correctamente.');
        } catch (error) {
            console.error('Error creando renglón:', error);
            alert('No fue posible crear el renglón.');
        }
    }

    async function actualizarRenglon(renglon_id, descripcionActual) {
        const nuevaDescripcion = prompt('Actualizar descripción del renglón:', descripcionActual);
        if (nuevaDescripcion === null) return;

        const descripcion = normalizarTexto(nuevaDescripcion);
        if (!descripcion) {
            alert('La descripción del renglón es obligatoria.');
            return;
        }

        try {
            const confirmar = confirm(`¿Desea actualizar el renglón a "${descripcion}"?`);
            if (!confirmar) return;

            await putJSON('renglon/ActualizarRenglon', {
                renglon_id: Number(renglon_id),
                descripcion
            });

            await cargarCatalogosPanel();
            alert('Renglón actualizado correctamente.');
        } catch (error) {
            console.error('Error actualizando renglón:', error);
            alert('No fue posible actualizar el renglón.');
        }
    }

    async function eliminarRenglon(renglon_id, descripcionActual) {
        try {
            const confirmar = confirm(`¿Desea eliminar el renglón "${descripcionActual}"?`);
            if (!confirmar) return;

            await deleteJSON('renglon/EliminarRenglon', {
                renglon_id: Number(renglon_id)
            });

            await cargarCatalogosPanel();
            alert('Renglón eliminado correctamente.');
        } catch (error) {
            console.error('Error eliminando renglón:', error);
            alert('No fue posible eliminar el renglón.');
        }
    }

    // =========================================================
    // CRUD Ámbitos
    // =========================================================
    async function crearAmbito() {
        const nombre_topico = normalizarTexto(inputAmbito?.value);
        const descripcion = normalizarTexto(inputDescripcionAmbito?.value);

        if (!nombre_topico) {
            alert('Ingrese el nombre del ámbito.');
            return;
        }

        if (!descripcion) {
            alert('Ingrese la descripción del ámbito.');
            return;
        }

        try {
            const confirmar = confirm(`¿Desea crear el ámbito "${nombre_topico}"?`);
            if (!confirmar) return;

            await postJSON('Actitudinal/crearTopicoActitudinal', {
                nombre_topico,
                descripcion
            });

            if (inputAmbito) inputAmbito.value = '';
            if (inputDescripcionAmbito) inputDescripcionAmbito.value = '';

            await cargarCatalogosPanel();
            alert('Ámbito creado correctamente.');
        } catch (error) {
            console.error('Error creando ámbito:', error);
            alert('No fue posible crear el ámbito.');
        }
    }

    async function actualizarAmbito(topico_id, nombreActual, descripcionActual) {
        const nuevoNombre = prompt('Actualizar nombre del ámbito:', nombreActual);
        if (nuevoNombre === null) return;

        const nuevaDescripcion = prompt('Actualizar descripción del ámbito:', descripcionActual);
        if (nuevaDescripcion === null) return;

        const nombre_topico = normalizarTexto(nuevoNombre);
        const descripcion = normalizarTexto(nuevaDescripcion);

        if (!nombre_topico) {
            alert('El nombre del ámbito es obligatorio.');
            return;
        }

        if (!descripcion) {
            alert('La descripción del ámbito es obligatoria.');
            return;
        }

        try {
            const confirmar = confirm(`¿Desea actualizar el ámbito "${nombre_topico}"?`);
            if (!confirmar) return;

            await putJSON('Actitudinal/actualizarTopicoActitudinal', {
                topico_id: Number(topico_id),
                nombre_topico,
                descripcion
            });

            await cargarCatalogosPanel();
            alert('Ámbito actualizado correctamente.');
        } catch (error) {
            console.error('Error actualizando ámbito:', error);
            alert('No fue posible actualizar el ámbito.');
        }
    }

    async function eliminarAmbito(topico_id, nombreActual) {
        try {
            const confirmar = confirm(`¿Desea eliminar el ámbito "${nombreActual}"?`);
            if (!confirmar) return;

            await deleteJSON('Actitudinal/eliminarTopicoActitudinal', {
                topico_id: Number(topico_id)
            });

            await cargarCatalogosPanel();
            alert('Ámbito eliminado correctamente.');
        } catch (error) {
            console.error('Error eliminando ámbito:', error);
            alert('No fue posible eliminar el ámbito.');
        }
    }

    // =========================================================
    // CRUD Materias
    // =========================================================
    async function crearMateria() {
        const nombre_materia = normalizarTexto(inputNombreMateria?.value);
        const descripcion_materia = normalizarTexto(inputDescripcionMateria?.value);
        const grados = obtenerGradosSeleccionadosMateria();

        if (!nombre_materia) {
            alert('Ingrese el nombre de la materia.');
            return;
        }

        if (!descripcion_materia) {
            alert('Ingrese la descripción de la materia.');
            return;
        }

        if (!grados.length) {
            alert('Seleccione al menos un grado para la materia.');
            return;
        }

        try {
            const confirmar = confirm(`¿Desea crear la materia "${nombre_materia}"?`);
            if (!confirmar) return;

            await postJSON('materia/crearMateria', {
                nombre_materia,
                descripcion_materia,
                grados
            });

            limpiarFormularioMateria();
            await cargarCatalogosPanel();
            await cargarMateriasPorGrado();
            alert('Materia creada correctamente.');
        } catch (error) {
            console.error('Error creando materia:', error);
            alert('No fue posible crear la materia.');
        }
    }

    async function actualizarMateria(materia_id, nombreActual, descripcionActual) {
        const nuevoNombre = prompt('Actualizar nombre de la materia:', nombreActual);
        if (nuevoNombre === null) return;

        const nuevaDescripcion = prompt('Actualizar descripción de la materia:', descripcionActual);
        if (nuevaDescripcion === null) return;

        const nombre_materia = normalizarTexto(nuevoNombre);
        const descripcion_materia = normalizarTexto(nuevaDescripcion);

        if (!nombre_materia) {
            alert('El nombre de la materia es obligatorio.');
            return;
        }

        if (!descripcion_materia) {
            alert('La descripción de la materia es obligatoria.');
            return;
        }

        try {
            const confirmar = confirm(`¿Desea actualizar la materia "${nombre_materia}"?`);
            if (!confirmar) return;

            await putJSON('materia/actualizarMateria', {
                materia_id: Number(materia_id),
                nombre_materia,
                descripcion_materia
            });

            await cargarCatalogosPanel();
            await cargarMateriasPorGrado();
            alert('Materia actualizada correctamente.');
        } catch (error) {
            console.error('Error actualizando materia:', error);
            alert('No fue posible actualizar la materia.');
        }
    }

    async function eliminarMateria(materia_id, nombreActual) {
        alert(`No se definió una ruta para eliminar la materia "${nombreActual}" (ID ${materia_id}).`);
    }

    // =========================================================
    // Acciones globales
    // =========================================================
    function initAccionesCatalogo() {
        document.addEventListener('click', async (e) => {
            const btnActualizar = e.target.closest('.btn-actualizar-catalogo');
            const btnEliminar = e.target.closest('.btn-eliminar-catalogo');

            if (btnActualizar) {
                const tipo = btnActualizar.dataset.tipo;
                const id = btnActualizar.dataset.id;
                const descripcion = btnActualizar.dataset.descripcion || '';
                const descripcion2 = btnActualizar.dataset.descripcion2 || '';

                switch (tipo) {
                    case 'escalafon':
                        await actualizarEscalafon(id, descripcion);
                        break;
                    case 'renglon':
                        await actualizarRenglon(id, descripcion);
                        break;
                    case 'materia':
                        await actualizarMateria(id, descripcion, descripcion2);
                        break;
                    case 'ambito':
                        await actualizarAmbito(id, descripcion, descripcion2);
                        break;
                    default:
                        break;
                }
            }

            if (btnEliminar) {
                const tipo = btnEliminar.dataset.tipo;
                const id = btnEliminar.dataset.id;
                const descripcion = btnEliminar.dataset.descripcion || '';

                switch (tipo) {
                    case 'escalafon':
                        await eliminarEscalafon(id, descripcion);
                        break;
                    case 'renglon':
                        await eliminarRenglon(id, descripcion);
                        break;
                    case 'materia':
                        await eliminarMateria(id, descripcion);
                        break;
                    case 'ambito':
                        await eliminarAmbito(id, descripcion);
                        break;
                    default:
                        break;
                }
            }
        });
    }

    // =========================================================
    // Botones crear
    // =========================================================
    function initBotonesCrear() {
        btnCrearEscalafon?.addEventListener('click', async () => {
            await crearEscalafon();
        });

        btnCrearRenglon?.addEventListener('click', async () => {
            await crearRenglon();
        });

        btnCrearAmbito?.addEventListener('click', async () => {
            await crearAmbito();
        });

        btnCrearMateria?.addEventListener('click', async () => {
            await crearMateria();
        });
    }

    // =========================================================
    // Bootstrap
    // =========================================================
    document.addEventListener('DOMContentLoaded', async () => {
        initToggleTablas();
        initAccionesCatalogo();
        initBotonesCrear();
        initMateriasPorGradoEventos();

        await Promise.all([
            cargarCatalogosPanel(),
            cargarMateriasPorGrado()
        ]);
    });

})();