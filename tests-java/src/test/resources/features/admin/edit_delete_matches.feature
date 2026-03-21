Feature: Editar y eliminar partidos de fechas abiertas
  Como administrador de una penca
  Quiero poder editar o eliminar partidos que aún no se han jugado
  Para corregir errores al configurar la fecha antes de que los usuarios pronostiquen

  Background:
    Given que "AdminUser" es administrador de la penca "Liga Test"
    And que existe un torneo activo "Apertura 2026"
    And que existe la "Fecha 1" con 3 partidos programados
    And que "AdminUser" está autenticado

  Scenario: Editar equipos de un partido programado
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    When "AdminUser" hace click en el botón editar del partido "Nacional vs Peñarol"
    And "AdminUser" cambia el equipo local a "Defensor"
    And "AdminUser" hace click en "Guardar"
    Then el partido debería mostrar "Defensor vs Peñarol"
    And los pronósticos asociados al partido anterior deberían eliminarse

  Scenario: Editar solo la fecha y hora de un partido
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    When "AdminUser" hace click en el botón editar del partido "Nacional vs Peñarol"
    And "AdminUser" cambia la fecha a "2026-03-20T20:00"
    And "AdminUser" hace click en "Guardar"
    Then el partido debería mostrar la nueva fecha
    And los pronósticos existentes deberían conservarse

  Scenario: Eliminar un partido programado
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    When "AdminUser" hace click en el botón eliminar del partido "Liverpool vs Plaza"
    And "AdminUser" confirma la eliminación
    Then el partido "Liverpool vs Plaza" ya no debería aparecer en la lista
    And los pronósticos y puntajes asociados deberían eliminarse

  Scenario: No se puede editar un partido ya jugado
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    When "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    Then el partido "Nacional vs Peñarol" NO debería mostrar botón editar

  Scenario: No se puede eliminar un partido ya jugado
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    When "AdminUser" navega al Panel de Administración
    And selecciona el tab "Fechas"
    Then el partido "Nacional vs Peñarol" NO debería mostrar botón eliminar
