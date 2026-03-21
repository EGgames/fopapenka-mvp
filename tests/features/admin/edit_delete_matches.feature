Feature: Editar y eliminar partidos de fechas abiertas
  Como administrador de una penca
  Quiero poder editar o eliminar partidos que aún no se han jugado
  Para corregir errores al configurar la fecha antes de que los usuarios pronostiquen

  Background:
    Given que "AdminUser" es administrador de la penca "Liga Test"
    And que existe un torneo activo "Apertura 2026"
    And que existe la "Fecha 1" con 3 partidos programados
    And que "AdminUser" está autenticado

  # ─── EDITAR PARTIDO ─────────────────────────────────────────

  Scenario: Editar equipos de un partido programado
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    When "AdminUser" hace click en el botón editar "✏️" del partido "Nacional vs Peñarol"
    Then debería ver el formulario de edición inline con los equipos preseleccionados
    When "AdminUser" cambia el equipo local a "Defensor"
    And "AdminUser" hace click en "Guardar"
    Then el partido debería mostrar "Defensor vs Peñarol"
    And los pronósticos asociados al partido anterior deberían eliminarse

  Scenario: Editar solo la fecha y hora de un partido
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    When "AdminUser" hace click en el botón editar "✏️" del partido "Nacional vs Peñarol"
    And "AdminUser" cambia la fecha a "2026-03-20T20:00"
    And "AdminUser" hace click en "Guardar"
    Then el partido debería mostrar la nueva fecha "vie 20 mar 20:00"
    And los pronósticos existentes deberían conservarse

  Scenario: Cancelar edición de partido
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    When "AdminUser" hace click en el botón editar "✏️" del partido "Nacional vs Peñarol"
    And "AdminUser" hace click en "Cancelar"
    Then el partido debería seguir mostrando "Nacional vs Peñarol" sin cambios

  Scenario: No se puede editar un partido ya jugado
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    When "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    Then el partido "Nacional vs Peñarol" NO debería mostrar botón editar "✏️"
    And el partido debería mostrar "2 - 1" con estilo verde

  Scenario: Error al intentar poner mismo equipo local y visitante
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    When "AdminUser" hace click en el botón editar "✏️" del partido "Nacional vs Peñarol"
    And "AdminUser" cambia el equipo visitante a "Nacional"
    And "AdminUser" hace click en "Guardar"
    Then debería ver el mensaje de error "El equipo local y visitante no pueden ser el mismo"

  # ─── ELIMINAR PARTIDO ───────────────────────────────────────

  Scenario: Eliminar un partido programado
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    When "AdminUser" hace click en el botón eliminar "🗑️" del partido "Liverpool vs Plaza"
    Then debería ver un diálogo de confirmación "¿Eliminar este partido?"
    When "AdminUser" confirma la eliminación
    Then el partido "Liverpool vs Plaza" ya no debería aparecer en la lista
    And los pronósticos y puntajes asociados deberían eliminarse

  Scenario: Cancelar eliminación de partido
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    When "AdminUser" hace click en el botón eliminar "🗑️" del partido "Liverpool vs Plaza"
    And "AdminUser" cancela el diálogo de confirmación
    Then el partido "Liverpool vs Plaza" debería seguir visible

  Scenario: No se puede eliminar un partido ya jugado
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    When "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    Then el partido "Nacional vs Peñarol" NO debería mostrar botón eliminar "🗑️"
