# Cambios recientes: Produccion, Asignaciones y Selector de Operario

## Alcance
- Se implemento la vista de Produccion diaria para administradores con filtros por fecha y desgloses.
- Se agrego la vista de Asignaciones para administrar operarios, fincas y galpones.
- Se habilito al operario para seleccionar finca y galpon activo y persistir su seleccion.
- Se ajusto RLS para permitir leer el nombre de la finca en operarios asignados.

## Funcionalidad
- Produccion (admin):
  - Vista por finca con total diario.
  - Desglose por galpon.
  - Matriz por tipo de huevo y finca.
  - Fila final con total por finca y total global.
  - Scroll horizontal en movil con la columna de tipo fija para mantener contexto.
- Asignaciones (admin):
  - Seleccion de operario y finca.
  - Checklist de galpones asignados por finca.
  - Resumen de asignaciones actuales por finca.
- Operario:
  - Selector de finca y galpon activo basado en asignaciones.
  - Persistencia del galpon seleccionado en `localStorage`.
  - Subpantallas usan el galpon activo desde el contexto.

## Archivos nuevos
- `src/screens/ProduccionScreen.tsx`
- `src/screens/OperariosAsignacionesScreen.tsx`
- `src/services/OperarioService.ts`
- `db_migrations/36_allow_operario_select_fincas_for_assigned_galpones.sql`

## Archivos modificados
- `src/App.tsx`
- `src/components/Sidebar.tsx`
- `src/components/DashboardLayout.tsx`
- `src/components/SelectedGalponProvider.tsx`
- `src/screens/ProduccionScreen.tsx`
- `src/screens/OperarioDashboardScreen.tsx`
- `src/services/GalponService.ts`
- `src/services/ProduccionService.ts`
- `src/models/Galpon.ts`

## Migraciones
- Aplicar `db_migrations/36_allow_operario_select_fincas_for_assigned_galpones.sql` en la base de datos.
