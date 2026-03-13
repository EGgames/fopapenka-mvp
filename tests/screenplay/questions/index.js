import { Question } from '@serenity-js/core';
import { By, PageElement, PageElements, Text } from '@serenity-js/web';

export const TheRankingPosition = (nickname) =>
  Question.about(`la posición de ${nickname} en el ranking`, async (actor) => {
    const rows = await PageElements.located(By.css('tbody tr')).answeredBy(actor);
    const texts = await Text.ofAll(rows).answeredBy(actor);
    const pos = texts.findIndex((t) => t.includes(nickname));
    return pos === -1 ? null : pos + 1;
  });

export const TheScore = (matchId) =>
  Question.about(`el puntaje del pronóstico en el partido ${matchId}`, async (actor) =>
    Text.of(PageElement.located(By.css(`[data-match-id="${matchId}"] .score-badge`))).answeredBy(actor)
  );

export const TheChatMessages = () =>
  Text.ofAll(PageElement.located(By.css('.chat-message p')));
