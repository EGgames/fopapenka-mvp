import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled, Wait } from '@serenity-js/core';
import { Ensure, includes } from '@serenity-js/assertions';
import { By, Navigate, PageElement, Text, isVisible } from '@serenity-js/web';
import { LoginToPenca } from '../tasks/auth.tasks.js';
import { MakePrediction } from '../tasks/prediction.tasks.js';

const CEDULAS = {
  Messi: '11111111',
  Ronaldo: '22222222',
  Mbappe: '33333333',
  Neymar: '44444444',
  AdminFopa: '12345678',
};

// ID DOM asignado en el frontend para los partidos de Fecha 3 (programados)
// El frontend debe renderizar <div data-match-id="..."> por cada partido
const SCHEDULED_MATCH_DOM_ID = 'river-racing-f3'; // River Plate vs Racing Club, Fecha 3

Given('que el jugador {string} está autenticado en la penca {string}', async function (nickname, inviteCode) {
  await actorCalled(nickname).attemptsTo(
    LoginToPenca(inviteCode, nickname, CEDULAS[nickname] ?? '99999999'),
  );
});

Given('existe el partido {string} en la Fecha {int}', async function (_matchName, _fixtureNum) {
  // El partido ya existe en la DB (seeder). No se necesita acción.
});

When('pronóstica {int} a {int} a favor del local', async function (homeGoals, awayGoals) {
  await actorCalled('Ronaldo').attemptsTo(
    Navigate.to('/predictions'),
    MakePrediction(SCHEDULED_MATCH_DOM_ID, homeGoals, awayGoals),
  );
});

Then('su pronóstico debería quedar guardado como {string}', async function (expectedLabel) {
  const badge = PageElement.located(By.css(`[data-match-id="${SCHEDULED_MATCH_DOM_ID}"] .prediction-saved, [data-match-id="${SCHEDULED_MATCH_DOM_ID}"] [data-testid="prediction-badge"]`));
  await actorCalled('Ronaldo').attemptsTo(
    Wait.until(badge, isVisible()),
    Ensure.that(
      Text.of(badge),
      includes(expectedLabel),
    ),
  );
});

Given('que el partido {string} ya fue jugado con resultado {int}-{int}', async function (_matchName, _home, _away) {
  // Los partidos de Fecha 1 y 2 ya tienen estado "played" en la DB (seeder).
});

When('el jugador intenta pronosticar ese partido', async function () {
  await actorCalled('Ronaldo').attemptsTo(
    LoginToPenca('AMIGOS2026', 'Ronaldo', CEDULAS.Ronaldo),
    Navigate.to('/predictions'),
  );
});

Then('debería ver el mensaje {string}', async function (message) {
  const lockedEl = PageElement.located(By.css('.match-locked, [data-testid="match-locked"]'));
  await actorCalled('Ronaldo').attemptsTo(
    Wait.until(lockedEl, isVisible()),
    Ensure.that(
      Text.of(lockedEl),
      includes(message),
    ),
  );
});

Given('que el jugador {string} ya pronosticó {int}-{int} en {string}', async function (nickname, homeGoals, awayGoals, _matchName) {
  await actorCalled(nickname).attemptsTo(
    LoginToPenca('AMIGOS2026', nickname, CEDULAS[nickname]),
    Navigate.to('/predictions'),
    MakePrediction(SCHEDULED_MATCH_DOM_ID, homeGoals, awayGoals),
  );
});

When('cambia su pronóstico a {int}-{int}', async function (homeGoals, awayGoals) {
  await actorCalled('Ronaldo').attemptsTo(
    MakePrediction(SCHEDULED_MATCH_DOM_ID, homeGoals, awayGoals),
  );
});

Then('su pronóstico debería quedar como {string}', async function (expectedLabel) {
  const badge = PageElement.located(By.css(`[data-match-id="${SCHEDULED_MATCH_DOM_ID}"] .prediction-saved, [data-match-id="${SCHEDULED_MATCH_DOM_ID}"] [data-testid="prediction-badge"]`));
  await actorCalled('Ronaldo').attemptsTo(
    Wait.until(badge, isVisible()),
    Ensure.that(
      Text.of(badge),
      includes(expectedLabel),
    ),
  );
});
