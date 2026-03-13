Feature: Chat general de la penca
  Como jugador registrado
  Quiero enviar y recibir mensajes en el chat de la penca
  Para interactuar con otros participantes

  Scenario: Enviar un mensaje exitosamente
    Given que el jugador "Ronaldo" está autenticado
    And está en la página de chat
    When escribe el mensaje "¡Vamos River!" y lo envía
    Then el mensaje "¡Vamos River!" debe aparecer en el chat

  Scenario: Los mensajes anteriores cargan al abrir el chat
    Given que existen 10 mensajes anteriores en el chat
    When el jugador "Ronaldo" abre la página de chat
    Then debe ver los últimos mensajes cargados

  Scenario: Mensaje demasiado largo es rechazado
    When el jugador intenta enviar un mensaje de 501 caracteres
    Then el campo no debería permitir más de 500 caracteres
