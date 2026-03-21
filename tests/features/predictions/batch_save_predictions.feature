Feature: Guardar todos los pronósticos de una vez
  Como jugador de una penca
  Quiero poder guardar todos mis pronósticos pendientes con un solo click
  Para ahorrar tiempo y evitar guardar cada partido individualmente

  Background:
    Given que existe una penca "Liga Test" con código "TEST2026"
    And que existe un torneo activo "Apertura 2026"
    And que existen 5 partidos programados distribuidos en 2 fechas
    And que "Pedro" es un jugador registrado en la penca

  Scenario: Guardar múltiples pronósticos pendientes exitosamente
    Given que "Pedro" inicia sesión
    And "Pedro" navega a la vista de Pronósticos
    When "Pedro" completa pronósticos para 3 partidos diferentes:
      | Partido              | Pronóstico |
      | Nacional vs Peñarol  | 2-1        |
      | Defensor vs Cerro    | 1-1        |
      | Liverpool vs Plaza   | 3-0        |
    And "Pedro" hace click en el botón "Guardar todos los pronósticos"
    Then debería ver el mensaje "✅ 3 pronósticos guardados exitosamente"
    And los 3 partidos deberían mostrar el badge azul con el pronóstico guardado
    And la vista de pronósticos debería recargarse automáticamente

  Scenario: Intentar guardar sin pronósticos completos
    Given que "María" inicia sesión
    And "María" navega a la vista de Pronósticos
    When "María" completa solo el gol local de 2 partidos
    And "María" hace click en el botón "Guardar todos los pronósticos"
    Then debería ver el mensaje "ℹ️ No hay pronósticos pendientes para guardar"
    And ningún pronóstico debería guardarse

  Scenario: Actualizar pronósticos existentes con guardado masivo
    Given que "Carlos" tiene 3 pronósticos ya guardados previamente
    And "Carlos" inicia sesión
    And "Carlos" navega a la vista de Pronósticos
    When "Carlos" modifica los 3 pronósticos existentes a nuevos valores
    And "Carlos" hace click en el botón "Guardar todos los pronósticos"
    Then debería ver el mensaje "✅ 3 pronósticos guardados exitosamente"
    And los badges azules deberían mostrar los nuevos valores actualizados

  Scenario: Guardar pronósticos desde el botón inferior
    Given que "Ana" inicia sesión
    And "Ana" navega a la vista de Pronósticos
    And se desplaza hasta el final de la lista de partidos
    When "Ana" completa 2 pronósticos
    And "Ana" hace click en el botón inferior "Guardar todos los pronósticos"
    Then debería ver el mensaje "✅ 2 pronósticos guardados exitosamente"
    And ambos botones (superior e inferior) deberían funcionar igual

  Scenario: Ignorar partidos ya jugados en el guardado masivo
    Given que existen 3 partidos programados y 2 partidos ya jugados
    And "Luis" inicia sesión
    And "Luis" navega a la vista de Pronósticos
    When "Luis" intenta completar pronósticos en todos los partidos visibles
    And "Luis" hace click en el botón "Guardar todos los pronósticos"
    Then solo los 3 pronósticos de partidos programados deberían guardarse
    And debería ver el mensaje "✅ 3 pronósticos guardados exitosamente"
    And los 2 partidos jugados no deberían aceptar valores

  Scenario: Validación de tiempo en guardado masivo
    Given que existen 4 partidos programados
    And 2 de esos partidos tienen fecha/hora de inicio en el pasado
    And "Roberto" inicia sesión
    And "Roberto" navega a la vista de Pronósticos
    When "Roberto" completa pronósticos para los 4 partidos
    And "Roberto" hace click en el botón "Guardar todos los pronósticos"
    Then solo los 2 pronósticos con tiempo válido deberían guardarse
    And debería ver el mensaje "✅ 2 pronósticos guardados exitosamente"

  Scenario: Botón deshabilitado cuando todos los pronósticos están guardados
    Given que "Sofía" tiene todos los pronósticos ya guardados
    And "Sofía" inicia sesión
    And "Sofía" navega a la vista de Pronósticos
    Then el botón "Guardar todos los pronósticos" no debería estar visible
    And debería ver badges azules en todos los partidos pendientes

  Scenario: Manejo de errores en guardado masivo
    Given que "Diego" inicia sesión
    And "Diego" navega a la vista de Pronósticos
    And el servidor backend está temporalmente no disponible
    When "Diego" completa 3 pronósticos
    And "Diego" hace click en el botón "Guardar todos los pronósticos"
    Then debería ver un mensaje de error "❌ Error al guardar pronósticos"
    And ningún pronóstico debería marcarse como guardado
    And "Diego" debería poder reintentar el guardado

  Scenario: Validación visual durante el guardado masivo
    Given que "Laura" inicia sesión
    And "Laura" navega a la vista de Pronósticos
    When "Laura" completa 5 pronósticos
    And "Laura" hace click en el botón "Guardar todos los pronósticos"
    Then el botón debería cambiar a "⏳ Guardando todos los pronósticos..."
    And el botón debería estar deshabilitado durante el proceso
    And después de 2 segundos debería mostrar el mensaje de éxito
    And el botón debería volver a su estado normal
