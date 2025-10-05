# Multifit Backend

Backend en Node.js + TypeScript que expone operaciones REST CRUD para todo el esquema public de Supabase. Cada petición se ejecuta usando el ccess_token del usuario autenticado, respetando las políticas RLS existentes.

## Requisitos

- Node.js 18+
- Variables de entorno en .env:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - SUPABASE_JWT_SECRET
  - SUPABASE_SERVICE_ROLE_KEY (opcional, solo para tareas administrativas)
  - PORT (opcional, por defecto 3001)

## Scripts disponibles

`ash
npm install       # instala dependencias
npm run dev       # arranca el servidor con recarga usando tsx
npm run build     # compila a JavaScript en dist/
npm start         # ejecuta la versión compilada (requiere npm run build)
`

## Autenticación

Todas las rutas bajo /api requieren el encabezado Authorization: Bearer <access_token> emitido por Supabase. El middleware valida el JWT usando SUPABASE_JWT_SECRET, adjunta el uth.uid() al contexto de la petición y crea un cliente de Supabase tipado con las credenciales del usuario.

## Estructura

- src/app.ts: configuración de Express y enrutamiento
- src/modules/**: modelos, controladores y rutas CRUD por tabla (usuario_organization usa claves compuestas)
- src/middleware: autenticación, manejo de errores y utilidades
- src/config: carga de variables de entorno y cliente Supabase

## Endpoints

Las rutas siguen el patrón /api/<recurso> y exponen GET, POST, PUT, DELETE para cada tabla:

- /api/asignaciones-rutina
- /api/clases
- /api/detalles-pago
- /api/gyms
- /api/inscripciones-clase
- /api/miembros
- /api/organizations
- /api/pagos
- /api/personas
- /api/roles
- /api/rutinas
- /api/tipos-membresia
- /api/usuarios
- /api/usuario-organizations/:userId/:organizationId

Además, GET /health está disponible sin autenticación para chequeos básicos.
