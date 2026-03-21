import { Task, Wait, Duration } from '@serenity-js/core';
import { By, Click, Navigate, PageElement } from '@serenity-js/web';
import { isVisible } from '@serenity-js/web';

// FUNC-002: Regenerar código de invitación
const RegenerateCodeButton = () => PageElement.located(By.css('[data-testid="regenerate-code-button"]'));
const NewCodeDisplay = () => PageElement.located(By.css('[data-testid="invite-code-display"]'));
const ConfirmRegenerateButton = () => PageElement.located(By.css('[data-testid="confirm-regenerate"]'));

export const RegenerateInviteCode = () =>
  Task.where(`#actor regenera el código de invitación`,
    Navigate.to('/penca/settings'),
    Click.on(RegenerateCodeButton()),
    Click.on(ConfirmRegenerateButton()),
    Wait.upTo(Duration.ofSeconds(10)).until(NewCodeDisplay(), isVisible()),
  );

export const AttemptRegenerateCode = () =>
  Task.where(`#actor intenta regenerar el código sin permisos`,
    Navigate.to('/penca/settings'),
    Click.on(RegenerateCodeButton()),
  );

// Helpers para verificación
export const ViewPencaSettings = () =>
  Task.where(`#actor accede a la configuración de la penca`,
    Navigate.to('/penca/settings'),
    Wait.upTo(Duration.ofSeconds(10)).until(
      PageElement.located(By.css('[data-testid="penca-settings"]')), 
      isVisible()
    ),
  );
