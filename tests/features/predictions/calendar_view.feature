Feature: Visualización del calendario completo
  Como participante de una penca
  Quiero ver el calendario completo del torneo con todos los partidos
  Para conocer la programación y planificar mis predicciones

  Scenario: Ver calendario de torneo activo
    Given que existe un torneo "Apertura 2026" con 5 fechas
    And "Diego" es participante de la penca
    When "Diego" accede al calendario
    Then debería ver las 5 fechas ordenadas cronológicamente
    And cada fecha debería mostrar sus partidos con equipos y horarios

  Scenario: Indicadores de tiempo en partidos próximos
    Given que existe un partido Nacional vs Peñarol programado para dentro de 3 horas
    When "Laura" accede al calendario
    Then debería ver "Próximo partido en 3 horas"
    And el partido debería estar destacado visualmente

  Scenario: Partidos pasados con resultados
    Given que existen 2 partidos ya jugados con resultados:
      | Equipo Local | Equipo Visitante | Resultado |
      | Nacional     | Peñarol          | 2-1       |
      | Defensor     | Wanderers        | 0-0       |
    When "Fernando" accede al calendario
    Then debería ver los resultados de los partidos jugados
    And debería ver "Nacional 2 - 1 Peñarol"
    And debería ver "Defensor 0 - 0 Wanderers"

  Scenario: No hay torneo activo
    Given que la penca "Liga Cerrada" no tiene torneos activos
    When "Martín" accede al calendario
    Then debería ver el mensaje "No hay torneo activo en esta penca"
    And debería ver un botón "Crear torneo" si es administrador

  Scenario: Calendario con partidos futuros y pasados mezclados
    Given que existe un torneo con:
      | Fecha   | Partido              | Estado     |
      | Fecha 1 | Nacional vs Peñarol  | Jugado     |
      | Fecha 2 | Defensor vs Cerro    | Próximo    |
      | Fecha 3 | Liverpool vs Plaza   | Programado |
    When "Carolina" accede al calendario
    Then debería ver "Fecha 1" marcada como "Completada"
    And debería ver "Fecha 2" con indicador "Próximo partido"
    And debería ver "Fecha 3" con indicador "Programado"

  Scenario: Información completa de cada partido
    Given que existe un partido en el calendario
    When "Rodrigo" ve los detalles del partido
    Then debería ver el nombre de los equipos locales y visitantes
    And debería ver los logos de ambos equipos
    And debería ver la fecha y hora del partido
    And debería ver el estado del partido (Programado/En Juego/Finalizado)
