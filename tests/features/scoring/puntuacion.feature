Feature: Sistema de puntuación
  Como jugador
  Quiero que el sistema calcule correctamente mis puntos al cargarse el resultado
  Para saber cuánto acumulé en cada partido

  @scoring
  Scenario: Acierto exacto vale 3 puntos
    Given que el jugador "Ronaldo" pronosticó 2-1 en "River vs Boca"
    When el admin carga el resultado 2-1
    Then el puntaje del jugador en ese partido debe ser 3

  @scoring
  Scenario: Acierto de resultado vale 1 punto
    Given que el jugador "Ronaldo" pronosticó 3-1 en "River vs Boca"
    When el admin carga el resultado 2-1
    Then el puntaje del jugador en ese partido debe ser 1

  @scoring
  Scenario: Fallo total vale 0 puntos
    Given que el jugador "Ronaldo" pronosticó 0-2 en "River vs Boca"
    When el admin carga el resultado 2-1
    Then el puntaje del jugador en ese partido debe ser 0
