Feature: Pronosticar resultado de un partido
  Como jugador inscrito en una penca
  Quiero ingresar mi pronóstico para cada partido
  Para acumular puntos cuando acierte

  Scenario: Pronosticar un partido programado
    Given que el jugador "Ronaldo" está autenticado en la penca "AMIGOS2026"
    And existe el partido "River vs Boca" en la Fecha 1
    When pronóstica 2 a 1 a favor del local
    Then su pronóstico debería quedar guardado como "2 - 1"

  Scenario: No se puede pronosticar un partido ya jugado
    Given que el partido "River vs Boca" ya fue jugado con resultado 1-0
    When el jugador intenta pronosticar ese partido
    Then debería ver el mensaje "No se puede pronosticar un partido ya jugado"

  Scenario: Editar un pronóstico antes del partido
    Given que el jugador "Ronaldo" ya pronosticó 1-0 en "River vs Boca"
    When cambia su pronóstico a 3-1
    Then su pronóstico debería quedar como "3 - 1"
