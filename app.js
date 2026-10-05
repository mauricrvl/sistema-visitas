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
        access_token: data.access_token,

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

function validarSeEntrego(valor) {

    const value =
        String(valor ?? '').trim();

    if (value.length > 200) {
        throw new Error(
            'El campo "Se entregó" es demasiado largo.'
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
        '/rest/v1/visitas?select=id,dni,nombre,se_entrego,fecha_visita&order=fecha_visita.desc'
    );
}

async function registrarVisita(
    dni,
    nombre,
    seEntrego
) {

    const valueDni =
        validarDni(dni);

    const valueNombre =
        validarNombre(nombre);

    const valueSeEntrego =
        validarSeEntrego(seEntrego);

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
                nombre: valueNombre,
                se_entrego: valueSeEntrego
            })
        }
    );
}

async function editarVisita(
    id,
    dni,
    nombre,
    seEntrego
) {

    if (!id) {
        throw new Error(
            'No se encontró el ID de la visita.'
        );
    }

    const valueDni =
        validarDni(dni);

    const valueNombre =
        validarNombre(nombre);

    const valueSeEntrego =
        validarSeEntrego(seEntrego);

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
                nombre: valueNombre,
                se_entrego: valueSeEntrego
            })
        }
    );
}

async function eliminarVisita(id) {

    if (!id) {
        throw new Error(
            'No se encontró el ID de la visita.'
        );
    }

    return await api(
        `/rest/v1/visitas?id=eq.${encodeURIComponent(id)}`,
        {
            method: 'DELETE',

            headers: {
                Prefer:
                    'return=representation'
            }
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
    /* =========================
   RECUPERAR CONTRASEÑA
========================= */

async function enviarRecuperacion(
    usuario
) {

    const value =
        String(usuario)
            .trim()
            .toLowerCase();

    if (!value) {
        throw new Error(
            'Ingresá tu usuario.'
        );
    }

    const email =
        internalEmail(value);

    const response =
        await rawFetch(
            `${SUPABASE_URL}/auth/v1/recover`,
            {
                method: 'POST',

                body: JSON.stringify({
                    email
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
            'No se pudo enviar el correo de recuperación.'
        );
    }

    return true;
}

function initRecuperarPassword() {

    const form =
        document.querySelector(
            '#recuperar-form'
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        'submit',
        async event => {

            event.preventDefault();

            clearMessage();

            const usuario =
                form.usuario.value;

            const button =
                form.querySelector(
                    'button[type="submit"]'
                );

            button.disabled = true;

            button.textContent =
                'Enviando...';

            try {

                await enviarRecuperacion(
                    usuario
                );

                showMessage(
                    'exito',
                    'Si el usuario existe, se envió el correo para recuperar la contraseña.'
                );

                form.reset();

            } catch (error) {

                showMessage(
                    'error',
                    error.message ||
                    'No se pudo enviar el correo.'
                );

            } finally {

                button.disabled =
                    false;

                button.textContent =
                    '📧 Recuperar contraseña';
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
            '#buscar-dni-form'
        );

    if (!form) {
        return;
    }

    const resultado =
        document.querySelector(
            '#resultado-visita'
        );

    form.addEventListener(
        'submit',
        async event => {

            event.preventDefault();

            if (resultado) {
                resultado.innerHTML =
                    '<div>Buscando...</div>';
            }

            try {

                const dni =
                    validarDni(
                        form.dni.value
                    );

                const visita =
                    await consultarDni(
                        dni
                    );

                if (!visita) {

                    if (resultado) {
                        resultado.innerHTML =
                            '<div class="error">No se encontró una visita registrada para ese DNI.</div>';
                    }

                    return;
                }

                if (resultado) {

                    resultado.innerHTML = `
                        <div class="resultado-visita">

                            <h2>
                                Visita encontrada
                            </h2>

                            <p>
                                <strong>DNI:</strong>
                                ${escapeHtml(
                                    visita.dni
                                )}
                            </p>

                            <p>
                                <strong>Nombre:</strong>
                                ${escapeHtml(
                                    visita.nombre
                                )}
                            </p>

                            ${
                                visita.se_entrego
                                    ? `
                                        <p>
                                            <strong>Se entregó:</strong>
                                            ${escapeHtml(
                                                visita.se_entrego
                                            )}
                                        </p>
                                    `
                                    : ''
                            }

                            <p>
                                <strong>Fecha y hora:</strong>
                                ${escapeHtml(
                                    formatArgentina(
                                        visita.fecha_visita
                                    )
                                )}
                            </p>

                        </div>
                    `;
                }

            } catch (error) {

                if (resultado) {

                    resultado.innerHTML =
                        `<div class="error">${escapeHtml(
                            error.message ||
                            'No se pudo realizar la búsqueda.'
                        )}</div>`;
                }
            }
        }
    );
}

/* =========================
   PANEL
========================= */

async function initPanel() {

    const auth =
        await requireAdmin();

    if (!auth) {
        return;
    }

    const admin =
        auth.admin;

    document
        .querySelectorAll(
            '[data-usuario-admin]'
        )
        .forEach(
            element => {
                element.textContent =
                    admin.usuario;
            }
        );

    const logoutButtons =
        document.querySelectorAll(
            '[data-logout]'
        );

    logoutButtons.forEach(
        button => {

            button.addEventListener(
                'click',
                async () => {

                    await signOut();

                    window.location.href =
                        'login.html';
                }
            );
        }
    );

    const searchForm =
        document.querySelector(
            '#buscar-visita-form'
        );

    const searchInput =
        document.querySelector(
            '#buscar-dni'
        );

    const searchResult =
        document.querySelector(
            '#resultado-busqueda'
        );

    if (
        searchForm &&
        searchInput
    ) {

        searchForm.addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                if (searchResult) {
                    searchResult.innerHTML =
                        '<div>Buscando...</div>';
                }

                try {

                    const dni =
                        validarDni(
                            searchInput.value
                        );

                    const visita =
                        await consultarDni(
                            dni
                        );

                    if (!visita) {

                        if (searchResult) {
                            searchResult.innerHTML =
                                '<div class="error">No se encontró ninguna visita con ese DNI.</div>';
                        }

                        return;
                    }

                    if (searchResult) {

                        searchResult.innerHTML = `
                            <div class="resultado-visita">

                                <p>
                                    <strong>DNI:</strong>
                                    ${escapeHtml(
                                        visita.dni
                                    )}
                                </p>

                                <p>
                                    <strong>Nombre:</strong>
                                    ${escapeHtml(
                                        visita.nombre
                                    )}
                                </p>

                                ${
                                    visita.se_entrego
                                        ? `
                                            <p>
                                                <strong>Se entregó:</strong>
                                                ${escapeHtml(
                                                    visita.se_entrego
                                                )}
                                            </p>
                                        `
                                        : ''
                                }

                                <p>
                                    <strong>Fecha y hora:</strong>
                                    ${escapeHtml(
                                        formatArgentina(
                                            visita.fecha_visita
                                        )
                                    )}
                                </p>

                            </div>
                        `;
                    }

                } catch (error) {

                    if (searchResult) {
                        searchResult.innerHTML =
                            `<div class="error">${escapeHtml(
                                error.message ||
                                'No se pudo realizar la búsqueda.'
                            )}</div>`;
                    }
                }
            }
        );
    }

    const formRegistro =
        document.querySelector(
            '#registro-visita-form'
        );

    if (formRegistro) {

        formRegistro.addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const button =
                    formRegistro.querySelector(
                        'button[type="submit"]'
                    );

                const mensaje =
                    document.querySelector(
                        '#mensaje-registro'
                    );

                if (mensaje) {
                    mensaje.innerHTML =
                        '';
                }

                button.disabled =
                    true;

                button.textContent =
                    'Registrando...';

                try {

                    const dni =
                        validarDni(
                            formRegistro.dni.value
                        );

                    const nombre =
                        validarNombre(
                            formRegistro.nombre.value
                        );

                    const seEntrego =
                        validarSeEntrego(
                            formRegistro.se_entrego?.value ||
                            ''
                        );

                    const existente =
                        await consultarDni(
                            dni
                        );

                    if (existente) {

                        throw new Error(
                            'Ya existe una visita registrada con ese DNI.'
                        );
                    }

                    await registrarVisita(
                        dni,
                        nombre,
                        seEntrego
                    );

                    if (mensaje) {

                        mensaje.innerHTML =
                            '<div class="exito">Visita registrada correctamente.</div>';
                    }

                    formRegistro.reset();

                    await loadVisits();

                } catch (error) {

                    if (mensaje) {

                        mensaje.innerHTML =
                            `<div class="error">${escapeHtml(
                                error.message ||
                                'No se pudo registrar la visita.'
                            )}</div>`;
                    }

                } finally {

                    button.disabled =
                        false;

                    button.textContent =
                        '➕ Registrar visita';
                }
            }
        );
    }

    const btnActualizar =
        document.querySelector(
            '#btn-actualizar'
        );

    if (btnActualizar) {

        btnActualizar.addEventListener(
            'click',
            async () => {

                await loadVisits();
            }
        );
    }

    /* =========================
       IMPORTAR EXCEL
    ========================= */

    function convertirFechaExcel(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ''
        ) {
            return null;
        }

        let fecha = null;

        if (valor instanceof Date) {

            fecha = valor;

        } else if (
            typeof valor === 'number'
        ) {

            const excelEpoch =
                new Date(
                    Date.UTC(
                        1899,
                        11,
                        30
                    )
                );

            fecha =
                new Date(
                    excelEpoch.getTime() +
                    valor * 86400000
                );

        } else {

            const texto =
                String(valor).trim();

            const partes =
                texto.split('/');

            if (
                partes.length === 3
            ) {

                const dia =
                    parseInt(
                        partes[0],
                        10
                    );

                const mes =
                    parseInt(
                        partes[1],
                        10
                    );

                const anio =
                    parseInt(
                        partes[2],
                        10
                    );

                if (
                    Number.isInteger(dia) &&
                    Number.isInteger(mes) &&
                    Number.isInteger(anio)
                ) {

                    fecha =
                        new Date(
                            anio,
                            mes - 1,
                            dia,
                            12,
                            0,
                            0
                        );
                }
            }

            if (!fecha) {
                fecha =
                    new Date(texto);
            }
        }

        if (
            !fecha ||
            Number.isNaN(
                fecha.getTime()
            )
        ) {
            return null;
        }

        const anio =
            fecha.getFullYear();

        const mes =
            String(
                fecha.getMonth() + 1
            ).padStart(
                2,
                '0'
            );

        const dia =
            String(
                fecha.getDate()
            ).padStart(
                2,
                '0'
            );

        return `${anio}-${mes}-${dia}T12:00:00-03:00`;
    }

    function obtenerDniNormalizado(
        valor
    ) {

        return String(
            valor ?? ''
        )
            .trim()
            .replace(
                /\D/g,
                ''
            );
    }

    async function obtenerDnisExistentes(
        dnis
    ) {

        const existentes =
            new Set();

        const unicos = [
            ...new Set(
                dnis
                    .map(
                        obtenerDniNormalizado
                    )
                    .filter(Boolean)
            )
        ];

        const TAMANO_LOTE =
            50;

        for (
            let i = 0;
            i < unicos.length;
            i += TAMANO_LOTE
        ) {

            const lote =
                unicos.slice(
                    i,
                    i + TAMANO_LOTE
                );

            if (!lote.length) {
                continue;
            }

            const filtro =
                lote.join(',');

            const rows =
                await api(
                    `/rest/v1/visitas?select=dni&dni=in.(${filtro})`
                );

            (
                rows || []
            ).forEach(
                row => {

                    const dni =
                        obtenerDniNormalizado(
                            row.dni
                        );

                    if (dni) {
                        existentes.add(
                            dni
                        );
                    }
                }
            );
        }

        return existentes;
    }
        const archivoExcel =
        document.querySelector(
            '#archivo-excel'
        );

    const btnImportarExcel =
        document.querySelector(
            '#btn-importar-excel'
        );

    const resultadoImportacion =
        document.querySelector(
            '#resultado-importacion'
        );

    if (
        archivoExcel &&
        btnImportarExcel
    ) {

        btnImportarExcel.addEventListener(
            'click',
            async () => {

                if (
                    !archivoExcel.files.length
                ) {

                    if (
                        resultadoImportacion
                    ) {

                        resultadoImportacion.innerHTML =
                            '<div class="error">Seleccioná un archivo Excel.</div>';
                    }

                    return;
                }

                if (
                    typeof XLSX ===
                    'undefined'
                ) {

                    if (
                        resultadoImportacion
                    ) {

                        resultadoImportacion.innerHTML =
                            '<div class="error">No se pudo cargar el lector de Excel. Revisá la conexión a Internet.</div>';
                    }

                    return;
                }

                const archivo =
                    archivoExcel.files[0];

                btnImportarExcel.disabled =
                    true;

                btnImportarExcel.textContent =
                    'Importando...';

                if (
                    resultadoImportacion
                ) {

                    resultadoImportacion.innerHTML =
                        '<div>Procesando el Excel...</div>';
                }

                try {

                    const buffer =
                        await archivo.arrayBuffer();

                    const workbook =
                        XLSX.read(
                            buffer,
                            {
                                type: 'array',
                                cellDates: true
                            }
                        );

                    const primeraHoja =
                        workbook.Sheets[
                            workbook.SheetNames[0]
                        ];

                    if (!primeraHoja) {

                        throw new Error(
                            'El Excel no contiene ninguna hoja.'
                        );
                    }

                    const filas =
                        XLSX.utils.sheet_to_json(
                            primeraHoja,
                            {
                                defval: '',
                                raw: true
                            }
                        );

                    if (!filas.length) {

                        throw new Error(
                            'El Excel está vacío.'
                        );
                    }

                    const primeraFila =
                        filas[0];

                    const claves =
                        Object.keys(
                            primeraFila
                        );

                    function buscarColumna(
                        nombre
                    ) {

                        const objetivo =
                            String(nombre)
                                .trim()
                                .toUpperCase();

                        return claves.find(
                            clave =>
                                String(clave)
                                    .trim()
                                    .toUpperCase() ===
                                objetivo
                        );
                    }

                    const columnaDni =
                        buscarColumna(
                            'DNI'
                        );

                    const columnaNombre =
                        buscarColumna(
                            'NOMBRE Y APELLIDO'
                        );

                    const columnaBeneficio =
                        buscarColumna(
                            'BENEFICIO'
                        );

                    const columnaFecha =
                        buscarColumna(
                            'FECHA'
                        );

                    if (
                        !columnaDni ||
                        !columnaNombre ||
                        !columnaBeneficio ||
                        !columnaFecha
                    ) {

                        throw new Error(
                            'El Excel debe tener las columnas FECHA, NOMBRE Y APELLIDO, DNI y BENEFICIO.'
                        );
                    }

                    const registros = [];

                    const dnisExcel =
                        new Set();

                    let sinDni = 0;

                    let fechasInvalidas =
                        0;

                    let duplicadosExcel =
                        0;

                    filas.forEach(
                        fila => {

                            const dni =
                                obtenerDniNormalizado(
                                    fila[
                                        columnaDni
                                    ]
                                );

                            if (!dni) {

                                sinDni++;

                                return;
                            }

                            if (
                                dnisExcel.has(
                                    dni
                                )
                            ) {

                                duplicadosExcel++;

                                return;
                            }

                            const fecha =
                                convertirFechaExcel(
                                    fila[
                                        columnaFecha
                                    ]
                                );

                            if (!fecha) {

                                fechasInvalidas++;

                                return;
                            }

                            const nombre =
                                String(
                                    fila[
                                        columnaNombre
                                    ] ?? ''
                                ).trim();

                            const beneficio =
                                String(
                                    fila[
                                        columnaBeneficio
                                    ] ?? ''
                                ).trim();

                            dnisExcel.add(
                                dni
                            );

                            registros.push({
                                dni,
                                nombre,
                                se_entrego:
                                    beneficio,
                                fecha_visita:
                                    fecha
                            });
                        }
                    );

                    /*
                     * PRIMERA PROTECCIÓN:
                     * buscamos en Supabase todos
                     * los DNI que ya existen.
                     */

                    const dnisExistentes =
                        await obtenerDnisExistentes(
                            registros.map(
                                registro =>
                                    registro.dni
                            )
                        );

                    /*
                     * Solamente dejamos los DNI
                     * que todavía NO existen.
                     */

                    const nuevos =
                        registros.filter(
                            registro =>
                                !dnisExistentes.has(
                                    registro.dni
                                )
                        );

                    let importados =
                        0;

                    const TAMANO_LOTE =
                        50;

                    /*
                     * Insertamos en lotes de 50.
                     */

                    for (
                        let i = 0;
                        i < nuevos.length;
                        i += TAMANO_LOTE
                    ) {

                        const lote =
                            nuevos.slice(
                                i,
                                i + TAMANO_LOTE
                            );

                        await api(
                            '/rest/v1/visitas',
                            {
                                method: 'POST',

                                headers: {
                                    Prefer:
                                        'resolution=ignore-duplicates,return=minimal'
                                },

                                body:
                                    JSON.stringify(
                                        lote
                                    )
                            }
                        );

                        importados +=
                            lote.length;
                    }

                    const yaExistian =
                        registros.filter(
                            registro =>
                                dnisExistentes.has(
                                    registro.dni
                                )
                        ).length;

                    if (
                        resultadoImportacion
                    ) {

                        resultadoImportacion.innerHTML = `
                            <div class="exito">

                                <strong>
                                    Importación terminada.
                                </strong>

                                <br><br>

                                Nuevos importados:
                                ${importados}

                                <br>

                                DNI que ya existían en Supabase:
                                ${yaExistian}

                                <br>

                                DNI repetidos dentro del Excel:
                                ${duplicadosExcel}

                                <br>

                                Filas sin DNI:
                                ${sinDni}

                                <br>

                                Fechas inválidas:
                                ${fechasInvalidas}

                            </div>
                        `;
                    }

                    /*
                     * Limpiamos el selector
                     * del archivo.
                     */

                    archivoExcel.value =
                        '';

                    /*
                     * Actualizamos la tabla.
                     */

                    await loadVisits();

                } catch (error) {

                    if (
                        resultadoImportacion
                    ) {

                        resultadoImportacion.innerHTML = `
                            <div class="error">
                                ${escapeHtml(
                                    error.message ||
                                    'No se pudo importar el Excel.'
                                )}
                            </div>
                        `;
                    }

                } finally {

                    btnImportarExcel.disabled =
                        false;

                    btnImportarExcel.textContent =
                        '📥 Importar Excel';
                }
            }
        );
    }

    await loadVisits();
}

/* =========================
   CARGAR VISITAS
========================= */

async function loadVisits() {

    const list =
        document.querySelector(
            '#lista-visitas'
        );

    if (!list) {
        return;
    }

    try {

        const rows =
            await obtenerVisitas();

        list.innerHTML =
            rows.length
                ? rows.map(
                    row => `
                        <tr>

                            <td>
                                ${escapeHtml(
                                    row.dni
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    row.nombre
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    row.se_entrego ||
                                    '-'
                                )}
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

                                    data-id="${escapeHtml(
                                        row.id
                                    )}"

                                    data-dni="${escapeHtml(
                                        row.dni
                                    )}"

                                    data-nombre="${escapeHtml(
                                        row.nombre
                                    )}"

                                    data-se-entrego="${escapeHtml(
                                        row.se_entrego ||
                                        ''
                                    )}"
                                >
                                    ✏️ Editar
                                </button>

                            </td>

                        </tr>
                    `
                ).join('')

                : `
                    <tr>
                        <td colspan="5">
                            No hay visitas registradas.
                        </td>
                    </tr>
                `;

        list
            .querySelectorAll(
                '.btn-editar-visita'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        'click',
                        () => {

                            mostrarEditorVisita(
                                button.dataset.id,
                                button.dataset.dni,
                                button.dataset.nombre,
                                button.dataset.seEntrego
                            );
                        }
                    );
                }
            );

    } catch (error) {

        list.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="error">
                        ${escapeHtml(
                            error.message ||
                            'No se pudieron cargar las visitas.'
                        )}
                    </div>
                </td>
            </tr>
        `;
    }
}

/* =========================
   EDITAR VISITA
========================= */

function mostrarEditorVisita(
    id,
    dni,
    nombre,
    seEntrego
) {

    const contenedor =
        document.querySelector(
            '#editor-visita'
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <div class="editor-visita">

            <h3>
                ✏️ Editar visita
            </h3>

            <label for="editar-dni">
                DNI:
            </label>

            <input
                type="text"
                id="editar-dni"
                value="${escapeHtml(
                    dni
                )}"
                maxlength="20"
            >

            <label for="editar-nombre">
                Nombre y apellido:
            </label>

            <input
                type="text"
                id="editar-nombre"
                value="${escapeHtml(
                    nombre
                )}"
                maxlength="100"
            >

            <label for="editar-se-entrego">
                Se entregó:
            </label>

            <input
                type="text"
                id="editar-se-entrego"
                value="${escapeHtml(
                    seEntrego || ''
                )}"
                maxlength="200"
                placeholder="Ingrese lo que se entrego"
            >

            <div class="editor-botones">

                <button
                    type="button"
                    id="guardar-edicion"
                >
                    💾 Guardar
                </button>

                <button
                    type="button"
                    id="cancelar-edicion"
                >
                    ❌ Cancelar
                </button>

            </div>

            <div
                id="mensaje-edicion"
            ></div>

        </div>
    `;

    const guardar =
        document.querySelector(
            '#guardar-edicion'
        );

    const cancelar =
        document.querySelector(
            '#cancelar-edicion'
        );

    if (cancelar) {

        cancelar.addEventListener(
            'click',
            () => {

                contenedor.innerHTML =
                    '';
            }
        );
    }

    if (guardar) {

        guardar.addEventListener(
            'click',
            async () => {

                const mensaje =
                    document.querySelector(
                        '#mensaje-edicion'
                    );

                guardar.disabled =
                    true;

                guardar.textContent =
                    'Guardando...';

                try {

                    const nuevoDni =
                        validarDni(
                            document.querySelector(
                                '#editar-dni'
                            ).value
                        );

                    const nuevoNombre =
                        validarNombre(
                            document.querySelector(
                                '#editar-nombre'
                            ).value
                        );

                    const nuevoSeEntrego =
                        validarSeEntrego(
                            document.querySelector(
                                '#editar-se-entrego'
                            ).value
                        );

                    await editarVisita(
                        id,
                        nuevoDni,
                        nuevoNombre,
                        nuevoSeEntrego
                    );

                    if (mensaje) {

                        mensaje.innerHTML =
                            '<div class="exito">Visita actualizada correctamente.</div>';
                    }

                    await loadVisits();

                    setTimeout(
                        () => {

                            contenedor.innerHTML =
                                '';

                        },
                        800
                    );

                } catch (error) {

                    if (mensaje) {

                        mensaje.innerHTML =
                            `<div class="error">${escapeHtml(
                                error.message ||
                                'No se pudo actualizar la visita.'
                            )}</div>`;
                    }

                    guardar.disabled =
                        false;

                    guardar.textContent =
                        '💾 Guardar';
                }
            }
        );
    }
}

/* =========================
   BUSCAR VISITAS EN PANEL
========================= */

function initBusquedaPanel() {

    const form =
        document.querySelector(
            '#buscar-dni-form'
        );

    if (!form) {
        return;
    }

    const resultado =
        document.querySelector(
            '#resultado-busqueda'
        );

    form.addEventListener(
        'submit',
        async event => {

            event.preventDefault();

            try {

                const dni =
                    validarDni(
                        form.dni.value
                    );

                const visita =
                    await consultarDni(
                        dni
                    );

                if (!visita) {

                    if (resultado) {

                        resultado.innerHTML =
                            '<div class="error">No se encontró ninguna visita con ese DNI.</div>';
                    }

                    return;
                }

                if (resultado) {

                    resultado.innerHTML = `
                        <div class="resultado-visita">

                            <h3>
                                Visita encontrada
                            </h3>

                            <p>
                                <strong>DNI:</strong>
                                ${escapeHtml(
                                    visita.dni
                                )}
                            </p>

                            <p>
                                <strong>Nombre:</strong>
                                ${escapeHtml(
                                    visita.nombre
                                )}
                            </p>

                            ${
                                visita.se_entrego
                                    ? `
                                        <p>
                                            <strong>Se entregó:</strong>
                                            ${escapeHtml(
                                                visita.se_entrego
                                            )}
                                        </p>
                                    `
                                    : ''
                            }

                            <p>
                                <strong>Fecha y hora:</strong>
                                ${escapeHtml(
                                    formatArgentina(
                                        visita.fecha_visita
                                    )
                                )}
                            </p>

                        </div>
                    `;
                }

            } catch (error) {

                if (resultado) {

                    resultado.innerHTML =
                        `<div class="error">${escapeHtml(
                            error.message ||
                            'No se pudo realizar la búsqueda.'
                        )}</div>`;
                }
            }
        }
    );
}

/* =========================
   ADMINISTRADORES
========================= */

async function loadAdministradores() {

    const list =
        document.querySelector(
            '#lista-administradores'
        );

    if (!list) {
        return;
    }

    try {

        const rows =
            await obtenerAdministradores();

        list.innerHTML =
            rows.length
                ? rows.map(
                    row => `
                        <tr>

                            <td>
                                ${escapeHtml(
                                    row.usuario
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    formatArgentina(
                                        row.created_at
                                    )
                                )}
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="boton-eliminar-admin"
                                    data-id="${escapeHtml(
                                        row.id
                                    )}"
                                >
                                    🗑️ Eliminar
                                </button>

                            </td>

                        </tr>
                    `
                ).join('')

                : `
                    <tr>
                        <td colspan="3">
                            No hay administradores.
                        </td>
                    </tr>
                `;

        list
            .querySelectorAll(
                '.boton-eliminar-admin'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        'click',
                        async () => {

                            const confirmar =
                                confirm(
                                    '¿Seguro que querés eliminar este administrador?'
                                );

                            if (!confirmar) {
                                return;
                            }

                            button.disabled =
                                true;

                            try {

                                await eliminarAdministrador(
                                    button.dataset.id
                                );

                                await loadAdministradores();

                            } catch (error) {

                                alert(
                                    error.message ||
                                    'No se pudo eliminar el administrador.'
                                );

                                button.disabled =
                                    false;
                            }
                        }
                    );
                }
            );

    } catch (error) {

        list.innerHTML = `
            <tr>
                <td colspan="3">
                    <div class="error">
                        ${escapeHtml(
                            error.message ||
                            'No se pudieron cargar los administradores.'
                        )}
                    </div>
                </td>
            </tr>
        `;
    }
}

async function initAdministradores() {

    const auth =
        await requireAdmin();

    if (!auth) {
        return;
    }

    const form =
        document.querySelector(
            '#crear-admin-form'
        );

    if (form) {

        form.addEventListener(
            'submit',
            async event => {

                event.preventDefault();

                const usuario =
                    String(
                        form.usuario.value
                    )
                        .trim()
                        .toLowerCase();

                const password =
                    String(
                        form.password.value
                    );

                const confirmar =
                    String(
                        form.confirmar_password?.value ||
                        ''
                    );

                const mensaje =
                    document.querySelector(
                        '#mensaje-admin'
                    );

                const button =
                    form.querySelector(
                        'button[type="submit"]'
                    );

                if (
                    password !==
                    confirmar
                ) {

                    if (mensaje) {

                        mensaje.innerHTML =
                            '<div class="error">Las contraseñas no coinciden.</div>';
                    }

                    return;
                }

                button.disabled =
                    true;

                button.textContent =
                    'Creando...';

                try {

                    await crearAdministrador(
                        usuario,
                        password
                    );

                    if (mensaje) {

                        mensaje.innerHTML =
                            '<div class="exito">Administrador creado correctamente.</div>';
                    }

                    form.reset();

                    await loadAdministradores();

                } catch (error) {

                    if (mensaje) {

                        mensaje.innerHTML =
                            `<div class="error">${escapeHtml(
                                error.message ||
                                'No se pudo crear el administrador.'
                            )}</div>`;
                    }

                } finally {

                    button.disabled =
                        false;

                    button.textContent =
                        '➕ Crear administrador';
                }
            }
        );
    }

    await loadAdministradores();
}

/* =========================
   EXPORTAR CSV
========================= */

function escaparCsv(valor) {

    const texto =
        String(valor ?? '');

    return `"${texto.replaceAll(
        '"',
        '""'
    )}"`;
}

async function exportarVisitasCSV() {

    const rows =
        await obtenerVisitas();

    const encabezado = [
        'DNI',
        'Nombre',
        'Se entregó',
        'Fecha',
        'Hora'
    ];

    const lineas = [
        encabezado.map(
            escaparCsv
        ).join(';')
    ];

    rows.forEach(
        row => {

            const fecha =
                row.fecha_visita
                    ? new Date(
                        row.fecha_visita
                    )
                    : null;

            let fechaTexto =
                '';

            let horaTexto =
                '';

            if (
                fecha &&
                !Number.isNaN(
                    fecha.getTime()
                )
            ) {

                fechaTexto =
                    new Intl.DateTimeFormat(
                        'es-AR',
                        {
                            timeZone:
                                'America/Argentina/Buenos_Aires',

                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }
                    ).format(fecha);

                horaTexto =
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
                    ).format(fecha);
            }

            lineas.push(
                [
                    row.dni,
                    row.nombre,
                    row.se_entrego || '',
                    fechaTexto,
                    horaTexto
                ]
                    .map(escaparCsv)
                    .join(';')
            );
        }
    );

    const blob =
        new Blob(
            [
                '\uFEFF' +
                lineas.join('\r\n')
            ],
            {
                type:
                    'text/csv;charset=utf-8;'
            }
        );

    const url =
        URL.createObjectURL(blob);

    const enlace =
        document.createElement(
            'a'
        );

    enlace.href =
        url;

    enlace.download =
        `visitas-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

    document.body.appendChild(
        enlace
    );

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(
        url
    );
}

/* =========================
   INIT GENERAL
========================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const pagina =
            document.body?.dataset?.pagina ||
            '';

        if (
            pagina === 'login' ||
            document.querySelector(
                '#login-form'
            )
        ) {
            initLogin();
        }

        if (
            pagina === 'recuperar' ||
            document.querySelector(
                '#recuperar-form'
            )
        ) {
            initRecuperarPassword();
        }

        if (
            pagina === 'invitado' ||
            document.querySelector(
                '#buscar-dni-form'
            )
        ) {
            initInvitado();
        }

        if (
            pagina === 'administradores' ||
            document.querySelector(
                '#crear-admin-form'
            )
        ) {
            initAdministradores();
        }

        if (
            pagina === 'index'
        ) {
            initIndex();
        }
    }
);
