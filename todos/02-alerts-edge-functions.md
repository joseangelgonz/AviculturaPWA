# TODO: Alertas via Edge Functions

Estado actual (marzo 2026):
- Se eliminó la lógica de alertas calculadas en frontend/dashboard.
- La ruta `/alertas` queda como placeholder.

Pendientes para implementación futura:
- Definir fuentes de eventos para alertas (producción, mortalidad, alimentación, cortes).
- Diseñar tabla persistente de alertas (`alertas`) con ciclo de vida:
  - `new`, `acknowledged`, `resolved`, `dismissed`.
- Implementar evaluación de reglas en Supabase Edge Functions.
- Programar ejecución periódica (cron/scheduler).
- Exponer endpoints para:
  - listar alertas activas e históricas,
  - confirmar (ack),
  - resolver/cerrar.
- Crear UI de `/alertas` consumiendo la fuente persistida (no cálculos en cliente).
