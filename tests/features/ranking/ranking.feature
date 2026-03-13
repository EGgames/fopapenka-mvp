Feature: Ranking de la penca
  Como jugador
  Quiero ver la tabla de posiciones actualizada
  Para saber en qué lugar estoy

  Scenario: El ranking se actualiza al cargar resultados
    Given que existen 3 jugadores con pronósticos en la Fecha 1
    When el admin carga todos los resultados de la Fecha 1
    Then el ranking debe mostrar los 3 jugadores con sus puntos actualizados

  Scenario: Mi posición se resalta en el ranking
    Given que el jugador "Ronaldo" está en el 2do lugar con 9 puntos
    When accede a la página de ranking
    Then su fila debe estar resaltada visualmente

  Scenario: Ranking acumulado suma puntos de todos los torneos
    Given que el jugador "Ronaldo" tiene 15 puntos en el torneo "Apertura" y 8 en "Clausura"
    When accede al ranking acumulado
    Then debería ver 10 puntos totales para "Ronaldo"
