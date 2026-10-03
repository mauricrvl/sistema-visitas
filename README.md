# Control de visitas — GitHub Pages + Supabase

Esta versión reemplaza PHP/MySQL por una aplicación estática JavaScript + Supabase.
GitHub Pages no ejecuta PHP; Supabase se encarga de autenticación y base de datos.

## 1. Crear Supabase

1. Crear un proyecto en Supabase.
2. Abrir **SQL Editor**.
3. Ejecutar `supabase.sql` completo.
4. En **Project Settings -> API**, copiar la URL del proyecto y la **Publishable key**.
5. Pegarlas en `supabase-config.js`.

## 2. Configurar autenticación

En Supabase -> Authentication -> Providers, dejar habilitado **Email**.
Para esta versión los usuarios administradores usan un correo interno derivado del usuario:
`usuario@controlvisitas.local`.
No se muestran correos reales en la pantalla.

La creación/eliminación de administradores se hace mediante Edge Functions para no exponer la clave `service_role` en GitHub.

## 3. Edge Functions

Las funciones están en `supabase/functions/`.
Se deben desplegar con Supabase CLI:

```bash
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase functions deploy admin-create
supabase functions deploy admin-delete
supabase functions deploy admin-list
supabase functions deploy admin-bootstrap
```

Configurar el secreto `SUPABASE_SERVICE_ROLE_KEY` para las funciones. **Nunca** lo pongas en `supabase-config.js` ni en GitHub.

## 4. Crear el primer administrador

Después de desplegar `admin-bootstrap`, invocarla una sola vez con el usuario y contraseña iniciales. La función está preparada para crear el primer administrador si todavía no existe ninguno.

La forma más sencilla es usar el panel de Supabase para ejecutar la función o Supabase CLI. Revisá la función antes de ejecutarla y cambiá la contraseña inicial.

## 5. GitHub Pages

Subir todos los archivos de este proyecto al repositorio. En GitHub:
**Settings -> Pages -> Deploy from a branch -> main -> /(root)**.

La aplicación es estática y no contiene PHP.

## Seguridad

- No subir contraseñas de MySQL.
- No subir `service_role`.
- La base usa RLS.
- Los visitantes solo pueden consultar un DNI mediante una función SQL específica; no pueden listar toda la tabla.
- Los administradores pueden ver y modificar las visitas.
