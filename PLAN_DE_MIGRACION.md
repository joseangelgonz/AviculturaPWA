# Plan de Migración: AviculturaApp a PWA Web

## 1. Objetivo del Proyecto

El objetivo principal es transformar la aplicación nativa de Android "AviculturaApp" en una Aplicación Web Progresiva (PWA) moderna y funcional. Esto permitirá el acceso desde cualquier dispositivo con un navegador web, eliminando la necesidad de instalación a través de una tienda de aplicaciones y facilitando el mantenimiento y despliegue de nuevas versiones.

## 2. Arquitectura Tecnológica Propuesta

Para asegurar un desarrollo moderno, escalable y mantenible, se propone la siguiente arquitectura:

-   **Framework Frontend:** **React (con Vite)** para una base rápida, moderna y con un excelente ecosistema de desarrollo.
-   **Lenguaje:** **TypeScript** para añadir tipado estático, mejorar la calidad del código y facilitar la colaboración.
-   **Backend (BaaS):** **Supabase** como proveedor de backend, aprovechando su base de datos relacional (PostgreSQL). Se utilizará:
    -   **Supabase Auth** para la gestión de usuarios.
    -   **Supabase Database** como base de datos PostgreSQL.
-   **Librería de Componentes UI:** Se recomienda **Material-UI (MUI)** para replicar la apariencia visual de Material Design de la aplicación Android y acelerar el desarrollo de la interfaz.
-   **Despliegue:** **Vercel** o **Netlify** por su excelente integración con proyectos Vite y flujos de trabajo basados en Git.

## 3. Modelos de Datos (Estructura Relacional)

La base de la aplicación son sus datos. Dado el cambio a una base de datos relacional, las interfaces de TypeScript reflejarán una estructura con claves primarias numéricas y claves foráneas.

```typescript
// src/models/Usuario.ts
export interface Usuario {
  id: string; // UUID proporcionado por Supabase Auth
  email: string;
  /**
   * El rol del usuario, podría vivir en una tabla 'profiles' separada.
   * Puede ser 'administrador' o 'operario'.
   */
  role: 'administrador' | 'operario';
}

// src/models/Finca.ts
export interface Finca {
  id: number; // Clave primaria autoincremental
  nombre: string;
  ubicacion: string;
}

// src/models/Galpon.ts
export interface Galpon {
  id: number; // Clave primaria autoincremental
  finca_id: number; // Clave foránea que referencia a Finca.id
  nombre: string;
  capacidad: number;
}

// src/models/Corte.ts
export interface Corte {
  id: number; // Clave primaria autoincremental
  galpon_id: number; // Clave foránea que referencia a Galpon.id
  fecha_inicio: string; // Se recomienda formato ISO 8601 (new Date().toISOString())
  fecha_final?: string; // Opcional
  numero_aves: number;
  tipo_ave: string;
  notas?: string; // Opcional
  /**
   * Representa el estado actual del corte.
   * Puede ser 'activo' o 'finalizado'.
   */
  estado: 'activo' | 'finalizado';
}

// src/models/Produccion.ts
export interface Produccion {
  id: number; // Clave primaria autoincremental
  corte_id: number; // Clave foránea que referencia a Corte.id
  fecha: string; // Se recomienda formato ISO 8601
  huevos: number;
  alimento: number;
  agua: number;
  muertes: number;
  notas?: string; // Opcional
}
```

## 4. Plan de Acción y Próximos Pasos

1.  **Inicialización del Proyecto:**
    -   Crear el proyecto React con Vite y TypeScript: `npm create vite@latest avicultura-pwa -- --template react-ts`.

2.  **Estructura de Carpetas:**
    -   Definir una estructura de carpetas base:
        ```
        src/
        ├── assets/
        ├── components/ (Componentes reutilizables)
        ├── models/ (Archivos con las interfaces de datos)
        ├── screens/ (Vistas principales de la aplicación)
        ├── services/ (Lógica de negocio, conexión con Supabase)
        ├── hooks/ (Hooks personalizados de React)
        └── App.tsx
        ```

3.  **Configuración de Supabase:**
    -   Crear un nuevo proyecto en el dashboard de Supabase.
    -   Utilizar el Editor SQL para crear las tablas (`fincas`, `galpones`, `cortes`, `produccion`) basadas en los modelos definidos.
    -   Obtener la URL del proyecto y la `anon key` de la configuración del API.
    -   Añadir estas credenciales a un archivo de entorno (`.env`) en el proyecto React.

4.  **Implementación de la Autenticación:**
    -   Instalar el cliente de Supabase: `npm install @supabase/supabase-js`.
    -   Crear un `AuthService` utilizando el cliente de Supabase para manejar el login, logout y la sesión del usuario.
    -   Desarrollar la pantalla de `LoginScreen`.
    -   Implementar rutas protegidas.

5.  **Desarrollo de Módulos (CRUD):**
    -   Comenzar el desarrollo de las funcionalidades CRUD para cada modelo utilizando el cliente de `supabase-js` para interactuar con las tablas de la base de datos.
        1.  Gestión de Fincas.
        2.  Gestión de Galpones.
        3.  Gestión de Cortes.
        4.  Registro de Producción.

6.  **Habilitación de PWA:**
    -   Añadir un `manifest.json` para definir el icono, nombre y comportamiento de la aplicación.
    -   Implementar un `Service Worker` para habilitar funcionalidades offline.

7.  **Despliegue:**
    -   Configurar un nuevo proyecto en Vercel o Netlify, enlazándolo al repositorio de Git.
    -   Configurar las variables de entorno de Supabase en la plataforma de despliegue.
    -   Desplegar la aplicación.
