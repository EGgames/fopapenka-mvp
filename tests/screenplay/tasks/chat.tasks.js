import { Task } from '@serenity-js/core';
import { By, Click, Enter, Navigate, PageElement } from '@serenity-js/web';

export const SendChatMessage = (message) =>
  Task.where(`#actor envía el mensaje "${message}" en el chat`,
    Navigate.to('/chat'),
    Enter.theValue(message).into(PageElement.located(By.css('[data-testid="chat-input"]'))),
    Click.on(PageElement.located(By.css('button[type="submit"]'))),
  );
