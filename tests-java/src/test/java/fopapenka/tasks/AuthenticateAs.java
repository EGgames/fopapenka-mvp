package fopapenka.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.*;
import net.serenitybdd.screenplay.targets.Target;
import net.serenitybdd.screenplay.waits.WaitUntil;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;
import org.openqa.selenium.By;

import static net.serenitybdd.screenplay.actions.Enter.theValue;

/**
 * Tarea Screenplay: navega a /login o /register y autentica al actor.
 */
public class AuthenticateAs implements Task {

    private final String inviteCode;
    private final String nickname;
    private final String cedula;
    private final Boolean register;

    public static final Target INVITE_CODE_FIELD = Target.the("campo invite_code")
        .located(By.cssSelector("[name='invite_code']"));
    public static final Target NICKNAME_FIELD = Target.the("campo nickname")
        .located(By.cssSelector("[name='nickname']"));
    public static final Target CEDULA_FIELD = Target.the("campo cedula")
        .located(By.cssSelector("[name='cedula']"));
    public static final Target SUBMIT_BUTTON = Target.the("botón submit")
        .located(By.cssSelector("button[type='submit']"));
    public static final Target DASHBOARD_INDICATOR = Target.the("indicador dashboard")
        .located(By.cssSelector("[data-testid='penca-name']"));
    public static final Target SUBMIT_OUTCOME = Target.the("resultado del submit")
        .located(By.cssSelector("[data-testid='penca-name'], [role='alert']"));

    private AuthenticateAs(String inviteCode, String nickname, String cedula, Boolean register) {
        this.inviteCode = inviteCode;
        this.nickname = nickname;
        this.cedula = cedula;
        this.register = register;
    }

    public static AuthenticateAs withCredentials(String inviteCode, String nickname, String cedula) {
        return new AuthenticateAs(inviteCode, nickname, cedula, false);
    }

    public static AuthenticateAs registeringAs(String inviteCode, String nickname, String cedula) {
        return new AuthenticateAs(inviteCode, nickname, cedula, true);
    }

    @Override
    public <T extends net.serenitybdd.screenplay.Actor> void performAs(T actor) {
        String path = Boolean.TRUE.equals(register) ? "/register" : "/login";
        Target waitTarget = Boolean.TRUE.equals(register) ? SUBMIT_OUTCOME : DASHBOARD_INDICATOR;
        actor.attemptsTo(
            Open.url("http://localhost:5173" + path),
            WaitUntil.the(INVITE_CODE_FIELD, WebElementStateMatchers.isPresent()).forNoMoreThan(15).seconds(),
            theValue(inviteCode).into(INVITE_CODE_FIELD),
            theValue(nickname).into(NICKNAME_FIELD),
            theValue(cedula).into(CEDULA_FIELD),
            Click.on(SUBMIT_BUTTON),
            WaitUntil.the(waitTarget, WebElementStateMatchers.isPresent()).forNoMoreThan(30).seconds()
        );
    }
}
