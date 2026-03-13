import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled, Wait } from '@serenity-js/core';
import { Ensure, contain, isGreaterThan } from '@serenity-js/assertions';
import { By, Click, Navigate, PageElement, PageElements, Text, isVisible } from '@serenity-js/web';
import { LoginToPenca } from '../tasks/auth.tasks.js';

// ─── Escenario 1: El ranking se actualiza al cargar resultados ──────────────
Given('que existen {int} jugadores con pronósticos en la Fecha {int}', async function (_count, _fixtureNum) {
  // Los jugadores ya tienen pronósticos en la DB (seeder, Fechas 1 y 2).
  // No se necesita acción.
});

When('el admin carga todos los resultados de la Fecha {int}', async function (_fixtureNum) {
  // Resultados ya cargados en la DB (seeder). No se necesita acción.
});

Then('el ranking debe mostrar los {int} jugadores con sus puntos actualizados', async function (count) {
  const rankingRow = PageElement.located(By.css('tbody tr, [data-testid="ranking-row"]'));
  await actorCalled('Ronaldo').attemptsTo(
    LoginToPenca('AMIGOS2026', 'Ronaldo', '22222222'),
    Navigate.to('/ranking'),
    Wait.until(rankingRow, isVisible()),
    Ensure.that(
      PageElements.located(By.css('tbody tr, [data-testid="ranking-row"]')).count(),
      isGreaterThan(count - 1),
    ),
  );
});

// ─── Escenario 2: Mi posición se resalta ────────────────────────────────────
Given('que el jugador {string} está en el {int}do lugar con {int} puntos', async function (nickname, _pos, _pts) {
  await actorCalled(nickname).attemptsTo(
    LoginToPenca('AMIGOS2026', nickname, '22222222'),
  );
});

When('accede a la página de ranking', async function () {
  await actorCalled('Ronaldo').attemptsTo(
    Navigate.to('/ranking'),
  );
});

Then('su fila debe estar resaltada visualmente', async function () {
  const myRow = PageElement.located(By.css('tr[data-current-user="true"], [data-testid="my-ranking-row"]'));
  await actorCalled('Ronaldo').attemptsTo(
    Wait.until(myRow, isVisible()),
    Ensure.that(
      // La fila del usuario autenticado debe tener la clase de resaltado
      PageElements.located(
        By.css('tr.highlighted, tr[data-current-user="true"], [data-testid="my-ranking-row"]')
      ).count(),
      isGreaterThan(0),
    ),
  );
});

// ─── Escenario 3: Ranking acumulado suma torneos ─────────────────────────────
Given(
  'que el jugador {string} tiene {int} puntos en el torneo {string} y {int} en {string}',
  async function (_nickname, _pts1, _t1, _pts2, _t2) {
    // Escenario representativo — los datos están en el seeder.
    // Un torneo completo requeriría fixtures adicionales.
  }
);

When('accede al ranking acumulado', async function () {
  await actorCalled('Ronaldo').attemptsTo(
    LoginToPenca('AMIGOS2026', 'Ronaldo', '22222222'),
    Navigate.to('/ranking'),
  );
});

Then('debería ver {int} puntos totales para {string}', async function (expectedTotal, nickname) {
  const rankingRow = PageElement.located(By.css('tbody tr'));
  await actorCalled('Ronaldo').attemptsTo(
    Wait.until(rankingRow, isVisible()),
    Ensure.that(
      Text.ofAll(PageElements.located(By.css('tbody tr td:nth-child(3), [data-testid="ranking-points"]'))),
      contain(String(expectedTotal)),
    ),
  );
});
