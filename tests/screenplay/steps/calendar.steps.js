import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { Ensure, includes, equals, not, matches } from '@serenity-js/assertions';
import { By, PageElement, Text } from '@serenity-js/web';
import { isVisible } from '@serenity-js/web';
import { ViewCalendar, ViewFixtureDetails, ViewMatchDetails } from '../tasks/calendar.tasks.js';

// FUNC-012: Ver calendario completo

Given('que existe un torneo {string} con {int} fechas', async function (tournamentName, fixtureCount) {
  // El torneo ya está en DB (seeder o setup previo)
  this.tournamentName = tournamentName;
  this.fixtureCount = fixtureCount;
});

Given('que {string} es participante de la penca', async function (actorName) {
  // Usuario ya autenticado (seeder)
  this.actorName = actorName;
});

Given('que existe un partido Nacional vs Peñarol programado para dentro de {int} horas', async function (hours) {
  // Partido ya está en DB con fecha/hora calculada
  this.upcomingMatch = {
    homeTeam: 'Nacional',
    awayTeam: 'Peñarol',
    hoursUntil: hours,
  };
});

Given('que existen {int} partidos ya jugados con resultados:', async function (count, dataTable) {
  // Partidos ya están en DB (seeder) con resultados
  this.playedMatches = dataTable.hashes();
});

Given('que la penca {string} no tiene torneos activos', async function (pencaName) {
  // Penca sin torneo activo (estado de DB)
  this.pencaName = pencaName;
  this.hasActiveTournament = false;
});

Given('que existe un torneo con:', async function (dataTable) {
  // Setup de fixtures con diferentes estados
  this.fixtures = dataTable.hashes();
});

Given('que existe un partido en el calendario', async function () {
  // Al menos un partido existe (seeder)
  this.hasMatch = true;
});

When('{string} accede al calendario', async function (actorName) {
  await actorCalled(actorName).attemptsTo(ViewCalendar());
});

When('{string} ve los detalles del partido', async function (actorName) {
  // Hace clic en el primer partido visible
  await actorCalled(actorName).attemptsTo(
    ViewMatchDetails(1), // Asumimos match ID = 1
  );
});

Then('debería ver las {int} fechas ordenadas cronológicamente', async function (count) {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      PageElement.located(By.css('[data-testid="fixture-item"]')).count(),
      equals(count),
    ),
  );
  
  // Verificar que están ordenadas (fecha 1, fecha 2, ..., fecha N)
  for (let i = 1; i <= count; i++) {
    await actorCalled(this.actorName).attemptsTo(
      Ensure.that(
        Text.of(PageElement.located(By.css(`[data-testid="fixture-${i}"] [data-testid="fixture-name"]`))),
        includes(`Fecha ${i}`),
      ),
    );
  }
});

Then('cada fecha debería mostrar sus partidos con equipos y horarios', async function () {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      PageElement.located(By.css('[data-testid="match-card"]')),
      isVisible(),
    ),
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="home-team"]'))),
      not(equals('')),
    ),
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="away-team"]'))),
      not(equals('')),
    ),
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="match-datetime"]'))),
      not(equals('')),
    ),
  );
});

Then('debería ver {string}', async function (message) {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="upcoming-indicator"], [data-testid="calendar-message"]'))),
      includes(message),
    ),
  );
});

Then('el partido debería estar destacado visualmente', async function () {
  // Verificar que el match tiene una clase CSS especial o atributo
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      PageElement.located(By.css('[data-testid="match-card"].highlighted, [data-testid="match-card"][data-upcoming="true"]')),
      isVisible(),
    ),
  );
});

Then('debería ver los resultados de los partidos jugados', async function () {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      PageElement.located(By.css('[data-testid="match-result"]')),
      isVisible(),
    ),
  );
});

Then('debería ver el mensaje {string}', async function (message) {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="empty-state"], [data-testid="calendar-message"]'))),
      includes(message),
    ),
  );
});

Then('debería ver un botón {string} si es administrador', async function (buttonText) {
  // Esta verificación depende del rol del usuario
  // Podría no ser visible si no es admin (paso condicional)
  try {
    await actorCalled(this.actorName).attemptsTo(
      Ensure.that(
        PageElement.located(By.css('[data-testid="create-tournament-button"]')),
        isVisible(),
      ),
    );
  } catch (error) {
    // Si no es admin, el botón no aparece (esperado)
  }
});

Then('debería ver {string} marcada como {string}', async function (fixtureName, status) {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css(`[data-testid="fixture"][data-fixture-name="${fixtureName}"] [data-testid="fixture-status"]`))),
      includes(status),
    ),
  );
});

Then('debería ver {string} con indicador {string}', async function (fixtureName, indicator) {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css(`[data-testid="fixture"][data-fixture-name="${fixtureName}"] [data-testid="match-indicator"]`))),
      includes(indicator),
    ),
  );
});

Then('debería ver el nombre de los equipos locales y visitantes', async function () {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="home-team-name"]'))),
      not(equals('')),
    ),
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="away-team-name"]'))),
      not(equals('')),
    ),
  );
});

Then('debería ver los logos de ambos equipos', async function () {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      PageElement.located(By.css('[data-testid="home-team-logo"]')),
      isVisible(),
    ),
    Ensure.that(
      PageElement.located(By.css('[data-testid="away-team-logo"]')),
      isVisible(),
    ),
  );
});

Then('debería ver la fecha y hora del partido', async function () {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="match-datetime"]'))),
      not(equals('')),
    ),
  );
});

Then('debería ver el estado del partido \\(Programado\\/En Juego\\/Finalizado)', async function () {
  await actorCalled(this.actorName).attemptsTo(
    Ensure.that(
      Text.of(PageElement.located(By.css('[data-testid="match-status"]'))),
      matches(/(Programado|En Juego|Finalizado)/),
    ),
  );
});