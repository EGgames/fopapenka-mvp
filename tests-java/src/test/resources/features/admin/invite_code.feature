Feature: Ver código de invitación y regenerar
  Como administrador de una penca
  Quiero ver el código de invitación actual y poder regenerarlo
  Para compartirlo con nuevos jugadores o invalidar un código filtrado

  Background:
    Given que "AdminUser" es administrador de la penca "Liga Test"
    And que "AdminUser" está autenticado

  Scenario: Ver el código de invitación en el panel admin
    Given que "AdminUser" navega al Panel de Administración
    When selecciona el tab "Jugadores"
    Then debería ver el código de invitación actual de la penca
    And el código debería mostrarse en formato grande y visible

  Scenario: Copiar el código de invitación al portapapeles
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Jugadores"
    When "AdminUser" hace click en el botón "Copiar"
    Then el botón debería cambiar a "Copiado"
    And el código debería estar en el portapapeles

  Scenario: Regenerar código de invitación exitosamente
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Jugadores"
    And el código actual es "OLDCODE1"
    When "AdminUser" hace click en "Regenerar código"
    And confirma la regeneración en el diálogo
    Then el código de invitación debería cambiar
    And el nuevo código debería ser diferente a "OLDCODE1"

  Scenario: Cancelar regeneración de código
    Given que "AdminUser" navega al Panel de Administración
    And selecciona el tab "Jugadores"
    And el código actual es "OLDCODE1"
    When "AdminUser" hace click en "Regenerar código"
    And cancela la regeneración en el diálogo
    Then el código debería seguir siendo "OLDCODE1"
