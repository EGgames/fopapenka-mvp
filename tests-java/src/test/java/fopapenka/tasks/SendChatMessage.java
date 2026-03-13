package fopapenka.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.*;
import net.serenitybdd.screenplay.targets.Target;
import net.serenitybdd.screenplay.waits.WaitUntil;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;
import org.openqa.selenium.By;

import static net.serenitybdd.screenplay.actions.Enter.theValue;

/**
 * Tarea Screenplay: envía un mensaje de chat.
 */
public class SendChatMessage implements Task {

    private final String message;

    private static final Target CHAT_INPUT = Target.the("campo de mensaje del chat")
        .located(By.cssSelector("[data-testid='chat-input']"));
    private static final Target SEND_BUTTON = Target.the("botón enviar mensaje")
        .located(By.cssSelector("button[type='submit']"));

    private SendChatMessage(String message) {
        this.message = message;
    }

    public static SendChatMessage saying(String message) {
        return new SendChatMessage(message);
    }

    @Override
    public <T extends net.serenitybdd.screenplay.Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.url("http://localhost:5173/chat"),
            WaitUntil.the(CHAT_INPUT, WebElementStateMatchers.isPresent()).forNoMoreThan(15).seconds(),
            theValue(message).into(CHAT_INPUT),
            Click.on(SEND_BUTTON)
        );
    }
}
