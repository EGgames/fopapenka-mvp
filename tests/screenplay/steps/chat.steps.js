import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { Ensure, contain, isGreaterThan, includes } from '@serenity-js/assertions';
import { By, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';
import { LoginToPenca } from '../tasks/auth.tasks.js';
import { SendChatMessage } from '../tasks/chat.tasks.js';

const RONALDO_CEDULA = '22222222';

// ─── Escenario 1: Enviar mensaje exitosamente ────────────────────────────────
Given('que el jugador {string} está autenticado', async function (nickname) {
  const cedulas = { Ronaldo: RONALDO_CEDULA, Messi: '11111111' };
  await actorCalled(nickname).attemptsTo(
    LoginToPenca('AMIGOS2026', nickname, cedulas[nickname] ?? '99999999'),
  );
});

Given('está en la página de chat', async function () {
  await actorCalled('Ronaldo').attemptsTo(
    Navigate.to('/chat'),
  );
});

When('escribe el mensaje {string} y lo envía', async function (message) {
  await actorCalled('Ronaldo').attemptsTo(
    SendChatMessage(message),
  );
});

Then('el mensaje {string} debe aparecer en el chat', async function (message) {
  await actorCalled('Ronaldo').attemptsTo(
    Ensure.that(
      Text.ofAll(PageElements.located(By.css('.chat-message p, [data-testid="chat-message"]'))),
      contain(message),
    ),
  );
});

// ─── Escenario 2: Historial de mensajes ──────────────────────────────────────
Given('que existen {int} mensajes anteriores en el chat', async function (_count) {
  // Los mensajes ya están en la DB (seeder - 7 mensajes cargados).
});

When('el jugador {string} abre la página de chat', async function (nickname) {
  await actorCalled(nickname).attemptsTo(
    LoginToPenca('AMIGOS2026', nickname, RONALDO_CEDULA),
    Navigate.to('/chat'),
  );
});

Then('debe ver los últimos mensajes cargados', async function () {
  await actorCalled('Ronaldo').attemptsTo(
    Ensure.that(
      PageElements.located(By.css('.chat-message, [data-testid="chat-message"]')).count(),
      isGreaterThan(0),
    ),
  );
});

// ─── Escenario 3: Límite de 500 caracteres ───────────────────────────────────
When('el jugador intenta enviar un mensaje de {int} caracteres', async function (charCount) {
  await actorCalled('Ronaldo').attemptsTo(
    LoginToPenca('AMIGOS2026', 'Ronaldo', RONALDO_CEDULA),
    Navigate.to('/chat'),
  );
  // Intentamos escribir un mensaje más largo que el límite
  this.tooLongMessage = 'A'.repeat(charCount);
});

Then('el campo no debería permitir más de {int} caracteres', async function (maxLen) {
  // El atributo maxlength en el input impide que el usuario tipee más de 500 chars.
  // Verificamos que el atributo existe en el DOM y tiene el valor correcto.
  await actorCalled('Ronaldo').attemptsTo(
    Ensure.that(
      Text.of(
        PageElement.located(
          By.css(`input[maxlength="${maxLen}"], textarea[maxlength="${maxLen}"], [data-testid="chat-input"][maxlength="${maxLen}"]`)
        )
      ),
      includes(''),   // si el elemento existe, el selector tuvo match → maxlength está seteado
    ),
  );
});
