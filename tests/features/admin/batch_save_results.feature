Feature: Guardar todos los resultados de una fecha de una vez
  Como administrador de una penca
  Quiero poder cargar todos los resultados de una fecha con un solo click
  Para ahorrar tiempo y evitar cargar cada resultado individualmente

  Background:
    Given que "AdminUser" es administrador de la penca "Liga Test"
    And que existe un torneo activo "Apertura 2026"
    And que existe la "Fecha 1" con 5 partidos programados
    And que "AdminUser" está autenticado

  Scenario: Cargar múltiples resultados exitosamente
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    And selecciona la "Fecha 1"
    When "AdminUser" completa los resultados de 3 partidos:
      | Partido              | Resultado |
      | Nacional vs Peñarol  | 2-1       |
      | Defensor vs Cerro    | 0-0       |
      | Liverpool vs Plaza   | 3-2       |
    And "AdminUser" hace click en el botón "Guardar todos los resultados"
    Then debería ver el mensaje "✅ 3 resultados cargados. X pronósticos recalculados."
    And los 3 partidos deberían mostrar "✅ Resultado cargado"
    And el ranking debería actualizarse automáticamente con los nuevos puntos

  Scenario: Intentar guardar sin resultados completos
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    When "AdminUser" completa solo el gol local de 2 partidos
    And "AdminUser" hace click en el botón "Guardar todos los resultados"
    Then debería ver el mensaje "ℹ️ No hay resultados completos para cargar"
    And ningún resultado debería cargarse en la base de datos

  Scenario: Corregir resultados existentes con guardado masivo
    Given que la "Fecha 1" ya tiene 3 resultados cargados previamente
    And que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    When "AdminUser" modifica los 3 resultados existentes
    And "AdminUser" hace click en el botón "Guardar todos los resultados"
    Then debería ver el mensaje "✅ 3 resultados cargados. X pronósticos recalculados."
    And todos los puntos de los pronósticos deberían recalcularse
    And el ranking debería reflejar los nuevos puntos

  Scenario: Guardar resultados desde el botón inferior
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    And se desplaza hasta el final de la lista
    When "AdminUser" completa 4 resultados
    And "AdminUser" hace click en el botón inferior "Guardar todos los resultados"
    Then debería ver el mensaje "✅ 4 resultados cargados. X pronósticos recalculados."
    And ambos botones (superior e inferior) deberían funcionar igual

  Scenario: Atomicidad en guardado masivo (rollback en error)
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    When "AdminUser" completa 5 resultados
    And uno de los partidos tiene un ID inválido en el servidor
    And "AdminUser" hace click en el botón "Guardar todos los resultados"
    Then debería ver un mensaje de error "❌ Algunos partidos no existen"
    And ningún resultado debería guardarse (rollback de transacción)
    And todos los campos deberían mantener sus valores originales

  Scenario: Recálculo automático de pronósticos tras carga masiva
    Given que existen 10 jugadores con pronósticos para la "Fecha 1"
    And que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    When "AdminUser" completa los 5 resultados de la "Fecha 1"
    And "AdminUser" hace click en el botón "Guardar todos los resultados"
    Then debería ver el mensaje indicando "50 pronósticos recalculados" (10 jugadores × 5 partidos)
    And todos los jugadores deberían tener sus puntos actualizados
    And el ranking debería mostrar las nuevas posiciones

  Scenario: Validación de permisos (solo admins)
    Given que "JugadorNormal" es un jugador sin privilegios de admin
    And "JugadorNormal" intenta acceder al Panel de Administración
    Then debería ser redirigido al dashboard
    And no debería ver el tab "Resultados"
    And no debería poder acceder a la funcionalidad de carga masiva

  Scenario: Botón deshabilitado en fecha sin partidos
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    And selecciona una fecha que no tiene partidos
    Then debería ver el mensaje "Esta fecha no tiene partidos cargados."
    And el botón "Guardar todos los resultados" no debería estar visible

  Scenario: Validación visual durante el guardado masivo
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    When "AdminUser" completa 5 resultados
    And "AdminUser" hace click en el botón "Guardar todos los resultados"
    Then el botón debería cambiar a "⏳ Guardando todos los resultados..."
    And el botón debería estar deshabilitado durante el proceso
    And después de procesar debería mostrar el mensaje de éxito
    And el botón debería volver a su estado normal

  Scenario: Indicador visual de fecha completada
    Given que "AdminUser" carga todos los resultados de la "Fecha 1"
    And que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    Then la "Fecha 1" debería mostrar el ícono "✅"
    And debería poder cambiar a la "Fecha 2" para cargar más resultados

  Scenario: Log de auditoría para carga masiva
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Resultados"
    When "AdminUser" completa y guarda 5 resultados de la "Fecha 1"
    Then el sistema debería registrar en logs:
      | Campo           | Valor                                    |
      | Acción          | Carga masiva de resultados               |
      | Usuario         | AdminUser (ID)                           |
      | Fixture         | Fecha 1 (ID)                             |
      | Cantidad        | 5 resultados                             |
      | Timestamp       | <timestamp actual>                       |
      | Pronósticos     | X pronósticos recalculados               |
