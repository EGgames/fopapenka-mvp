Feature: Ver fecha y hora de partidos en el calendario
  Como jugador de una penca
  Quiero ver la fecha y hora asignada a cada partido en el calendario
  Para saber cuándo se juega y organizar mis pronósticos a tiempo

  Background:
    Given que "Ronaldo" es jugador de la penca "Liga Test"
    And que existe un torneo activo "Apertura 2026"
    And que existe la "Fecha 1" con los siguientes partidos:
      | Local     | Visitante | Fecha              | Hora  |
      | Nacional  | Peñarol   | 25 de marzo 2026   | 18:00 |
      | Defensor  | Wanderers | 26 de marzo 2026   | 20:30 |
    And que "Ronaldo" está autenticado

  Scenario: Ver fecha y hora de partidos programados
    When "Ronaldo" navega a "Calendario"
    Then debería ver el partido "Nacional vs Peñarol"
    And debería ver la fecha "mar 25 mar" y hora "18:00 hs" de ese partido
    And debería ver el partido "Defensor vs Wanderers"
    And debería ver la fecha "mié 26 mar" y hora "20:30 hs" de ese partido

  Scenario: Partido sin fecha asignada no muestra fecha/hora
    Given que el partido "Liverpool vs Cerro" no tiene fecha asignada
    When "Ronaldo" navega a "Calendario"
    Then el partido "Liverpool vs Cerro" no debería mostrar fecha ni hora

  Scenario: Partido jugado muestra resultado y fecha/hora
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    When "Ronaldo" navega a "Calendario"
    Then debería ver el resultado "2 - 1" del partido
    And debería ver la fecha y hora del partido debajo del resultado

  Scenario: Formato de fecha y hora es localizado a español
    When "Ronaldo" navega a "Calendario"
    Then la fecha debería mostrarse en formato corto español (ej. "mar 25 mar")
    And la hora debería mostrarse en formato 24h con "hs" (ej. "18:00 hs")
