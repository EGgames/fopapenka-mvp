Feature: Regenerar código de invitación
  Como administrador de una penca
  Quiero regenerar el código de invitación
  Para invalidar códigos compartidos públicamente y mantener control del acceso

  Scenario: Regenerar código exitosamente
    Given que "Carlos" es admin de la penca "Liga Oficina" con código "OFICINA26"
    When "Carlos" regenera el código de invitación
    Then debería ver un nuevo código diferente a "OFICINA26"
    And el código anterior "OFICINA26" debería quedar inválido
    And debería poder compartir el nuevo código

  Scenario: Intentar regenerar código sin privilegios de admin
    Given que "Luis" es jugador en la penca "Liga Barrio"
    When "Luis" intenta regenerar el código de invitación
    Then debería ver el mensaje de error "No tienes permisos para esta acción"

  Scenario: Nuevo código es único
    Given que "Sofía" es admin de la penca "Mundial 2026"
    When "Sofía" regenera el código de invitación 5 veces consecutivas
    Then todos los códigos generados deberían ser únicos
    And cada código debería tener entre 6 y 8 caracteres alfanuméricos

  Scenario: El código anterior no permite nuevos registros
    Given que existe la penca "Penca Test" con código "TEST123"
    And "Admin" regenera el código de invitación obteniendo "NEWCODE"
    When un nuevo usuario intenta registrarse con código "TEST123"
    Then debería ver el mensaje "Código de penca inválido o inactivo"

  Scenario: Auditoría de cambios de código
    Given que "Roberto" es admin de "Penca Champions"
    When "Roberto" regenera el código de invitación
    Then el sistema debería registrar la acción en los logs de auditoría
    And debería aparecer "Código de invitación regenerado por Roberto"
