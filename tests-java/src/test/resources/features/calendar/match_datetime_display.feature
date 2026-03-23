Feature: Ver fecha y hora de partidos en el calendario
  Como jugador de una penca
  Quiero ver la fecha y hora asignada a cada partido en el calendario
  Para saber cuándo se juega y organizar mis pronósticos a tiempo

  Background:
    Given que "Ronaldo" es jugador de la penca "Liga Test"
    And que existe un torneo activo "Apertura 2026"
    And que existe la "Fecha 1" con partidos con fecha y hora asignada
    And que "Ronaldo" está autenticado

  Scenario: Ver fecha y hora de partidos programados
    When "Ronaldo" navega a "Calendario"
    Then debería ver la fecha y hora de cada partido debajo de los equipos

  Scenario: Partido sin fecha asignada no muestra fecha ni hora
    Given que el partido "Liverpool vs Cerro" no tiene fecha asignada
    When "Ronaldo" navega a "Calendario"
    Then el partido "Liverpool vs Cerro" no debería mostrar línea de fecha/hora

  Scenario: Partido jugado conserva la fecha y hora visible
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    When "Ronaldo" navega a "Calendario"
    Then debería ver el resultado "2 - 1" junto con la fecha y hora del partido
