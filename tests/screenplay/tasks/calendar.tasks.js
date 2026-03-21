import { Task, Wait, Duration } from '@serenity-js/core';
import { By, Navigate, PageElement } from '@serenity-js/web';
import { isVisible } from '@serenity-js/web';

// FUNC-012: Ver calendario completo
const CalendarView = () => PageElement.located(By.css('[data-testid="calendar-view"]'));
const FixtureList = () => PageElement.located(By.css('[data-testid="fixture-list"]'));
const MatchCard = () => PageElement.located(By.css('[data-testid="match-card"]'));

export const ViewCalendar = () =>
  Task.where(`#actor accede al calendario del torneo`,
    Navigate.to('/calendar'),
    Wait.upTo(Duration.ofSeconds(10)).until(CalendarView(), isVisible()),
  );

export const ViewFixtureDetails = (fixtureNumber) =>
  Task.where(`#actor ve los detalles de la Fecha ${fixtureNumber}`,
    Navigate.to('/calendar'),
    Wait.upTo(Duration.ofSeconds(10)).until(
      PageElement.located(By.css(`[data-testid="fixture-${fixtureNumber}"]`)),
      isVisible()
    ),
  );

export const ViewMatchDetails = (matchId) =>
  Task.where(`#actor ve los detalles del partido ${matchId}`,
    Navigate.to(`/calendar/match/${matchId}`),
    Wait.upTo(Duration.ofSeconds(10)).until(MatchCard(), isVisible()),
  );
