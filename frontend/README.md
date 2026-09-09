# Sistema de Gestión de Transfers

Plataforma frontend para la gestión de reservas de viajes, flotas vehiculares y monitoreo de rutas.

**Tecnologías Principales**
* React + Vite (TypeScript)
* Tailwind CSS (Estilos y Sistema de Diseño)
* Zustand (Gestor de Estado Global)
* React Hook Form + Zod (Manejo y validación de formularios)

**Ejecución del Proyecto local**
1. Instalar dependencias: `npm install`
2. Iniciar entorno de desarrollo: `npm run dev`

**Arquitectura del Código**
El proyecto utiliza un enfoque orientado a características (Feature-Sliced Design) para evitar el acoplamiento:
* `src/features/`: Contiene la lógica de negocio aislada (usuarios, rutas, viajes, flota).
* `src/components/`: Componentes atómicos de UI (Button, Input) y Layouts globales.
* `src/types/`: Centraliza las interfaces de TypeScript basadas en el modelo de datos.
* `src/api/`: Configuración de servicios y simulación de datos (Mocking).






