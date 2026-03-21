Feature: Acceso a múltiples pencas
  Como usuario registrado en múltiples pencas
  Quiero ver la lista de todas mis pencas activas
  Para poder navegar entre ellas

  Scenario: Ver lista de pencas donde participo
    Given que "Juan" está registrado en 3 pencas diferentes
    When "Juan" accede a la vista de "Mis Pencas"
    Then debería ver una lista con 3 pencas
    And cada penca debería mostrar su nombre, código y rol

  Scenario: Cambiar de contexto entre pencas
    Given que "Maria" está registrada en "Penca A" y "Penca B"
    And "Maria" está actualmente en "Penca A"
    When "Maria" selecciona "Penca B" desde "Mis Pencas"
    Then debería ver el dashboard de "Penca B"
    And el contexto activo debería ser "Penca B"

  Scenario: Usuario sin pencas activas
    Given que "Pedro" no está registrado en ninguna penca activa
    When "Pedro" accede a la vista de "Mis Pencas"
    Then debería ver el mensaje "No tienes pencas activas"
    And debería ver un botón para unirse a una nueva penca

  Scenario: Mostrar roles diferenciados
    Given que "Ana" es admin en "Penca Familia" y jugador en "Penca Amigos"
    When "Ana" accede a la vista de "Mis Pencas"
    Then debería ver "Penca Familia" con etiqueta "Administrador"
    And debería ver "Penca Amigos" con etiqueta "Jugador"
