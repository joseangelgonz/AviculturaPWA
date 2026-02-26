-- Migracion 34: Eliminar trigger duplicado en registro_mortalidad
--
-- La migracion 14/15 creo trg_update_saldo_aves_on_mortality.
-- La migracion 27 agrego trg_update_saldo_aves_from_mortality (misma funcion).
-- Ambos disparan sobre INSERT/UPDATE/DELETE, causando deltas dobles en saldo_aves.
-- Se conserva unicamente trg_update_saldo_aves_from_mortality (el canonico).

DROP TRIGGER IF EXISTS trg_update_saldo_aves_on_mortality ON public.registro_mortalidad;
