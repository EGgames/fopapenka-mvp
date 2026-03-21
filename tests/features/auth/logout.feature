Feature: Cerrar sesión
  Como usuario autenticado
  Quiero poder cerrar sesión de forma segura
  Para proteger mi cuenta cuando uso dispositivos compartidos

  Scenario: Cerrar sesión exitosamente
    Given que "Pablo" está autenticado en la penca "Liga Amigos"
    When "Pablo" cierra sesión desde el menú de usuario
    Then debería ser redirigido a la página de login
    And su token de sesión debería quedar invalidado
    And no debería poder acceder a rutas protegidas sin autenticarse nuevamente

  Scenario: Intentar acceder a rutas protegidas después de logout
    Given que "Valentina" cerró sesión hace 1 minuto
    When "Valentina" intenta acceder al dashboard sin autenticarse
    Then debería ser redirigida a la página de login
    And debería ver el mensaje "Debes iniciar sesión para continuar"

  Scenario: Logout desde múltiples dispositivos
    Given que "Gabriel" está autenticado en su computadora y su celular
    When "Gabriel" cierra sesión en su computadora
    Then debería mantener su sesión activa en el celular
    And cada dispositivo debería manejar sesiones independientes

  Scenario: Logout con tiempo de sesión expirado
    Given que "Andrea" inició sesión hace 25 horas
    And el tiempo de expiración del token es 24 horas
    When "Andrea" intenta cerrar sesión
    Then debería ser redirigida automáticamente al login
    And debería ver el mensaje "Tu sesión ha expirado"

  Scenario: Acceso al botón de logout solo para usuarios autenticados
    Given que un usuario no autenticado visita la aplicación
    When el usuario intenta acceder a la página principal
    Then no debería ver el botón de "Cerrar sesión"
    And debería ser redirigido al formulario de login
