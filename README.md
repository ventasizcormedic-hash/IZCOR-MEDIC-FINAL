# IZCOR MEDIC

IZCOR MEDIC es una aplicación web de catálogo, cotización y gestión comercial para equipos médicos e insumos hospitalarios.

## Stack principal

- React 19 + TypeScript + Vite
- React Router DOM
- Express + Vite server middleware
- Drizzle ORM
- PostgreSQL / PGlite embebido
- Firebase Auth + Firebase Admin
- Tailwind CSS
- Bun como entorno para scripts y ejecución local

## Objetivo

El proyecto expone:

- catálogo médico multimarca
- detalle de productos
- buscador y filtros por categoría/fabricante/marca
- cotizaciones institucionales
- formularios de TDR y farmacovigilancia
- panel administrativo con gestión de catálogo, validación, fuentes y auditoría

## Estructura general

```text
.
├─ public/                  # assets estáticos y uploads
├─ src/
│  ├─ components/          # UI, layout, catalog, product, admin, home
│  ├─ context/             # providers globales
│  ├─ data/                # JSON de catálogo/base de datos local
│  ├─ db/                  # Drizzle schema, índices, seed y config
│  ├─ hooks/               # hooks reutilizables
│  ├─ lib/                 # utilidades y configuración Firebase
│  ├─ middleware/          # autenticación del backend
│  ├─ pages/               # rutas principales de la app
│  ├─ services/            # servicios de validación, scraping, consolidación
│  ├─ App.tsx              # rutas principales
│  ├─ main.tsx             # bootstrap de la app
│  └─ index.css            # estilos globales
├─ scripts/                # utilidades de importación, auditoría y mantenimiento
├─ drizzle/                # migraciones SQL
├─ e2e/                    # pruebas end-to-end
├─ tests/                  # pruebas unitarias
├─ .env.example            # variables esperadas por entorno
├─ .gitignore              # exclusiones del repositorio
├─ components.json         # configuración del sistema de componentes
├─ firebase-applet-config.json
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ server.ts               # servidor Express + APIs
└─ README.md
```

## Requisitos previos

- Bun 1.4+
- Node.js 18+
- acceso a PostgreSQL opcional o uso del motor embebido PGlite
- variables de entorno para Firebase/Gemini si se usan funciones del backend

## Instalación

```bash
bun install
```

## Variables de entorno

Copia la plantilla y completa los valores necesarios:

```bash
cp .env.example .env
```

Variables documentadas en [.env.example](.env.example):

- APP_URL
- GEMINI_API_KEY
- DATABASE_URL
- SQL_HOST
- SQL_PORT
- SQL_DB_NAME
- SQL_USER
- SQL_PASSWORD
- SQL_ADMIN_USER
- SQL_ADMIN_PASSWORD

> Nunca subas secretos reales a GitHub ni a repositorios públicos.

## Ejecutar localmente

### Desarrollo

```bash
bun run dev
```

### Producción

```bash
bun run build
bun run start
```

## Comandos disponibles

```bash
bun run dev
bun run build
bun run start
bun run preview
bun run lint
bun run test
bun run test:unit
bun run test:e2e
bun run audit:catalog
bun run import-catalog
```

## Base de datos

El proyecto usa Drizzle con soporte a:

- PostgreSQL externo si existe DATABASE_URL o SQL_HOST remoto
- PGlite embebido como fallback local para ejecución sin configuración extra

La inicialización se realiza desde [src/db/index.ts](src/db/index.ts) y las migraciones de esquema se encuentran en [drizzle](drizzle).

## Firebase

La configuración web de Firebase está en [firebase-applet-config.json](firebase-applet-config.json) y se usa desde [src/lib/firebase.ts](src/lib/firebase.ts). La configuración administrativa se usa en [src/lib/firebase-admin.ts](src/lib/firebase-admin.ts).

## Seguridad y limpieza

- no se incluyen secretos reales ni claves live en el repositorio
- la carpeta de uploads se mantiene operativa desde [public/uploads](public/uploads)
- el archivo [.gitignore](.gitignore) evita subir dependencias, artefactos de build, logs y archivos locales sensibles

## Estado del proyecto

El proyecto compila correctamente con la configuración actual y mantiene una estructura funcional para desarrollo y despliegue local.

## Recomendaciones futuras

- consolidar la carpeta raíz del repositorio si se quiere un único punto limpio de Git
- revisar si la carpeta de imágenes y catalogos generados debe mantenerse en Git o convertirse en artefactos de despliegue
- definir un flujo real de variables de entorno para entorno de producción
- mantener una rama de despliegue separada para el repositorio remoto
