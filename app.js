/* Control de visitas - cliente estático para GitHub Pages + Supabase */

const CONFIG = window.SUPABASE_CONFIG || {};
const SUPABASE_URL = String(CONFIG.url || '').replace(/\/$/, '');
const SUPABASE_KEY = String(CONFIG.publishableKey || '');
const SESSION_KEY = 'control_visitas_session';

function configured() {
    return SUPABASE_URL.startsWith('https://') &&
        SUPABASE_URL.includes('.supabase.co') &&
        SUPABASE_KEY &&
        !SUPABASE_URL.includes('TU-PROYECTO') &&
        !SUPABASE_KEY.includes('TU-PUBLISHABLE-KEY');
}

function internalEmail(username) {
    const usuario = String(username).trim().toLowerCase();

    if (usuario === "mauri") {
        return "mauriciomartinezz168@gmail.com";
    }

    return `${usuario}@control-visitas.local`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function showMessage(type, message, target = '#mensajes') {
    const el = document.querySelector(target);
    if (!el) return;

    el.innerHTML =
        `<div class="${type}">${escapeHtml(message)}</div>`;
}

function clearMessage(target = '#mensajes') {
    const el = document.querySelector(target);

    if (el) {
        el.innerHTML = '';
    }
}

function getStoredSession() {
    try {
        return JSON.parse(
            localStorage.getItem(SESSION_KEY) || 'null'
        );
    } catch {
        return null;
    }
}

function saveSession(session) {
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function authHeaders(token) {
    return token
        ? {
            Authorization: `Bearer ${token}`
        }
        : {};
}

async function rawFetch(url, options = {}) {
    return fetch(url, {
        ...options,

        headers: {
            apikey: SUPABASE_KEY,

            ...(options.body
                ? {
                    'Content-Type':
                        'application/json'
                }
                : {}),

            ...(options.headers || {})
        }
    });
}

async function refreshSession() {
    const session = getStoredSession();

    if (!session?.refresh_token) {
        return null;
    }

    const response = await rawFetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
        {
            method: 'POST',

            body: JSON.stringify({
                refresh_token:
                    session.refresh_token
            })
        }
    );

    if (!response.ok) {
        clearSession();
        return null;
    }

    const data = await response.json();

    const next = {
        access_token:
            data.access_token,

        refresh_token:
            data.refresh_token ||
            session.refresh_token,

        expires_at:
            Date.now() +
            ((data.expires_in || 3600) * 1000) -
            30000,

        user:
            data.user ||
            session.user
    };

    saveSession(next);

    return next;
}

async function getSession() {
    let session = getStoredSession();

    if (!session?.access_token) {
        return null;
    }

    if (
        session.expires_at &&
        Date.now() >= session.expires_at
    ) {
        session = await refreshSession();

        if (!session) {
            return null;
        }
    }

    return session;
}

async function api(path, options = {}, retry = true) {

    if (!configured()) {
        throw new Error(
            'Configurá primero supabase-config.js.'
        );
    }

    const session = await getSession();

    const headers = {
        ...(options.headers || {})
    };

    if (session?.access_token) {
        headers.Authorization =
            `Bearer ${session.access_token}`;
    }

    const response = await rawFetch(
        `${SUPABASE_URL}${path}`,
        {
            ...options,
            headers
        }
    );

    if (
        response.status === 401 &&
        retry &&
        session?.refresh_token
    ) {
        const refreshed =
            await refreshSession();

        if (refreshed) {
            return api(
                path,
                options,
                false
            );
        }
    }

    const text =
        await response.text();

    let data = null;

    try {
        data =
            text
                ? JSON.parse(text)
                : null;
    } catch {
        data = text;
    }

    if (!response.ok) {

        const message =
            data?.message ||
            data?.error_description ||
            data?.error ||
            data?.hint ||
            `Error HTTP ${response.status}`;

        const error =
            new Error(message);

        error.status =
            response.status;

        error.data =
            data;

        throw error;
    }

    return data;
}

/* =========================
   LOGIN
========================= */

async function signIn(username, password) {

    const usuario =
        String(username)
            .trim()
            .toLowerCase();

    if (!/^[a-z0-9._-]{3,50}$/.test(usuario)) {
        throw new Error(
            'Usuario inválido.'
        );
    }

    const email =
        internalEmail(usuario);

    const response =
        await rawFetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
                method: 'POST',

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

    const data =
        await response
            .json()
            .catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.error_description ||
            data.msg ||
            'Usuario o contraseña incorrectos.'
        );
    }

    saveSession({
        access_token:
            data.access_token,

        refresh_token:
            data.refresh_token,

        expires_at:
            Date.now() +
            ((data.expires_in || 3600) * 1000) -
            30000,

        user:
            data.user
    });

    const admins =
        await api(
            `/rest/v1/administradores?id=eq.${encodeURIComponent(
                data.user.id
            )}&select=id,usuario&limit=1`
        );

    if (!admins?.length) {

        clearSession();

        throw new Error(
            'La cuenta existe, pero no está registrada como administrador.'
        );
    }

    return admins[0];
}

async function signOut() {

    const session =
        await getSession();

    if (session?.access_token) {

        await rawFetch(
            `${SUPABASE_URL}/auth/v1/logout`,
            {
                method: 'POST',

                headers: {
                    Authorization:
                        `Bearer ${session.access_token}`
                }
            }
        ).catch(() => {});
    }

    clearSession();
}

async function requireAdmin() {

    const session =
        await getSession();

    if (!session) {

        window.location.href =
            'login.html';

        return null;
    }

    try {

        const admins =
            await api(
                `/rest/v1/administradores?id=eq.${encodeURIComponent(
                    session.user.id
                )}&select=id,usuario&limit=1`
            );

        if (!admins?.length) {

            await signOut();

            window.location.href =
                'login.html';

            return null;
        }

        return {
            session,
            admin: admins[0]
        };

    } catch {

        await signOut();

        window.location.href =
            'login.html';

        return null;
    }
}

/* =========================
   FECHA ARGENTINA
========================= */

function formatArgentina(value) {

    if (!value) {
        return '-';
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat(
        'es-AR',
        {
            timeZone:
                'America/Argentina/Buenos_Aires',

            day: '2-digit',
            month: '2-digit',
            year: 'numeric',

            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',

            hour12: false
        }
    )
        .format(date)
        .replace(',', '');
}

/* =========================
   VALIDACIONES
========================= */

function validarDni(dni) {

    const value =
        String(dni).trim();

    if (!value) {
        throw new Error(
            'Ingresá un DNI.'
        );
    }

    if (!/^[0-9]+$/.test(value)) {
        throw new Error(
            'El DNI solo puede contener números.'
        );
    }

    if (value.length > 20) {
        throw new Error(
            'El DNI es demasiado largo.'
        );
    }

    return value;
}

function validarNombre(nombre) {

    const value =
        String(nombre).trim();

    if (!value) {
        throw new Error(
            'Ingresá el nombre y apellido.'
        );
    }

    if (
        !/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(value)
    ) {
        throw new Error(
            'El nombre solo puede contener letras y espacios.'
        );
    }

    if (value.length > 100) {
        throw new Error(
            'El nombre es demasiado largo.'
        );
    }

    return value;
}

/* =========================
   VISITAS
========================= */

async function consultarDni(dni) {

    const value =
        validarDni(dni);

    const rows =
        await api(
            '/rest/v1/rpc/consultar_visita',
            {
                method: 'POST',

                body: JSON.stringify({
                    p_dni: value
                })
            }
        );

    return rows?.[0] || null;
}

async function obtenerVisitas() {

    return await api(
        '/rest/v1/visitas?select=id,dni,nombre,fecha_visita&order=fecha_visita.desc'
    );
}

async function registrarVisita(dni, nombre) {

    const valueDni =
        validarDni(dni);

    const valueNombre =
        validarNombre(nombre);

    return await api(
        '/rest/v1/visitas',
        {
            method: 'POST',

            headers: {
                Prefer:
                    'return=representation'
            },

            body: JSON.stringify({
                dni: valueDni,
                nombre: valueNombre
            })
        }
    );
}

/* =========================
   EDITAR VISITA
========================= */

async function editarVisita(id, dni, nombre) {

    if (!id) {
        throw new Error(
            'No se encontró el ID de la visita.'
        );
    }

    const valueDni =
        validarDni(dni);

    const valueNombre =
        validarNombre(nombre);

    return await api(
        `/rest/v1/visitas?id=eq.${encodeURIComponent(id)}`,
        {
            method: 'PATCH',

            headers: {
                Prefer:
                    'return=representation'
            },

            body: JSON.stringify({
                dni: valueDni,
                nombre: valueNombre
            })
        }
    );
}

/* =========================
   ADMINISTRADORES
========================= */

async function obtenerAdministradores() {

    return await api(
        '/rest/v1/administradores?select=id,usuario,created_at&order=created_at.asc'
    );
}

async function callFunction(name, body) {

    return await api(
        `/functions/v1/${name}`,
        {
            method: 'POST',

            body:
                JSON.stringify(
                    body || {}
                )
        }
    );
}

async function crearAdministrador(
    usuario,
    password
) {

    return callFunction(
        'swift-processor',
        {
            usuario,
            password
        }
    );
}

async function eliminarAdministrador(id) {

    return callFunction(
        'admin-delete',
        {
            id
        }
    );
}

function requireConfigOrShow() {

    if (!configured()) {

        showMessage(
            'error',
            'Falta configurar Supabase. Abrí supabase-config.js y colocá la URL y Publishable Key de tu proyecto.'
        );

        return false;
    }

    return true;
}

/* =========================
   INDEX
========================= */

async function initIndex() {

    if (!requireConfigOrShow()) {
        return;
    }

    const session =
        await getSession();

    const status =
        document.querySelector(
            '#estado-sesion'
        );

    if (!status || !session) {
        return;
    }

    try {

        const admins =
            await api(
                `/rest/v1/administradores?id=eq.${encodeURIComponent(
                    session.user.id
                )}&select=usuario&limit=1`
            );

        if (admins?.length) {

            document
                .querySelectorAll(
                    '[data-solo-invitado]'
                )
                .forEach(
                    el => el.hidden = false
                );

            const text =
                document.querySelector(
                    '#usuario-sesion'
                );

            if (text) {
                text.textContent =
                    admins[0].usuario;
            }

            status.hidden = false;
        }

    } catch {}
}

/* =========================
   LOGIN
========================= */

function initLogin() {

    const form =
        document.querySelector(
            '#login-form'
        );

    if (
        !form ||
        !requireConfigOrShow()
    ) {
        return;
    }

    form.addEventListener(
        'submit',
        async (event) => {

            event.preventDefault();

            clearMessage();

            const usuario =
                form.usuario.value;

            const password =
                form.password.value;

            const button =
                form.querySelector(
                    'button[type="submit"]'
                );

            button.disabled = true;

            button.textContent =
                'Ingresando...';

            try {

                await signIn(
                    usuario,
                    password
                );

                window.location.href =
                    'panel.html';

            } catch (error) {

                showMessage(
                    'error',
                    error.message ||
                    'No se pudo iniciar sesión.'
                );

                button.disabled =
                    false;

                button.textContent =
                    '🔐 Iniciar sesión';
            }
        }
    );
}

/* =========================
   INVITADO
========================= */

function initInvitado() {

    const form =
        document.querySelector(
            '#consulta-form'
        );

    const result =
        document.querySelector(
            '#resultado'
        );

    if (
        !form ||
        !requireConfigOrShow()
    ) {
        return;
    }

    form.addEventListener(
        'submit',
        async (event) => {

            event.preventDefault();

            clearMessage();

            result.innerHTML = '';

            const dni =
                form.dni.value.trim();

            const button =
                form.querySelector(
                    'button[type="submit"]'
                );

            button.disabled = true;

            button.textContent =
                'Consultando...';

            try {

                const row =
                    await consultarDni(dni);

                if (row) {

                    result.innerHTML = `
                        <div class="resultado ya-vino">

                            <h2>🔴 ASISTIÓ</h2>

                            <p>
                                <strong>Nombre:</strong>
                                ${escapeHtml(row.nombre)}
                            </p>

                            <p>
                                <strong>DNI:</strong>
                                ${escapeHtml(row.dni)}
                            </p>

                            <p>
                                <strong>Fecha y hora:</strong>
                                ${escapeHtml(
                                    formatArgentina(
                                        row.fecha_visita
                                    )
                                )}
                            </p>

                        </div>
                    `;

                } else {

                    result.innerHTML = `
                        <div class="resultado no-vino">

                            <h2>🟢 NO ASISTIÓ</h2>

                            <p>
                                El DNI
                                <strong>
                                    ${escapeHtml(dni)}
                                </strong>
                                no tiene una visita registrada.
                            </p>

                        </div>
                    `;
                }

            } catch (error) {

                showMessage(
                    'error',
                    error.message ||
                    'No se pudo realizar la consulta.'
                );

            } finally {

                button.disabled = false;

                button.textContent =
                    '🔎 Consultar DNI';
            }
        }
    );
}

/* =========================
   PANEL
========================= */

async function initPanel() {

    if (!requireConfigOrShow()) {
        return;
    }

    const access =
        await requireAdmin();

    if (!access) return;

    const { admin } =
        access;

    const user =
        document.querySelector(
            '#usuario-panel'
        );

    if (user) {
        user.textContent =
            admin.usuario;
    }

    const list =
        document.querySelector(
            '#tabla-visitas'
        );

    const searchForm =
        document.querySelector(
            '#buscar-form'
        );

    const searchResult =
        document.querySelector(
            '#resultado-busqueda'
        );

    const registerForm =
        document.querySelector(
            '#registrar-form'
        );

    const registrarSeccion =
        document.querySelector(
            '#registrar-seccion'
        );

    const count =
        document.querySelector(
            '#cantidad-visitas'
        );

    const logout =
        document.querySelector(
            '#logout'
        );

    if (
        !searchForm ||
        !searchResult ||
        !registerForm ||
        !registrarSeccion
    ) {

        console.error(
            'Faltan elementos del formulario de visitas en panel.html.'
        );

        return;
    }

    registrarSeccion.hidden =
        true;

    registrarSeccion.classList.add(
        'seccion-oculta'
    );

    registrarSeccion.style.display =
        'none';

    if (logout) {

        logout.addEventListener(
            'click',
            async (e) => {

                e.preventDefault();

                await signOut();

                window.location.href =
                    'index.html';
            }
        );
    }

    async function loadVisits() {

        try {

            const rows =
                await obtenerVisitas();

            if (count) {

                count.textContent =
                    rows.length;
            }

            if (list) {

                list.innerHTML =
                    rows.length

                        ? rows.map(row => `
                            <tr>

                                <td>
                                    ${escapeHtml(row.dni)}
                                </td>

                                <td>
                                    ${escapeHtml(row.nombre)}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        formatArgentina(
                                            row.fecha_visita
                                        )
                                    )}
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        class="boton-editar btn-editar-visita"
                                        data-id="${escapeHtml(row.id)}"
                                        data-dni="${escapeHtml(row.dni)}"
                                        data-nombre="${escapeHtml(row.nombre)}"
                                    >
                                        ✏️ Editar
                                    </button>

                                </td>

                            </tr>
                        `).join('')

                        : `
                            <tr>
                                <td colspan="4">
                                    No hay visitas registradas.
                                </td>
                            </tr>
                        `;

                list
                    .querySelectorAll(
                        '.btn-editar-visita'
                    )
                    .forEach(button => {

                        button.addEventListener(
                            'click',
                            () => {

                                mostrarEditorVisita(
                                    button.dataset.id,
                                    button.dataset.dni,
                                    button.dataset.nombre
                                );
                            }
                        );
                    });
            }

        } catch (error) {

            showMessage(
                'error',
                error.message ||
                'No se pudieron cargar las visitas.'
            );
        }
    }

    function mostrarEditorVisita(
        id,
        dni,
        nombre
    ) {

        const existente =
            document.querySelector(
                '#editor-visita'
            );

        if (existente) {
            existente.remove();
        }

        const editor =
            document.createElement(
                'div'
            );

        editor.id =
            'editor-visita';

        editor.className =
            'resultado';

        editor.innerHTML = `

            <h2>✏️ Editar visita</h2>

            <p>
                Modificá los datos de la visita.
            </p>

            <form id="form-editar-visita">

                <input
                    type="hidden"
                    id="editar-id"
                    value="${escapeHtml(id)}"
                >

                <label for="editar-dni">
                    DNI:
                </label>

                <input
                    type="text"
                    id="editar-dni"
                    value="${escapeHtml(dni)}"
                    maxlength="20"
                    inputmode="numeric"
                    pattern="[0-9]+"
                    required
                >

                <label for="editar-nombre">
                    Nombre y apellido:
                </label>

                <input
                    type="text"
                    id="editar-nombre"
                    value="${escapeHtml(nombre)}"
                    maxlength="100"
                    pattern="[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+"
                    required
                >

                <div style="margin-top:15px;">

                    <button
                        type="submit"
                        class="boton-editar"
                    >
                        💾 Guardar cambios
                    </button>

                    <button
                        type="button"
                        id="cancelar-edicion"
                        class="boton-navegacion"
                    >
                        ❌ Cancelar
                    </button>

                </div>

            </form>
        `;

        const panel =
            document.querySelector(
                '.contenedor.grande'
            );

        if (panel) {

            panel.insertBefore(
                editor,
                panel.querySelector('hr')
            );
        }

        const form =
            editor.querySelector(
                '#form-editar-visita'
            );

        const dniInput =
            editor.querySelector(
                '#editar-dni'
            );

        const nombreInput =
            editor.querySelector(
                '#editar-nombre'
            );

        const cancelar =
            editor.querySelector(
                '#cancelar-edicion'
            );

        dniInput.addEventListener(
            'input',
            () => {

                dniInput.value =
                    dniInput.value.replace(
                        /[^0-9]/g,
                        ''
                    );
            }
        );

        nombreInput.addEventListener(
            'input',
            () => {

                nombreInput.value =
                    nombreInput.value.replace(
                        /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü ]/g,
                        ''
                    );
            }
        );

        cancelar.addEventListener(
            'click',
            () => {

                editor.remove();
            }
        );

        form.addEventListener(
            'submit',
            async (event) => {

                event.preventDefault();

                const button =
                    form.querySelector(
                        'button[type="submit"]'
                    );

                try {

                    const nuevoDni =
                        validarDni(
                            dniInput.value
                        );

                    const nuevoNombre =
                        validarNombre(
                            nombreInput.value
                        );

                    button.disabled =
                        true;

                    button.textContent =
                        'Guardando...';

                    await editarVisita(
                        id,
                        nuevoDni,
                        nuevoNombre
                    );

                    editor.remove();

                    showMessage(
                        'exito',
                        'La visita fue actualizada correctamente.'
                    );

                    await loadVisits();

                } catch (error) {

                    const msg =
                        error.status === 409 ||
                        error.data?.code === '23505'

                            ? 'Ese DNI ya tiene una visita registrada.'

                            : (
                                error.message ||
                                'No se pudo actualizar la visita.'
                            );

                    showMessage(
                        'error',
                        msg
                    );

                    button.disabled =
                        false;

                    button.textContent =
                        '💾 Guardar cambios';
                }
            }
        );

        editor.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        dniInput.focus();
    }

    searchForm.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            clearMessage();

            searchResult.innerHTML =
                '';

            registrarSeccion.hidden =
                true;

            registrarSeccion.classList.add(
                'seccion-oculta'
            );

            registrarSeccion.style.display =
                'none';

            const dni =
                searchForm.dni.value.trim();

            try {

                const row =
                    await consultarDni(dni);

                if (row) {

                    searchResult.innerHTML = `
                        <div class="resultado ya-vino">

                            <h2>🔴 ASISTIÓ</h2>

                            <p>
                                <strong>Nombre:</strong>
                                ${escapeHtml(row.nombre)}
                            </p>

                            <p>
                                <strong>DNI:</strong>
                                ${escapeHtml(row.dni)}
                            </p>

                            <p>
                                <strong>Fecha y hora:</strong>
                                ${escapeHtml(
                                    formatArgentina(
                                        row.fecha_visita
                                    )
                                )}
                            </p>

                        </div>
                    `;

                    return;
                }

                searchResult.innerHTML = `
                    <div class="resultado no-vino">

                        <h2>🟢 NO ASISTIÓ</h2>

                        <p>
                            El DNI
                            <strong>
                                ${escapeHtml(dni)}
                            </strong>
                            no tiene una visita registrada.
                        </p>

                        <p>
                            ⚠️ Para continuar,
                            <strong>
                                tenés que registrar la visita.
                            </strong>
                        </p>

                    </div>
                `;

                registerForm.dni.value =
                    dni;

                registerForm.nombre.value =
                    '';

                registrarSeccion.hidden =
                    false;

                registrarSeccion.classList.remove(
                    'seccion-oculta'
                );

                registrarSeccion.style.removeProperty(
                    'display'
                );

                registrarSeccion.style.display =
                    'block';

                setTimeout(() => {

                    registrarSeccion.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });

                    registerForm.nombre.focus();

                }, 100);

            } catch (error) {

                showMessage(
                    'error',
                    error.message ||
                    'No se pudo buscar el DNI.'
                );
            }
        }
    );

    registerForm.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            clearMessage();

            const dni =
                registerForm.dni.value.trim();

            const nombre =
                registerForm.nombre.value.trim();

            try {

                validarDni(dni);
                validarNombre(nombre);

            } catch (error) {

                showMessage(
                    'error',
                    error.message
                );

                return;
            }

            const button =
                registerForm.querySelector(
                    'button[type="submit"]'
                );

            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    'Registrando...';
            }

            try {

                await registrarVisita(
                    dni,
                    nombre
                );

                searchResult.innerHTML = `
                    <div class="resultado exito">

                        <h2>
                            ✅ ¡ASISTENCIA REGISTRADA CON ÉXITO!
                        </h2>

                        <p>
                            La asistencia fue registrada correctamente.
                        </p>

                        <p>
                            <strong>Nombre:</strong>
                            ${escapeHtml(nombre)}
                        </p>

                        <p>
                            <strong>DNI:</strong>
                            ${escapeHtml(dni)}
                        </p>

                        <p>
                            <strong>Fecha y hora:</strong>
                            ${escapeHtml(
                                formatArgentina(
                                    new Date().toISOString()
                                )
                            )}
                        </p>

                    </div>
                `;

                registerForm.reset();

                registrarSeccion.hidden =
                    true;

                registrarSeccion.classList.add(
                    'seccion-oculta'
                );

                registrarSeccion.style.display =
                    'none';

                await loadVisits();

            } catch (error) {

                const msg =
                    error.status === 409 ||
                    error.data?.code === '23505'

                        ? 'Ese DNI ya tiene una visita registrada.'

                        : (
                            error.message ||
                            'No se pudo registrar la visita.'
                        );

                showMessage(
                    'error',
                    msg
                );

            } finally {

                if (button) {

                    button.disabled =
                        false;

                    button.textContent =
                        '✅ Registrar visita';
                }
            }
        }
    );

    await loadVisits();
}

/* =========================
   ADMINISTRADORES
========================= */

async function initAdministradores() {

    if (!requireConfigOrShow()) {
        return;
    }

    const access =
        await requireAdmin();

    if (!access) return;

    const currentId =
        access.session.user.id;

    const table =
        document.querySelector(
            '#tabla-admins'
        );

    const form =
        document.querySelector(
            '#crear-admin-form'
        );

    const logout =
        document.querySelector(
            '#logout'
        );

    if (logout) {

        logout.addEventListener(
            'click',
            async (e) => {

                e.preventDefault();

                await signOut();

                window.location.href =
                    'index.html';
            }
        );
    }

    async function loadAdmins() {

        const admins =
            await obtenerAdministradores();

        table.innerHTML =
            admins.map(admin => `
                <tr>

                    <td>

                        ${escapeHtml(admin.usuario)}

                        ${
                            admin.id === currentId
                                ? '<strong>(Vos)</strong>'
                                : ''
                        }

                    </td>

                    <td>

                        ${
                            admin.id === currentId

                                ? '<span class="accion-no-disponible">Usuario actual</span>'

                                : `
                                    <button
                                        class="boton-eliminar btn-eliminar"
                                        data-id="${escapeHtml(admin.id)}"
                                        data-usuario="${escapeHtml(admin.usuario)}"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                `
                        }

                    </td>

                </tr>
            `).join('');

        table
            .querySelectorAll(
                '.btn-eliminar'
            )
            .forEach(button => {

                button.addEventListener(
                    'click',
                    async () => {

                        if (
                            !confirm(
                                `¿Seguro que querés eliminar al administrador ${button.dataset.usuario}?`
                            )
                        ) {
                            return;
                        }

                        button.disabled =
                            true;

                        try {

                            await eliminarAdministrador(
                                button.dataset.id
                            );

                            showMessage(
                                'exito',
                                'Administrador eliminado correctamente.'
                            );

                            await loadAdmins();

                        } catch (error) {

                            showMessage(
                                'error',
                                error.message ||
                                'No se pudo eliminar el administrador.'
                            );

                            button.disabled =
                                false;
                        }
                    }
                );
            });
    }

    form.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            clearMessage();

            if (
                form.password.value !==
                form.password2.value
            ) {

                showMessage(
                    'error',
                    'Las contraseñas no coinciden.'
                );

                return;
            }

            if (
                form.password.value.length < 6
            ) {

                showMessage(
                    'error',
                    'La contraseña debe tener al menos 6 caracteres.'
                );

                return;
            }

            const button =
                form.querySelector(
                    'button'
                );

            button.disabled =
                true;

            try {

                await crearAdministrador(
                    form.usuario.value,
                    form.password.value
                );

                showMessage(
                    'exito',
                    'Administrador creado correctamente.'
                );

                form.reset();

                await loadAdmins();

            } catch (error) {

                showMessage(
                    'error',
                    error.message ||
                    'No se pudo crear el administrador.'
                );

            } finally {

                button.disabled =
                    false;
            }
        }
    );

    try {

        await loadAdmins();

    } catch (error) {

        showMessage(
            'error',
            error.message ||
            'No se pudieron cargar los administradores.'
        );
    }
}

/* =========================
   EXPORTAR CSV
========================= */

async function initExportar() {

    if (!requireConfigOrShow()) {
        return;
    }

    const access =
        await requireAdmin();

    if (!access) return;

    const rows =
        await obtenerVisitas();

    const csvRows = [
        [
            'DNI',
            'Nombre',
            'Fecha',
            'Hora'
        ]
    ];

    rows.forEach(row => {

        const date =
            new Date(
                row.fecha_visita
            );

        const fecha =
            new Intl.DateTimeFormat(
                'es-AR',
                {
                    timeZone:
                        'America/Argentina/Buenos_Aires',

                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }
            ).format(date);

        const hora =
            new Intl.DateTimeFormat(
                'es-AR',
                {
                    timeZone:
                        'America/Argentina/Buenos_Aires',

                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',

                    hour12: false
                }
            ).format(date);

        csvRows.push([
            row.dni,
            row.nombre,
            fecha,
            hora
        ]);
    });

    const csv =
        '\ufeff' +
        csvRows
            .map(
                cols =>
                    cols
                        .map(
                            v =>
                                `"${String(v ?? '').replaceAll('"', '""')}"`
                        )
                        .join(';')
            )
            .join('\r\n');

    const blob =
        new Blob(
            [csv],
            {
                type:
                    'text/csv;charset=utf-8;'
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement('a');

    a.href = url;

    a.download =
        `visitas_${new Date().toISOString().slice(0,19).replaceAll(':','-')}.csv`;

    a.click();

    URL.revokeObjectURL(url);
}
