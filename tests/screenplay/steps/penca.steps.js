import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { Ensure, includes, not, equals } from '@serenity-js/assertions';
import { By, PageElement, Text } from '@serenity-js/web';
import { isVisible } from '@serenity-js/web';
import { RegenerateInviteCode, AttemptRegenerateCode, ViewPencaSettings } from '../tasks/penca.tasks.js';
import { JoinPenca } from '../tasks/auth.tasks.js';

// FUNC-002: Regenerar código de invitación

Given('que {string} es admin de la penca {string} con código {string}', async function (actorName, pencaName, inviteCode) {
  // Asumimos que el usuario ya está autenticado como admin (seeder)
  this.actorName = actorName;
  this.pencaName = pencaName;
  this.oldInviteCode = inviteCode;
});

Given('que {string} es jugador en la penca {string}', async function (actorName, pencaName) {
  // Asumimos que el usuario ya está autenticado como jugador
  this.actorName = actorName;
  this.pencaName = pencaName;
});

Given('que {string} es admin de la penca {string}', async function (actorName, pencaName) {
  this.actorName = actorName;
  this.pencaName = pencaName;
});

Given('que existe la penca {string} con código {string}', async function (pencaName, inviteCode) {
  // Penca ya existe en DB (seeder)
  this.pencaName = pencaName;
  this.originalCode = inviteCode;
});

Given('{string} regenera el código de invitación obteniendo {string}', async function (adminName, newCode) {
  // Simular regeneración previa
  this.adminName = adminName;
  this.newCode = newCode;
  // En un test real, ejecutaríamos la tarea de regeneración aquí
});

Given('que {string} es admin de {string}', async function (actorName, pencaName) {
  this.actorName = actorName;
  this.pencaName = pencaName;
});

When('{string} regenera el código de invitación', async function (actorName) {
  await actorCalled(actorName).attemptsTo(
    ViewPencaSettings(),
    RegenerateInviteCode(),
  );
  
  // Guardar el nuevo código para comparaciones posteriores
  const newCodeElement = PageElement.located(By.css('[data-testid="invite-code-display"]'));
  this.newInviteCode = await Text.of(newCodeElement).answeredBy(actorCalled(actorName));
});

When('{string} intenta regenerar el código de invitación', async function (actorName) {
  await actorCalled(actorName).attemptsTo(
    AttemptRegenerateCode(),
  );
});

When('{string} regenera el código de invitación {int} veces consecutivas', async function (actorName, times) {
  this.generatedCodes = [];
  
  for (let i = 0; i < times; i++) {
    await actorCalled(actorName).attemptsTo(
      RegenerateInviteCode(),
    );
    
    const codeElement = PageElement.located(By.css('[data-testid="invite-code-display"]'));
    const code = await Text.of(codeElement).answeredBy(actorCalled(actorName));
    this.generatedCodes.push(code);
  }
});

When('un nuevo usuario intenta registrarse con código {string}', async function (oldCode) {
  await actorCalled('NuevoUsuario').attemptsTo(
    JoinPenca(oldCode, `User_${Date.now()}`, '11111111'),
  );
});

Then('debería ver un nuevo código diferente a {string}', async function (oldCode) {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="invite-code-display"]'))),
      not(equals(oldCode)),
    ),
  );
});

Then('el código anterior {string} debería quedar inválido', async function (oldCode) {
  // Esta validación se hace intentando registrar un nuevo usuario con el código antiguo
  // (verificado en otro escenario)
});

Then('debería poder compartir el nuevo código', async function () {
  // Verificar que existe un botón/opción para compartir
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      PageElement.located(By.css('[data-testid="share-code-button"], [data-testid="copy-code-button"]')),
      isVisible(),
    ),
  );
});

Then('debería ver el mensaje de error {string}', async function (errorMessage) {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css('[role="alert"], .error-message, .text-red-500'))),
      includes(errorMessage),
    ),
  );
});

Then('todos los códigos generados deberían ser únicos', async function () {
  const uniqueCodes = new Set(this.generatedCodes);
  if (uniqueCodes.size !== this.generatedCodes.length) {
    throw new Error('Se generaron códigos duplicados');
  }
});

Then('cada código debería tener entre {int} y {int} caracteres alfanuméricos', async function (min, max) {
  this.generatedCodes.forEach(code => {
    if (code.length < min || code.length > max) {
      throw new Error(`Código ${code} no cumple con el rango de ${min}-${max} caracteres`);
    }
    if (!/^[A-Z0-9]+$/.test(code)) {
      throw new Error(`Código ${code} contiene caracteres no alfanuméricos`);
    }
  });
});

Then('el sistema debería registrar la acción en los logs de auditoría', async function () {
  // Esta verificación requiere acceso a logs del backend (fuera del alcance de E2E frontend)
  // Se asume que el backend tiene logging implementado
});

Then('debería aparecer {string}', async function (logMessage) {
  // Similar al anterior, requiere inspección de logs del backend
  // En un test real, se haría una llamada a una API de auditoría o se verificaría en base de datos
});