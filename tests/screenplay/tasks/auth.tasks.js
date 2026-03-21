import { Task, Wait, Duration } from '@serenity-js/core';
import { By, Click, Enter, Navigate, PageElement } from '@serenity-js/web';
import { isVisible } from '@serenity-js/web';

// Matches dashboard (penca-name in Layout header) OR error alert on register page
const SubmitOutcome = () => PageElement.located(By.css('[data-testid="penca-name"], [role="alert"]'));

// Only matches the dashboard (used for login where we always expect success)
const DashboardIndicator = () => PageElement.located(By.css('[data-testid="penca-name"]'));

export const JoinPenca = (inviteCode, nickname, cedula) =>
  Task.where(`#actor se une a la penca ${inviteCode} como ${nickname}`,
    Navigate.to('/register'),
    Enter.theValue(inviteCode).into(PageElement.located(By.css('[name="invite_code"]'))),
    Enter.theValue(nickname).into(PageElement.located(By.css('[name="nickname"]'))),
    Enter.theValue(cedula).into(PageElement.located(By.css('[name="cedula"]'))),
    Click.on(PageElement.located(By.css('button[type="submit"]'))),
    Wait.upTo(Duration.ofSeconds(15)).until(SubmitOutcome(), isVisible()),
  );

export const LoginToPenca = (inviteCode, nickname, cedula) =>
  Task.where(`#actor inicia sesión en la penca ${inviteCode}`,
    Navigate.to('/login'),
    Enter.theValue(inviteCode).into(PageElement.located(By.css('[name="invite_code"]'))),
    Enter.theValue(nickname).into(PageElement.located(By.css('[name="nickname"]'))),
    Enter.theValue(cedula).into(PageElement.located(By.css('[name="cedula"]'))),
    Click.on(PageElement.located(By.css('button[type="submit"]'))),
    Wait.upTo(Duration.ofSeconds(15)).until(DashboardIndicator(), isVisible()),
  );

// FUNC-006: Ver mis pencas
const MyPencasList = () => PageElement.located(By.css('[data-testid="my-pencas-list"]'));
const PencaCard = () => PageElement.located(By.css('[data-testid="penca-card"]'));

export const ViewMyPencas = () =>
  Task.where(`#actor accede a la vista de Mis Pencas`,
    Click.on(PageElement.located(By.css('[data-testid="user-menu"]'))),
    Click.on(PageElement.located(By.css('[data-testid="my-pencas-link"]'))),
    Wait.upTo(Duration.ofSeconds(10)).until(MyPencasList(), isVisible()),
  );

export const SwitchToPenca = (pencaName) =>
  Task.where(`#actor cambia a la penca ${pencaName}`,
    Click.on(PageElement.located(By.css(`[data-testid="penca-card"][data-penca-name="${pencaName}"]`))),
    Wait.upTo(Duration.ofSeconds(10)).until(DashboardIndicator(), isVisible()),
  );

// FUNC-007: Cerrar sesión
const LoginPage = () => PageElement.located(By.css('[data-testid="login-form"]'));

export const Logout = () =>
  Task.where(`#actor cierra sesión`,
    Click.on(PageElement.located(By.css('[data-testid="user-menu"]'))),
    Click.on(PageElement.located(By.css('[data-testid="logout-button"]'))),
    Wait.upTo(Duration.ofSeconds(10)).until(LoginPage(), isVisible()),
  );
