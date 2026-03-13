import { Task, Wait } from '@serenity-js/core';
import { By, Click, ExecuteScript, Navigate, PageElement } from '@serenity-js/web';
import { isVisible } from '@serenity-js/web';

/**
 * Sets the value of a number input using native setter to ensure React picks it up.
 */
const setInputValue = (selector, value) =>
  ExecuteScript.async(`
    const [sel, val, done] = arguments;
    const el = document.querySelector(sel);
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    done();
  `).withArguments(selector, String(value));

export const MakePrediction = (matchId, homeGoals, awayGoals) =>
  Task.where(`#actor pronostica ${homeGoals}-${awayGoals} en el partido ${matchId}`,
    Navigate.to('/predictions'),
    Wait.until(PageElement.located(By.css(`[data-match-id="${matchId}"] input.home-goals`)), isVisible()),
    setInputValue(`[data-match-id="${matchId}"] input.home-goals`, homeGoals),
    setInputValue(`[data-match-id="${matchId}"] input.away-goals`, awayGoals),
    Click.on(PageElement.located(By.css(`[data-match-id="${matchId}"] button.save-prediction`))),
  );
