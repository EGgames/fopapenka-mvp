Feature: Unirse a una penca con código de invitación
  Como usuario nuevo
  Quiero ingresar el código de invitación y registrarme con mi apodo y cédula
  Para poder participar en la penca

  Scenario: Registro exitoso con código válido
    Given que existe una penca con código "AMIGOS2026"
    When el usuario ingresa el código "AMIGOS2026", el apodo "Ronaldo" y la cédula "44444444"
    Then debería ingresar al dashboard de la penca "Liga Amigos"

  Scenario: Código de penca inválido
    When el usuario ingresa el código "INVALIDO99", el apodo "Test" y la cédula "12345678"
    Then debería ver el mensaje de error "Código de penca inválido o inactivo"

  Scenario: Apodo ya en uso en la penca
    Given que existe una penca con código "AMIGOS2026" con el usuario "Messi" registrado
    When el usuario ingresa el código "AMIGOS2026", el apodo "Messi" y la cédula "55555555"
    Then debería ver el mensaje de error "Ese apodo ya está en uso en esta penca"
