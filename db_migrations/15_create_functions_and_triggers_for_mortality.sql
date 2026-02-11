-- db_migrations/15_create_functions_and_triggers_for_mortality.sql

-- Función para actualizar el saldo_aves en las tablas galpones y cortes
CREATE OR REPLACE FUNCTION public.update_saldo_aves_from_mortality()
RETURNS TRIGGER AS $$
DECLARE
    v_galpon_id BIGINT;
    v_fecha DATE;
    v_cantidad_cambio INTEGER;
    v_corte_id BIGINT;
    v_old_galpon_id BIGINT;
    v_old_fecha DATE;
    v_old_cantidad_aves INTEGER;
BEGIN
    -- Determinar el cambio en la cantidad de aves muertas
    IF TG_OP = 'INSERT' THEN
        v_galpon_id := NEW.galpon_id;
        v_fecha := NEW.fecha;
        v_cantidad_cambio := NEW.cantidad_aves_muertas;
    ELSIF TG_OP = 'UPDATE' THEN
        v_galpon_id := NEW.galpon_id;
        v_fecha := NEW.fecha;
        v_cantidad_cambio := NEW.cantidad_aves_muertas - OLD.cantidad_aves_muertas;

        -- Si galpon_id o fecha cambiaron, necesitamos revertir el saldo para los valores antiguos
        IF NEW.galpon_id IS DISTINCT FROM OLD.galpon_id OR NEW.fecha IS DISTINCT FROM OLD.fecha THEN
            v_old_galpon_id := OLD.galpon_id;
            v_old_fecha := OLD.fecha;
            v_old_cantidad_aves := OLD.cantidad_aves_muertas;

            -- Revertir galpones.saldo_aves para el galpón antiguo
            UPDATE public.galpones
            SET saldo_aves = saldo_aves + v_old_cantidad_aves
            WHERE id = v_old_galpon_id;

            -- Revertir cortes.saldo_aves para el corte activo del galpón y fecha antiguos
            SELECT c.id INTO v_corte_id
            FROM public.cortes c
            WHERE c.galpon_id = v_old_galpon_id
              AND v_old_fecha BETWEEN c.fecha_inicio AND COALESCE(c.fecha_final, 'infinity')
            LIMIT 1;

            IF v_corte_id IS NOT NULL THEN
                UPDATE public.cortes
                SET saldo_aves = saldo_aves + v_old_cantidad_aves
                WHERE id = v_corte_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_galpon_id := OLD.galpon_id;
        v_fecha := OLD.fecha;
        v_cantidad_cambio := -OLD.cantidad_aves_muertas; -- Restar la cantidad eliminada
    END IF;

    -- Actualizar galpones.saldo_aves
    UPDATE public.galpones
    SET saldo_aves = saldo_aves - v_cantidad_cambio
    WHERE id = v_galpon_id;

    -- Encontrar el corte activo para el galpón y la fecha dados
    SELECT c.id INTO v_corte_id
    FROM public.cortes c
    WHERE c.galpon_id = v_galpon_id
      AND v_fecha BETWEEN c.fecha_inicio AND COALESCE(c.fecha_final, 'infinity')
    LIMIT 1; -- Asumiendo solo un corte activo por galpón en una fecha dada

    IF v_corte_id IS NOT NULL THEN
        -- Actualizar cortes.saldo_aves
        UPDATE public.cortes
        SET saldo_aves = saldo_aves - v_cantidad_cambio
        WHERE id = v_corte_id;
    END IF;

    RETURN NULL; -- Las funciones de trigger AFTER deben retornar NULL
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER para permitir la actualización de tablas galpones y cortes

-- Crear el trigger que llama a la función después de INSERT, UPDATE o DELETE en registro_mortalidad
CREATE TRIGGER trg_update_saldo_aves_on_mortality
AFTER INSERT OR UPDATE OR DELETE ON public.registro_mortalidad
FOR EACH ROW
EXECUTE FUNCTION public.update_saldo_aves_from_mortality();
