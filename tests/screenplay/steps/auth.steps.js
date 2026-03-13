import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { Ensure, includes } from '@serenity-js/assertions';
import { By, PageElement, Text } from '@serenity-js/web';
import { JoinPenca } from '../tasks/auth.tasks.js';

// Flag per escenario: si el nickname debe ser único para evitar conflictos con el seeder
let useUniqueNickname = false;

Given('que existe una penca con código {string}', async function (_code) {
  useUniqueNickname = true;
});

Given('que existe una penca con código {string} con el usuario {string} registrado', async function (_code, _existingUser) {
  // El usuario ya está registrado en la DB (seeder). No se necesita acción.
  useUniqueNickname = false;
});

When(
  'el usuario ingresa el código {string}, el apodo {string} y la cédula {string}',
  async function (inviteCode, nickname, cedula) {
    // Para el escenario de registro válido se usa un nickname único (no choca con el seeder).
    // Para el de duplicado se usa el nickname tal cual (ya existe en la DB).
    const finalNickname = useUniqueNickname
      ? `${nickname}_${Date.now()}`
      : nickname;

    await actorCalled('Visitante').attemptsTo(
      JoinPenca(inviteCode, finalNickname, cedula),
    );
  },
);

Then('debería ingresar al dashboard de la penca {string}', async function (pencaName) {
  await actorCalled('Visitante').attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="penca-name"]'))),
      includes(pencaName),
    ),
  );
});

Then('debería ver el mensaje de error {string}', async function (message) {
  await actorCalled('Visitante').attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css('[role="alert"], .error-message, .text-red-500, p.error'))),
      includes(message),
    ),
  );
});
