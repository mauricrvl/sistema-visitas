/* Control de visitas - cliente estático para GitHub Pages + Supabase */

const CONFIG = window.SUPABASE_CONFIG || {};
const SUPABASE_URL = String(CONFIG.url || '').replace(/\/$/, '');
const SUPABASE_KEY = String(CONFIG.publishableKey || '');
const SESSION_KEY = 'control_visitas_session';
const PRISET_DNIS = new Set([
    '04435370',
    '04524843',
    '05112562',
    '05112593',
    '05576575',
    '05680813',
    '05680857',
    '05680884',
    '05680996',
    '05940668',
    '06360130',
    '06360170',
    '06360174',
    '07934699',
    '07943409',
    '07943441',
    '07949151',
    '08073623',
    '08140759',
    '08563429',
    '08665066',
    '08667861',
    '10031755',
    '10340496',
    '10393440',
    '10592505',
    '10646138',
    '10646158',
    '10652721',
    '10652734',
    '10652751',
    '10812274',
    '11006914',
    '11006952',
    '11006956',
    '11093096',
    '11106764',
    '11333086',
    '11367333',
    '11760023',
    '11760087',
    '11805118',
    '12143326',
    '12143327',
    '12156304',
    '12156305',
    '12156400',
    '12305282',
    '12305295',
    '12305311',
    '12305336',
    '12305390',
    '12389099',
    '12541498',
    '12893641',
    '13061700',
    '13105611',
    '13105733',
    '13294728',
    '13335821',
    '13335983',
    '13446024',
    '13585012',
    '13585075',
    '13585097',
    '13585101',
    '13585116',
    '13585173',
    '13585174',
    '13585178',
    '13585333',
    '13585376',
    '13917439',
    '14186143',
    '14248246',
    '14248267',
    '14248314',
    '14248320',
    '14248326',
    '14248413',
    '14397962',
    '16427861',
    '16516688',
    '16642148',
    '17153007',
    '17153097',
    '17209801',
    '17209812',
    '17209823',
    '17313593',
    '17325649',
    '17426307',
    '17548404',
    '17548442',
    '17631157',
    '17779512',
    '17779537',
    '17828269',
    '17828298',
    '17832571',
    '17832587',
    '17923558',
    '18013196',
    '18077623',
    '18207816',
    '18233404',
    '18233440',
    '18233467',
    '18233481',
    '18269208',
    '18343009',
    '18380307',
    '18380311',
    '18406204',
    '18406226',
    '18406234',
    '18455493',
    '18504359',
    '18527273',
    '18595376',
    '18675229',
    '18690367',
    '18788177',
    '20133122',
    '20133189',
    '20133352',
    '20309514',
    '20480016',
    '20480041',
    '20530596',
    '20634408',
    '20634428',
    '20634496',
    '20634606',
    '20802732',
    '21100136',
    '21100144',
    '21166089',
    '21166090',
    '21166107',
    '21182204',
    '21182232',
    '21182233',
    '21182254',
    '21182332',
    '21360096',
    '21360835',
    '21564283',
    '21667356',
    '21667371',
    '21935509',
    '22041576',
    '22291400',
    '22359741',
    '22396097',
    '22597631',
    '22597648',
    '22597663',
    '22690851',
    '22690880',
    '22904309',
    '22904343',
    '23016984',
    '23071361',
    '23488444',
    '23498117',
    '23634394',
    '23688238',
    '23733239',
    '23752104',
    '23752161',
    '23791622',
    '23791698',
    '23791719',
    '23791787',
    '23798980',
    '23977383',
    '23982682',
    '24026497',
    '24331235',
    '24331477',
    '24362596',
    '24688901',
    '24688940',
    '24735027',
    '24735075',
    '24735259',
    '24735330',
    '24972580',
    '25135049',
    '25135148',
    '25135344',
    '25135426',
    '25319898',
    '25462336',
    '25573539',
    '25590330',
    '25590448',
    '25728532',
    '25780751',
    '25991618',
    '25991687',
    '25991795',
    '25991931',
    '26135951',
    '26204741',
    '26248570',
    '26248572',
    '26360077',
    '26360329',
    '26580597',
    '26593156',
    '26611265',
    '26611307',
    '26791562',
    '26878170',
    '26878211',
    '26878750',
    '26930841',
    '27041357',
    '27075171',
    '27125924',
    '27196174',
    '27227133',
    '27560278',
    '27617237',
    '27682779',
    '27686416',
    '27760002',
    '27760468',
    '27760490',
    '27760928',
    '27766763',
    '28005536',
    '28258443',
    '28308014',
    '28308137',
    '28741214',
    '28744657',
    '28888753',
    '28888794',
    '28928254',
    '29034522',
    '29034534',
    '29079559',
    '29226418',
    '29226487',
    '29270209',
    '29270276',
    '29276339',
    '29507633',
    '29588251',
    '29613330',
    '29613352',
    '29613365',
    '29613383',
    '29690752',
    '29694499',
    '29702427',
    '29702496',
    '30052494',
    '30116790',
    '30151519',
    '30243565',
    '30271126',
    '30274127',
    '30274153',
    '30274199',
    '30274267',
    '30274274',
    '30274282',
    '30621339',
    '30621341',
    '30621343',
    '30621373',
    '30621398',
    '30621422',
    '30621450',
    '30621473',
    '30768544',
    '30768569',
    '31085727',
    '31098542',
    '31278229',
    '31324283',
    '31399137',
    '31399176',
    '31399189',
    '31430409',
    '31633650',
    '31778916',
    '31778929',
    '31778936',
    '31778990',
    '31979315',
    '31979337',
    '31979341',
    '31979345',
    '31979641',
    '31979664',
    '32210578',
    '32215012',
    '32215016',
    '32215063',
    '32215092',
    '32215244',
    '32307893',
    '32723509',
    '32723581',
    '32782460',
    '32878018',
    '33059496',
    '33185699',
    '33236962',
    '33319088',
    '33321913',
    '33321993',
    '33322006',
    '33322043',
    '33322150',
    '33322159',
    '33322163',
    '33429692',
    '33460628',
    '33460695',
    '33460703',
    '33460731',
    '33460734',
    '33672430',
    '33679970',
    '34096588',
    '34194452',
    '34428315',
    '34428337',
    '34428356',
    '34428376',
    '34428396',
    '34697043',
    '34698357',
    '34698398',
    '34916882',
    '35023577',
    '35023604',
    '35185006',
    '35509100',
    '35735401',
    '35735407',
    '35735461',
    '35735465',
    '35735470',
    '35735529',
    '35735913',
    '35849035',
    '35849079',
    '35849102',
    '35849156',
    '35849164',
    '35849191',
    '35849497',
    '35850208',
    '35850423',
    '35850478',
    '35850528',
    '35850546',
    '35850548',
    '35850590',
    '35852057',
    '35852787',
    '35857010',
    '35857051',
    '35857086',
    '35857123',
    '35857160',
    '35857164',
    '35857172',
    '35938213',
    '36253880',
    '36253884',
    '36253887',
    '36253890',
    '36253895',
    '36675601',
    '37647117',
    '37647153',
    '37647165',
    '37648686',
    '37924451',
    '37924453',
    '37924483',
    '37924514',
    '37924528',
    '37924591',
    '37925144',
    '38076225',
    '38077392',
    '38079005',
    '38079016',
    '38219472',
    '38411219',
    '38462492',
    '38463141',
    '38463746',
    '38463833',
    '38463844',
    '38507916',
    '38595189',
    '39007869',
    '39424425',
    '39425395',
    '39425721',
    '39425766',
    '39425769',
    '39425786',
    '39651315',
    '39651386',
    '39792773',
    '39792788',
    '39793307',
    '39956055',
    '39956143',
    '39956401',
    '39994201',
    '39994270',
    '39994292',
    '39995224',
    '40229128',
    '40265754',
    '40367724',
    '40470827',
    '40470922',
    '40470936',
    '40470990',
    '40591991',
    '40592144',
    '40592173',
    '40593018',
    '40728869',
    '40766089',
    '41053852',
    '41054328',
    '41270532',
    '41270536',
    '41321763',
    '41531703',
    '41531742',
    '41598346',
    '41701442',
    '41701450',
    '41721012',
    '41721411',
    '41814467',
    '41909054',
    '41909055',
    '41957732',
    '42081076',
    '42081100',
    '42207238',
    '42207248',
    '42250081',
    '42250089',
    '42287978',
    '42334874',
    '42712160',
    '42751169',
    '42852922',
    '42853300',
    '42990429',
    '42990450',
    '43078785',
    '43157561',
    '43280858',
    '43281007',
    '43375954',
    '43375955',
    '43423185',
    '43423192',
    '43423198',
    '43488902',
    '43488907',
    '43488927',
    '43489289',
    '43556314',
    '43638238',
    '43641806',
    '43688916',
    '43690014',
    '43952936',
    '44018328',
    '44018753',
    '44018756',
    '44018774',
    '44018775',
    '44018827',
    '44060960',
    '44060962',
    '44062416',
    '44248541',
    '44249648',
    '44316522',
    '44665729',
    '44844833',
    '44915636',
    '44916912',
    '44991063',
    '45212673',
    '45212681',
    '45377854',
    '45472239',
    '45472714',
    '45635009',
    '45635027',
    '45980909',
    '45980962',
    '46259959',
    '46485335',
    '46485350',
    '46544003',
    '46725734',
    '46804294',
    '46805817',
    '46933148',
    '46933150',
    '47046540',
    '48595739',
    '4879618',
    '49351739',
    '5680905',
    '6360140'
]);

function normalizarDniPriset(dni) {
    return String(dni ?? '').trim().replace(/\D/g, '');
}

function esPersonaPriset(dni) {
    const valor = normalizarDniPriset(dni);
    return valor !== '' && PRISET_DNIS.has(valor);
}


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

function validarLocalidad(valor) {

    const value = String(valor ?? '').trim();

    if (value.length > 150) {
        throw new Error('La localidad es demasiado larga.');
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

    const rows = await api(
        '/rest/v1/visitas?select=id,dni,nombre,localidad,se_entrego,fecha_visita&order=fecha_visita.desc.nullslast'
    );

    return (rows || []).sort((a, b) => {
        if (!a.fecha_visita && !b.fecha_visita) return 0;
        if (!a.fecha_visita) return 1;
        if (!b.fecha_visita) return -1;
        return new Date(b.fecha_visita) - new Date(a.fecha_visita);
    });
}

function asistenciaVigente(fechaVisita) {

    if (!fechaVisita) return false;

    const fecha = new Date(fechaVisita);

    if (Number.isNaN(fecha.getTime())) return false;

    const vencimiento = new Date(
        fecha.getFullYear(),
        fecha.getMonth() + 1,
        fecha.getDate(),
        fecha.getHours(),
        fecha.getMinutes(),
        fecha.getSeconds()
    );

    return new Date() < vencimiento;
}

async function guardarHistorialVisita(
    dni,
    nombre,
    seEntrego,
    fechaRegistro = new Date().toISOString()
) {

    return await api(
        '/rest/v1/historial_visitas',
        {
            method: 'POST',
            headers: {
                Prefer: 'return=representation'
            },
            body: JSON.stringify({
                dni: String(dni),
                nombre: String(nombre),
                se_entrego: seEntrego || null,
                fecha_registro: fechaRegistro
            })
        }
    );
}

async function registrarVisita(
    dni,
    nombre,
    localidad,
    seEntrego
) {

    const valueDni =
        validarDni(dni);

    const valueNombre =
        validarNombre(nombre);

    const valueLocalidad =
        validarLocalidad(localidad);

    const valueSeEntrego =
        validarSeEntrego(seEntrego);

    const existentes = await api(
        `/rest/v1/visitas?select=id,dni,nombre,cuil,fecha_visita&dni=eq.${encodeURIComponent(valueDni)}&limit=1`
    );

    const ahora = new Date().toISOString();

    if (existentes?.length) {

        const existente = existentes[0];

        if (existente.fecha_visita && asistenciaVigente(existente.fecha_visita)) {
            throw new Error(
                'Ese DNI ya tiene una visita registrada.'
            );
        }

        const actualizada = await api(
            `/rest/v1/visitas?id=eq.${encodeURIComponent(existente.id)}`,
            {
                method: 'PATCH',
                headers: {
                    Prefer: 'return=representation'
                },
                body: JSON.stringify({
                    nombre: valueNombre,
                    localidad: valueLocalidad,
                    se_entrego: valueSeEntrego,
                    fecha_visita: ahora
                })
            }
        );

        await guardarHistorialVisita(
            valueDni,
            valueNombre,
            valueSeEntrego,
            ahora
        );

        return actualizada;
    }

    const nueva = await api(
        '/rest/v1/visitas',
        {
            method: 'POST',
            headers: {
                Prefer: 'return=representation'
            },
            body: JSON.stringify({
                dni: valueDni,
                nombre: valueNombre,
                localidad: valueLocalidad,
                se_entrego: valueSeEntrego,
                fecha_visita: ahora
            })
        }
    );

    await guardarHistorialVisita(
        valueDni,
        valueNombre,
        valueSeEntrego,
        ahora
    );

    return nueva;
}

function normalizarEntrega(texto) {

    let valor = String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim()
        .replace(/\s+/g, ' ');

    if (!valor) return 'SIN ESPECIFICAR';

    const cantidad = valor.match(/^(\d+)\s+/);
    const numero = cantidad ? Number(cantidad[1]) : 1;
    const base = valor.replace(/^\d+\s+/, '');

    if (/GAS.*15\s*KG|GAS.*15KG|GAS DE 15/.test(base)) {
        return { nombre: 'GAS 15 KG', cantidad: numero };
    }

    if (/GAS.*10\s*KG|GAS.*10KG|GAS DE 10/.test(base)) {
        return { nombre: 'GAS 10 KG', cantidad: numero };
    }

    if (/BOLSON/.test(base)) {
        return { nombre: 'BOLSON', cantidad: numero };
    }

    if (/MODULO/.test(base)) {
        return { nombre: 'MODULO', cantidad: numero };
    }

    if (/LECHE/.test(base)) {
        return { nombre: 'LECHE', cantidad: numero };
    }

    if (/PUERTA/.test(base)) {
        return { nombre: 'PUERTA', cantidad: numero };
    }

    const importe = base.match(/(20|30|35|80)\s*MIL/);
    if (importe && /ORDEN|AYUDA/.test(base)) {
        const tipo = /AYUDA/.test(base) ? 'AYUDA ECONOMICA' : 'ORDEN DE COMPRA';
        return { nombre: `${tipo} ${importe[1]} MIL`, cantidad: numero };
    }

    if (/MERCADERIA/.test(base)) {
        return { nombre: 'MERCADERIA', cantidad: numero };
    }

    return { nombre: base, cantidad: numero };
}

function separarEntregas(texto) {
    return String(texto || '')
        .split('+')
        .map(parte => parte.trim())
        .filter(Boolean);
}

function fechaArgentinaISO(dia) {
    const partes = String(dia || '').split('-').map(Number);
    if (partes.length !== 3 || partes.some(Number.isNaN)) return null;
    return `${String(partes[0]).padStart(4, '0')}-${String(partes[1]).padStart(2, '0')}-${String(partes[2]).padStart(2, '0')}`;
}

async function obtenerHistorialDia(dia) {
    const fecha = fechaArgentinaISO(dia);
    if (!fecha) throw new Error('Seleccioná una fecha válida.');

    const inicio = `${fecha}T00:00:00-03:00`;
    const fin = `${fecha}T23:59:59.999-03:00`;

    return await api(
        `/rest/v1/visitas?select=id,dni,nombre,localidad,se_entrego,fecha_visita&fecha_visita=gte.${encodeURIComponent(inicio)}&fecha_visita=lte.${encodeURIComponent(fin)}&order=fecha_visita.asc`
    );
}

function csvEscape(valor) {
    const texto = String(valor ?? '');
    return `"${texto.replace(/"/g, '""')}"`;
}

function descargarArchivo(nombre, contenido, tipo = 'text/csv;charset=utf-8') {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
}

async function importarHistorialCSV(archivo) {

    if (!archivo) throw new Error('Seleccioná el archivo CSV.');

    const texto = await archivo.text();
    const lineas = texto.split(/\r?\n/).filter(linea => linea.trim());

    if (!lineas.length) throw new Error('El CSV está vacío.');

    const parseCSVLinea = linea => {
        const resultado = [];
        let actual = '';
        let comillas = false;
        for (let i = 0; i < linea.length; i++) {
            const caracter = linea[i];
            if (caracter === '"') {
                if (comillas && linea[i + 1] === '"') {
                    actual += '"';
                    i++;
                } else {
                    comillas = !comillas;
                }
            } else if (caracter === ';' && !comillas) {
                resultado.push(actual.trim());
                actual = '';
            } else {
                actual += caracter;
            }
        }
        resultado.push(actual.trim());
        return resultado;
    };

    const encabezados = parseCSVLinea(lineas[0]).map(normalizarEncabezadoExcel);
    const indice = nombre => encabezados.indexOf(normalizarEncabezadoExcel(nombre));

    const iDni = indice('DNI');
    const iNombre = indice('NOMBRE');
    const iEntrega = indice('SE ENTREGO');
    const iFecha = indice('FECHA');
    const iHora = indice('HORA');

    if (iDni < 0 || iNombre < 0 || iEntrega < 0 || iFecha < 0 || iHora < 0) {
        throw new Error('El CSV debe tener las columnas DNI, Nombre, Se entregó, Fecha y Hora.');
    }

    const registros = [];

    for (let i = 1; i < lineas.length; i++) {
        const columnas = parseCSVLinea(lineas[i]);
        const dni = String(columnas[iDni] || '').replace(/\D/g, '');
        const nombre = String(columnas[iNombre] || '').trim();
        const entrega = String(columnas[iEntrega] || '').trim();
        const fecha = String(columnas[iFecha] || '').trim();
        const hora = String(columnas[iHora] || '').trim();

        if (!dni || !nombre || !fecha || !hora) continue;

        const partes = fecha.split('/');
        if (partes.length !== 3) continue;

        const iso = `${partes[2]}-${String(partes[1]).padStart(2, '0')}-${String(partes[0]).padStart(2, '0')}T${hora}-03:00`;

        if (Number.isNaN(new Date(iso).getTime())) continue;

        registros.push({
            dni,
            nombre,
            se_entrego: entrega || null,
            fecha_registro: iso
        });
    }

    const existentes = await api(
        '/rest/v1/historial_visitas?select=dni,fecha_registro&limit=10000'
    );

    const clavesExistentes = new Set(
        (existentes || []).map(row => `${row.dni}|${row.fecha_registro}`)
    );

    const nuevos = registros.filter(row => {
        const clave = `${row.dni}|${row.fecha_registro}`;
        if (clavesExistentes.has(clave)) return false;
        clavesExistentes.add(clave);
        return true;
    });

    let importados = 0;

    for (let i = 0; i < nuevos.length; i += 100) {
        const bloque = nuevos.slice(i, i + 100);
        await api('/rest/v1/historial_visitas', {
            method: 'POST',
            headers: {
                Prefer: 'return=minimal'
            },
            body: JSON.stringify(bloque)
        });
        importados += bloque.length;
    }

    return {
        importados,
        repetidos: registros.length - nuevos.length,
        omitidos: lineas.length - 1 - registros.length
    };
}

async function initRegistroDiario() {

    if (!requireConfigOrShow()) return;

    const access = await requireAdmin();
    if (!access) return;

    const fecha = document.querySelector('#fecha-registro-diario');
    const tabla = document.querySelector('#detalle-registro-diario');
    const resumen = document.querySelector('#resumen-registro-diario');
    const entregas = document.querySelector('#resumen-entregas');
    const mensaje = document.querySelector('#mensaje-registro-diario');
    const archivo = document.querySelector('#archivo-historial');
    const botonImportar = document.querySelector('#btn-importar-historial');

    const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
    if (fecha && !fecha.value) fecha.value = hoy;

    async function cargar() {
        try {
            const rows = await obtenerHistorialDia(fecha.value);
            const grupos = new Map();
            let totalEntregas = 0;

            rows.forEach(row => {
                separarEntregas(row.se_entrego).forEach(parte => {
                    const item = normalizarEntrega(parte);
                    const nombre = typeof item === 'string' ? item : item.nombre;
                    const cantidad = typeof item === 'string' ? 1 : item.cantidad;
                    grupos.set(nombre, (grupos.get(nombre) || 0) + cantidad);
                    totalEntregas += cantidad;
                });
            });

            resumen.innerHTML = `
                <div class="tarjeta reporte-principal"><h3>PERSONAS QUE VINIERON</h3><strong>${rows.length}</strong></div>
                <div class="tarjeta reporte-principal"><h3>TOTAL DE ENTREGAS</h3><strong>${totalEntregas}</strong></div>
                <div class="tarjeta reporte-principal"><h3>TIPOS DE ENTREGA</h3><strong>${grupos.size}</strong></div>
            `;

            entregas.innerHTML = grupos.size ? [...grupos.entries()].sort((a,b) => b[1]-a[1]).map(([nombre,cantidad]) => `
                <tr><td>${escapeHtml(nombre)}</td><td><strong>${cantidad}</strong></td></tr>
            `).join('') : '<tr><td colspan="2">No hay entregas registradas.</td></tr>';

            tabla.innerHTML = rows.length ? rows.map(row => `
                <tr>
                    <td>${escapeHtml(row.dni)}</td>
                    <td>${escapeHtml(row.nombre)}</td>
                    <td>${escapeHtml(row.localidad || '-')}</td>
                    <td>${escapeHtml(row.se_entrego || '-')}</td>
                    <td>${escapeHtml(formatArgentina(row.fecha_visita))}</td>
                </tr>
            `).join('') : '<tr><td colspan="5">No hay personas registradas para este día.</td></tr>';

            window._registroDiarioActual = rows;
            window._entregasDiarias = grupos;

            if (mensaje) mensaje.innerHTML = '';
        } catch (error) {
            if (mensaje) mensaje.innerHTML = `<div class="error">${escapeHtml(error.message || 'No se pudo cargar el registro.')}</div>`;
        }
    }

    fecha?.addEventListener('change', cargar);

    document.querySelector('#btn-imprimir-registro')?.addEventListener('click', () => window.print());

    document.querySelector('#btn-descargar-registro')?.addEventListener('click', () => {
        const rows = window._registroDiarioActual || [];
        const contenido = [
            ['DNI','Nombre','Localidad','Se entregó','Fecha y hora'].map(csvEscape).join(';'),
            ...rows.map(row => [row.dni,row.nombre,row.localidad || '',row.se_entrego || '',formatArgentina(row.fecha_visita)].map(csvEscape).join(';'))
        ].join('\n');
        descargarArchivo(`registro_diario_${fecha.value}.csv`, '\ufeff' + contenido);
    });

    botonImportar?.addEventListener('click', async () => {
        try {
            botonImportar.disabled = true;
            botonImportar.textContent = 'Importando...';
            const resultado = await importarHistorialCSV(archivo.files?.[0]);
            if (mensaje) mensaje.innerHTML = `<div class="exito">Se importaron ${resultado.importados} registros. ${resultado.repetidos} ya estaban cargados y ${resultado.omitidos} filas fueron omitidas.</div>`;
            archivo.value = '';
            await cargar();
        } catch (error) {
            if (mensaje) mensaje.innerHTML = `<div class="error">${escapeHtml(error.message || 'No se pudo importar el historial.')}</div>`;
        } finally {
            botonImportar.disabled = false;
            botonImportar.textContent = '📥 Importar historial CSV';
        }
    });

    await cargar();
}

async function editarVisita(
    id,
    dni,
    nombre,
    localidad,
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

    const valueLocalidad =
        validarLocalidad(localidad);

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
                localidad: valueLocalidad,
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
   IMPORTAR EXCEL PRISET
========================= */

function normalizarEncabezadoExcel(valor) {

    return String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');
}

function valorExcel(valor) {

    return String(valor ?? '').trim();
}

function obtenerDniDesdeCuil(cuil) {

    const limpio =
        valorExcel(cuil).replace(/\D/g, '');

    if (limpio.length === 11) {
        return limpio.slice(2, 10);
    }

    if (limpio.length === 8) {
        return limpio;
    }

    if (limpio.length === 7) {
        return limpio;
    }

    return '';
}

function obtenerCuilExcel(valor) {

    // Se guarda el CUIL como viene del Excel.
    return valorExcel(valor);
}

async function importarPrisetEnVisitas(archivo) {

    if (typeof XLSX === 'undefined') {
        throw new Error('No se pudo cargar el lector de Excel.');
    }

    if (!archivo) {
        throw new Error('Seleccioná un archivo Excel.');
    }

    const buffer = await archivo.arrayBuffer();
    const libro = XLSX.read(buffer, { type: 'array', raw: false });
    const primeraHoja = libro.Sheets[libro.SheetNames[0]];

    if (!primeraHoja) {
        throw new Error('El Excel no tiene una hoja válida.');
    }

    const filas = XLSX.utils.sheet_to_json(primeraHoja, {
        header: 1,
        defval: '',
        raw: false
    });

    if (!filas.length) {
        throw new Error('El Excel está vacío.');
    }

    const encabezados = filas[0].map(normalizarEncabezadoExcel);
    const buscarColumna = (...nombres) =>
        encabezados.findIndex(h => nombres.includes(h));

    const indiceNombre = buscarColumna(
        'NOMBRE Y APELLIDO', 'NOMBRE APELLIDO', 'NOMBRE Y APELLIDOS', 'NOMBRE'
    );
    const indiceDni = buscarColumna('DNI');
    const indiceCuil = buscarColumna('CUIL', 'CUIL/CUIT');
    const indiceLocalidad = buscarColumna('LOCALIDAD', 'CIUDAD', 'BARRIO');
    const indiceEntrega = buscarColumna(
        'SE ENTREGO', 'SE ENTREGO', 'ENTREGA', 'PRODUCTO ENTREGADO',
        'QUE SE ENTREGO', 'QUE SE ENTREGO', 'TAMANO', 'TAMAÑO'
    );
    const indiceContacto = buscarColumna('CONTACTO', 'TELEFONO', 'TELÉFONO');

    if (indiceNombre < 0) {
        throw new Error('El Excel debe tener la columna NOMBRE Y APELLIDO.');
    }
    if (indiceDni < 0 && indiceCuil < 0) {
        throw new Error('El Excel debe tener la columna DNI o CUIL.');
    }

    const registros = [];
    const dnisExcel = new Set();
    let filasSinDni = 0;
    let dniRepetidosExcel = 0;

    for (let i = 1; i < filas.length; i++) {
        const fila = filas[i] || [];
        const nombre = valorExcel(fila[indiceNombre]);
        const cuil = indiceCuil >= 0 ? obtenerCuilExcel(fila[indiceCuil]) : '';
        let dni = indiceDni >= 0
            ? valorExcel(fila[indiceDni]).replace(/\D/g, '')
            : '';

        if (!dni && cuil) dni = obtenerDniDesdeCuil(cuil);

        if (!dni || !nombre) {
            filasSinDni++;
            continue;
        }

        // Si el DNI se repite, conservamos la primera fila del Excel.
        if (dnisExcel.has(dni)) {
            dniRepetidosExcel++;
            continue;
        }
        dnisExcel.add(dni);

        const localidad = indiceLocalidad >= 0
            ? valorExcel(fila[indiceLocalidad])
            : '';
        let seEntrego = indiceEntrega >= 0
            ? valorExcel(fila[indiceEntrega])
            : '';

        // Si el Excel separa el tipo/tamaño y no tiene una columna de entrega,
        // guardamos el tamaño como información de lo entregado.
        if (!seEntrego && indiceContacto >= 0) {
            const contacto = valorExcel(fila[indiceContacto]);
            if (contacto && !/^\+?[\d\s()-]+$/.test(contacto)) {
                seEntrego = contacto;
            }
        }

        registros.push({
            dni,
            nombre,
            cuil,
            localidad: localidad || null,
            se_entrego: seEntrego || null
        });
    }

    if (!registros.length) {
        throw new Error('No se encontraron personas válidas para importar.');
    }

    // Leemos los datos actuales para actualizar las personas existentes.
    const existentes = await api(
        '/rest/v1/visitas?select=id,dni,nombre,cuil,localidad,se_entrego,fecha_visita'
    );

    const porDni = new Map(
        (existentes || []).map(row => [String(row.dni), row])
    );

    const nuevos = [];
    const actualizarExistentes = [];
    let yaExistian = 0;
    const fechaImportacion = new Date().toISOString();

    for (const registro of registros) {
        const existente = porDni.get(registro.dni);

        if (existente) {
            yaExistian++;
            actualizarExistentes.push({ existente, registro });
            continue;
        }

        nuevos.push({
            dni: registro.dni,
            nombre: registro.nombre,
            cuil: registro.cuil || null,
            localidad: registro.localidad,
            se_entrego: registro.se_entrego,
            fecha_visita: fechaImportacion
        });
    }

    // Para las personas existentes actualizamos también localidad y entrega,
    // y actualizamos la fecha para que figuren como ASISTIÓ.
    for (const item of actualizarExistentes) {
        const { existente, registro } = item;
        await api(
            `/rest/v1/visitas?id=eq.${encodeURIComponent(existente.id)}`,
            {
                method: 'PATCH',
                headers: { Prefer: 'return=minimal' },
                body: JSON.stringify({
                    nombre: registro.nombre,
                    localidad: registro.localidad,
                    se_entrego: registro.se_entrego,
                    fecha_visita: fechaImportacion
                })
            }
        );
    }

    let importados = 0;
    for (let i = 0; i < nuevos.length; i += 100) {
        const bloque = nuevos.slice(i, i + 100);
        await api('/rest/v1/visitas', {
            method: 'POST',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify(bloque)
        });
        importados += bloque.length;
    }

    return {
        procesados: registros.length,
        importados,
        yaExistian,
        filasSinDni,
        dniRepetidosExcel
    };
}

function mostrarResultadoImportacion(datos) {

    const resultado =
        document.querySelector(
            '#resultado-importacion'
        );

    if (!resultado) {
        return;
    }

    resultado.innerHTML = `
        <div class="resultado priset">
            <h2>🟡 Importación terminada</h2>

            <p>
                <strong>Nuevos importados:</strong>
                ${escapeHtml(datos.importados)}
            </p>

            <p>
                <strong>DNI que ya existían:</strong>
                ${escapeHtml(datos.yaExistian)}
            </p>

            <p>
                <strong>DNI repetidos dentro del Excel:</strong>
                ${escapeHtml(datos.dniRepetidosExcel)}
            </p>

            <p>
                <strong>Filas sin DNI:</strong>
                ${escapeHtml(datos.filasSinDni)}
            </p>

            <p>
                Las personas nuevas se guardaron como ASISTIÓ y se actualizó la fecha de asistencia de las personas que ya existían.
            </p>
        </div>
    `;
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

                if (row && row.fecha_visita && asistenciaVigente(row.fecha_visita)) {

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

                            ${
                                row.localidad
                                    ? `
                                        <p>
                                            <strong>Localidad:</strong>
                                            ${escapeHtml(row.localidad)}
                                        </p>
                                    `
                                    : ''
                            }

                            ${
                                row.se_entrego
                                    ? `
                                        <p>
                                            <strong>Se entregó:</strong>
                                            ${escapeHtml(row.se_entrego)}
                                        </p>
                                    `
                                    : ''
                            }

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

                } else if (row) {

                    result.innerHTML = `
                        <div class="resultado priset">
                            <h2>🟡 RECIBE POR SISTEMA</h2>
                            <p>
                                Esta persona recibe por sistema.
                            </p>
                            <p>
                                <strong>DNI:</strong>
                                ${escapeHtml(row.dni)}
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

    // Buscador general: consulta todos los registros, incluidos RECIBE POR SISTEMA.
    const busquedaGeneral = document.querySelector('#busqueda-general');
    const resultadosBusquedaGeneral = document.querySelector('#resultados-busqueda-general');
    let temporizadorBusquedaGeneral = null;

    if (busquedaGeneral && resultadosBusquedaGeneral) {
        busquedaGeneral.addEventListener('input', () => {
            clearTimeout(temporizadorBusquedaGeneral);
            temporizadorBusquedaGeneral = setTimeout(async () => {
                const termino = busquedaGeneral.value.trim();
                if (termino.length < 2) {
                    resultadosBusquedaGeneral.innerHTML = termino.length
                        ? '<p>Escribí al menos 2 caracteres para buscar.</p>' : '';
                    return;
                }
                resultadosBusquedaGeneral.innerHTML = '<p>Buscando personas...</p>';
                try {
                    const todas = await obtenerVisitas();
                    const normalizar = valor => String(valor ?? '')
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .toLocaleLowerCase('es');
                    const consulta = normalizar(termino);
                    const coincidencias = todas.filter(persona => [
                        persona.dni, persona.nombre, persona.localidad,
                        persona.se_entrego, persona.cuil,
                        (persona.fecha_visita && asistenciaVigente(persona.fecha_visita))
                            ? 'asistio' : (esPersonaPriset(persona.dni)
                                ? 'recibe por sistema' : (!persona.fecha_visita
                                    ? 'registrado persona registrada' : 'asistencia vencida'))
                    ].some(valor => normalizar(valor).includes(consulta)));

                    if (!coincidencias.length) {
                        resultadosBusquedaGeneral.innerHTML = '<div class="resultado no-vino"><p>No se encontraron personas con ese dato.</p></div>';
                        return;
                    }

                    resultadosBusquedaGeneral.innerHTML = `
                        <p><strong>Coincidencias encontradas: ${coincidencias.length}</strong></p>
                        <div class="tabla-scroll"><table>
                            <thead><tr><th>Estado</th><th>DNI</th><th>Nombre</th><th>Localidad</th><th>Se entregó</th><th>Fecha y hora</th><th>Acciones</th></tr></thead>
                            <tbody>${coincidencias.map(persona => {
                                const asistioVigente = Boolean(persona.fecha_visita && asistenciaVigente(persona.fecha_visita));
                                const recibePorSistema = esPersonaPriset(persona.dni) && !asistioVigente;
                                const estado = asistioVigente
                                    ? '🔴 ASISTIÓ'
                                    : (recibePorSistema
                                        ? '<span class="aviso-priset">🟡 RECIBE POR SISTEMA</span>'
                                        : (!persona.fecha_visita ? '⚪ REGISTRADO' : '⚪ Asistencia vencida'));
                                return `<tr>
                                    <td>${estado}</td>
                                    <td>${escapeHtml(persona.dni)}</td>
                                    <td>${escapeHtml(persona.nombre || '-')}</td>
                                    <td>${escapeHtml(persona.localidad || '-')}</td>
                                    <td>${escapeHtml(persona.se_entrego || '-')}</td>
                                    <td>${escapeHtml(formatArgentina(persona.fecha_visita))}</td>
                                    <td><button type="button" class="boton-editar btn-editar-desde-busqueda" data-id="${escapeHtml(persona.id)}" data-dni="${escapeHtml(persona.dni)}" data-nombre="${escapeHtml(persona.nombre || '')}" data-localidad="${escapeHtml(persona.localidad || '')}" data-se-entrego="${escapeHtml(persona.se_entrego || '')}">✏️ Editar</button></td>
                                </tr>`;
                            }).join('')}</tbody>
                        </table></div>`;
                    resultadosBusquedaGeneral.querySelectorAll('.btn-editar-desde-busqueda').forEach(button => {
                        button.addEventListener('click', () => mostrarEditorVisita(
                            button.dataset.id, button.dataset.dni, button.dataset.nombre,
                            button.dataset.localidad, button.dataset.seEntrego
                        ));
                    });
                } catch (error) {
                    resultadosBusquedaGeneral.innerHTML = `<div class="error">${escapeHtml(error.message || 'No se pudo realizar la búsqueda.')}</div>`;
                }
            }, 250);
        });
    }

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

    registrarSeccion.hidden = true;
    registrarSeccion.classList.add('seccion-oculta');
    registrarSeccion.style.display = 'none';

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

    const archivoExcel =
        document.querySelector(
            '#archivo-excel'
        );

    const botonImportarExcel =
        document.querySelector(
            '#btn-importar-excel'
        );

    if (botonImportarExcel && archivoExcel) {

        botonImportarExcel.addEventListener(
            'click',
            async () => {

                clearMessage();

                const archivo =
                    archivoExcel.files?.[0];

                try {

                    botonImportarExcel.disabled =
                        true;

                    botonImportarExcel.textContent =
                        'Importando...';

                    const datos =
                        await importarPrisetEnVisitas(
                            archivo
                        );

                    mostrarResultadoImportacion(
                        datos
                    );

                    archivoExcel.value = '';

                    await loadVisits();

                } catch (error) {

                    showMessage(
                        'error',
                        error.message ||
                        'No se pudo importar el Excel.',
                        '#resultado-importacion'
                    );

                } finally {

                    botonImportarExcel.disabled =
                        false;

                    botonImportarExcel.textContent =
                        '📥 Importar Excel';
                }
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
                                    ${escapeHtml(row.localidad || '-')}
                                </td>

                                <td>
                                    ${escapeHtml(row.se_entrego || '-')}
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
                                        data-localidad="${escapeHtml(row.localidad || '')}"
                                        data-se-entrego="${escapeHtml(row.se_entrego || '')}"
                                    >
                                        ✏️ Editar
                                    </button>
                                </td>

                            </tr>
                        `).join('')

                        : `
                            <tr>
                                <td colspan="6">
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
                                    button.dataset.nombre,
                                    button.dataset.localidad,
                                    button.dataset.seEntrego
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
        nombre,
        localidad,
        seEntrego
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

                <label for="editar-localidad">
                    Localidad:
                </label>

                <input
                    type="text"
                    id="editar-localidad"
                    value="${escapeHtml(localidad || '')}"
                    maxlength="150"
                    placeholder="Ingrese localidad"
                >

                <label for="editar-se-entrego">
                    Se entregó:
                </label>

                <input
                    type="text"
                    id="editar-se-entrego"
                    value="${escapeHtml(seEntrego || '')}"
                    maxlength="200"
                    placeholder="Ingrese lo que se entrego"
                >

                <div class="acciones-editor-visita">

                    <button
                        type="submit"
                        class="boton-editar"
                        id="guardar-edicion"
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

                    <button
                        type="button"
                        id="eliminar-edicion"
                        class="boton-eliminar"
                    >
                        🗑️ Eliminar
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

        const localidadInput =
            editor.querySelector(
                '#editar-localidad'
            );

        const seEntregoInput =
            editor.querySelector(
                '#editar-se-entrego'
            );

        const guardar =
            editor.querySelector(
                '#guardar-edicion'
            );

        const cancelar =
            editor.querySelector(
                '#cancelar-edicion'
            );

        const eliminar =
            editor.querySelector(
                '#eliminar-edicion'
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

        /* =========================
           GUARDAR CAMBIOS
        ========================== */

        form.addEventListener(
            'submit',
            async (event) => {

                event.preventDefault();

                try {

                    const nuevoDni =
                        validarDni(
                            dniInput.value
                        );

                    const nuevoNombre =
                        validarNombre(
                            nombreInput.value
                        );

                    const nuevaLocalidad =
                        validarLocalidad(
                            localidadInput.value
                        );

                    const nuevoSeEntrego =
                        validarSeEntrego(
                            seEntregoInput.value
                        );

                    guardar.disabled =
                        true;

                    cancelar.disabled =
                        true;

                    eliminar.disabled =
                        true;

                    guardar.textContent =
                        'Guardando...';

                    await editarVisita(
                        id,
                        nuevoDni,
                        nuevoNombre,
                        nuevaLocalidad,
                        nuevoSeEntrego
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

                    guardar.disabled =
                        false;

                    cancelar.disabled =
                        false;

                    eliminar.disabled =
                        false;

                    guardar.textContent =
                        '💾 Guardar cambios';
                }
            }
        );

        /* =========================
           ELIMINAR VISITA
        ========================== */

        eliminar.addEventListener(
            'click',
            async () => {

                const confirmar =
                    confirm(
                        `¿Seguro que querés eliminar la visita de ${nombre} (DNI ${dni})?\n\nEsta acción no se puede deshacer.`
                    );

                if (!confirmar) {
                    return;
                }

                guardar.disabled =
                    true;

                cancelar.disabled =
                    true;

                eliminar.disabled =
                    true;

                eliminar.textContent =
                    'Eliminando...';

                try {

                    await eliminarVisita(id);

                    editor.remove();

                    showMessage(
                        'exito',
                        'La visita fue eliminada correctamente.'
                    );

                    await loadVisits();

                } catch (error) {

                    showMessage(
                        'error',
                        error.message ||
                        'No se pudo eliminar la visita.'
                    );

                    guardar.disabled =
                        false;

                    cancelar.disabled =
                        false;

                    eliminar.disabled =
                        false;

                    eliminar.textContent =
                        '🗑️ Eliminar';
                }
            }
        );

        editor.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        dniInput.focus();
    }

    /* =========================
       BUSCAR DNI
    ========================== */

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

                // Solo los DNI definidos como PRISET son RECIBE POR SISTEMA.
                // Un registro sin fecha de visita queda como persona registrada.
                const esPriset = esPersonaPriset(dni);

                if (row && row.fecha_visita && asistenciaVigente(row.fecha_visita)) {

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

                            ${
                                row.localidad
                                    ? `
                                        <p>
                                            <strong>Localidad:</strong>
                                            ${escapeHtml(row.localidad)}
                                        </p>
                                    `
                                    : ''
                            }

                            ${
                                row.se_entrego
                                    ? `
                                        <p>
                                            <strong>Se entregó:</strong>
                                            ${escapeHtml(row.se_entrego)}
                                        </p>
                                    `
                                    : ''
                            }

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

                if (esPriset) {

                    searchResult.innerHTML = `
                        <div class="resultado priset">

                            <h2>🟡 RECIBE POR SISTEMA</h2>

                            <p>
                                Esta persona recibe por sistema.
                            </p>

                        </div>
                    `;

                    // Si recibe por sistema, no mostrar el formulario
                    // para registrar visita.
                    return;

                } else {

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
                }

                registerForm.dni.value =
                    dni;

                registerForm.nombre.value =
                    '';

                if (registerForm.localidad) {
                    registerForm.localidad.value = '';
                }

                if (registerForm.se_entrego) {
                    registerForm.se_entrego.value = '';
                }

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

    /* =========================
       REGISTRAR VISITA
    ========================== */

    registerForm.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            clearMessage();

            const dni =
                registerForm.dni.value.trim();

            const nombre =
                registerForm.nombre.value.trim();

            const localidad =
                registerForm.localidad
                    ? registerForm.localidad.value.trim()
                    : '';

            const seEntrego =
                registerForm.se_entrego
                    ? registerForm.se_entrego.value.trim()
                    : '';

            try {

                validarDni(dni);
                validarNombre(nombre);
                validarLocalidad(localidad);
                validarSeEntrego(seEntrego);

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
                    nombre,
                    localidad,
                    seEntrego
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

                        ${
                            localidad
                                ? `
                                    <p>
                                        <strong>Localidad:</strong>
                                        ${escapeHtml(localidad)}
                                    </p>
                                `
                                : ''
                        }

                        ${
                            seEntrego
                                ? `
                                    <p>
                                        <strong>Se entregó:</strong>
                                        ${escapeHtml(seEntrego)}
                                    </p>
                                `
                                : ''
                        }

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
            'Localidad',
            'Se entregó',
            'Fecha',
            'Hora'
        ]
    ];

    rows.forEach(row => {

        const date =
            row.fecha_visita
                ? new Date(row.fecha_visita)
                : null;

        const fecha =
            date
                ? new Intl.DateTimeFormat(
                    'es-AR',
                    {
                        timeZone:
                            'America/Argentina/Buenos_Aires',

                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }
                ).format(date)
                : '';

        const hora =
            date
                ? new Intl.DateTimeFormat(
                    'es-AR',
                    {
                        timeZone:
                            'America/Argentina/Buenos_Aires',

                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',

                        hour12: false
                    }
                ).format(date)
                : '';

        csvRows.push([
            row.dni,
            row.nombre,
            row.localidad || '',
            row.se_entrego || '',
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


/* =========================
   ACTUALIZACION AUTOMATICA
========================= */

let intervaloRegistroDiario = null;

function iniciarActualizacionAutomaticaRegistroDiario() {
    if (intervaloRegistroDiario) {
        clearInterval(intervaloRegistroDiario);
    }

    intervaloRegistroDiario = setInterval(async () => {
        if (!document.querySelector('#fecha-registro-diario')) return;

        try {
            await initRegistroDiario();
        } catch (error) {
            console.error('No se pudo actualizar el Registro diario:', error);
        }
    }, 5 * 60 * 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarActualizacionAutomaticaRegistroDiario, { once: true });
} else {
    iniciarActualizacionAutomaticaRegistroDiario();
}
