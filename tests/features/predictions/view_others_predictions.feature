Feature: Ver pronósticos de otros jugadores
  Como jugador de una penca
  Quiero poder ver los pronósticos de otros participantes después del resultado
  Para comparar mis predicciones con las de los demás

  Background:
    Given que "Ronaldo" es jugador de la penca "Liga Test"
    And que existe un torneo activo "Apertura 2026"
    And que existe la "Fecha 1" con el partido "Nacional vs Peñarol"
    And que "Ronaldo" está autenticado

  # ─── PARTIDO JUGADO (VISIBLE) ──────────────────────────

  Scenario: Ver pronósticos de otros tras resultado cargado
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    And que "Juan" pronosticó 2-1 (3 puntos)
    And que "Pedro" pronosticó 1-0 (1 punto)
    And que "Ana" pronosticó 0-3 (0 puntos)
    When "Ronaldo" navega a "Mis pronósticos"
    And hace click en "👁 Ver pronósticos" del partido "Nacional vs Peñarol"
    Then debería ver una tabla con los pronósticos de todos los jugadores
    And la tabla debería mostrar "Juan" con "2 - 1" y "3" puntos
    And la tabla debería mostrar "Pedro" con "1 - 0" y "1" punto
    And la tabla debería mostrar "Ana" con "0 - 3" y "0" puntos
    And los pronósticos deberían estar ordenados por puntos de mayor a menor

  Scenario: Cerrar la tabla de pronósticos de otros
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    And que "Ronaldo" tiene la tabla de pronósticos visible
    When "Ronaldo" hace click en "▲ Cerrar"
    Then la tabla de pronósticos de otros debería ocultarse

  # ─── PARTIDO NO JUGADO (PROTEGIDO) ─────────────────────

  Scenario: No se pueden ver pronósticos ajenos antes del resultado
    Given que el partido "Nacional vs Peñarol" está en estado "scheduled"
    When "Ronaldo" navega a "Mis pronósticos"
    Then el botón "👁 Ver pronósticos" NO debería estar visible para ese partido
    And solo debería ver sus propios pronósticos

  Scenario: Sin pronósticos cargados para un partido
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    And que nadie pronosticó el partido
    When "Ronaldo" hace click en "👁 Ver pronósticos" del partido "Nacional vs Peñarol"
    Then debería ver el mensaje "Nadie pronosticó este partido."

  # ─── TABLA COMPARATIVA ─────────────────────────────────

  Scenario: La tabla muestra colores según puntuación
    Given que el partido "Nacional vs Peñarol" tiene resultado 2-1
    And que "Juan" obtuvo 3 puntos (exacto)
    And que "Pedro" obtuvo 1 punto (resultado correcto)
    And que "Ana" obtuvo 0 puntos (falló)
    When "Ronaldo" abre la tabla de pronósticos
    Then los puntos de "Juan" deberían mostrarse en color verde
    And los puntos de "Pedro" deberían mostrarse en color amarillo
    And los puntos de "Ana" deberían mostrarse en color rojo
