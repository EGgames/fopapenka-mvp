package fopapenka.stepdefs;

import fopapenka.tasks.AuthenticateAs;
import fopapenka.tasks.SendChatMessage;
import fopapenka.questions.AppQuestions;
import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.ensure.Ensure;
import net.serenitybdd.screenplay.questions.Text;
import net.serenitybdd.screenplay.actions.Open;
import net.serenitybdd.screenplay.waits.WaitUntil;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;

import static net.serenitybdd.screenplay.actors.OnStage.theActorCalled;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;

public class ChatStepDefs {

    @Given("que el jugador {string} está autenticado")
    public void queElJugadorEstaAutenticado(String nickname) {
        theActorCalled(nickname).attemptsTo(
            AuthenticateAs.withCredentials("AMIGOS2026", nickname, "22222222")
        );
    }

    @Given("está en la página de chat")
    public void estaEnLaPaginaDeChat() {
        theActorInTheSpotlight().attemptsTo(
            Open.url("http://localhost:5173/chat"),
            WaitUntil.the(AppQuestions.CHAT_INPUT, WebElementStateMatchers.isVisible())
                .forNoMoreThan(15).seconds()
        );
    }

    @When("escribe el mensaje {string} y lo envía")
    public void escribeElMensajeYLoEnvia(String message) {
        theActorInTheSpotlight().attemptsTo(
            SendChatMessage.saying(message)
        );
    }

    @Then("el mensaje {string} debe aparecer en el chat")
    public void elMensajeDebeAparecer(String message) {
        theActorInTheSpotlight().attemptsTo(
            WaitUntil.the(AppQuestions.CHAT_MESSAGES, WebElementStateMatchers.isVisible())
                .forNoMoreThan(15).seconds(),
            Ensure.that(Text.ofEach(AppQuestions.CHAT_MESSAGE_CONTENT)).containsAnyOf(message)
        );
    }

    @Given("que existen {int} mensajes anteriores en el chat")
    public void queExistenMensajesAnteriores(int count) {
        // Los mensajes ya están en la DB (seeder). No se necesita acción.
    }

    @When("el jugador {string} abre la página de chat")
    public void elJugadorAbreLaPaginaDeChat(String nickname) {
        theActorCalled(nickname).attemptsTo(
            AuthenticateAs.withCredentials("AMIGOS2026", nickname, "22222222"),
            Open.url("http://localhost:5173/chat"),
            WaitUntil.the(AppQuestions.CHAT_MESSAGES, WebElementStateMatchers.isVisible())
                .forNoMoreThan(15).seconds()
        );
    }

    @Then("debe ver los últimos mensajes cargados")
    public void debeVerLosUltimosMensajesCargados() {
        theActorInTheSpotlight().attemptsTo(
            Ensure.that(Text.ofEach(AppQuestions.CHAT_MESSAGES)).isNotEmpty()
        );
    }

    @When("el jugador intenta enviar un mensaje de {int} caracteres")
    public void elJugadorIntentaEnviarMensajeLargo(int length) {
        String longMsg = "A".repeat(length);
        theActorCalled("Ronaldo").attemptsTo(
            AuthenticateAs.withCredentials("AMIGOS2026", "Ronaldo", "22222222"),
            Open.url("http://localhost:5173/chat"),
            WaitUntil.the(AppQuestions.CHAT_INPUT, WebElementStateMatchers.isVisible())
                .forNoMoreThan(15).seconds(),
            net.serenitybdd.screenplay.actions.Enter.theValue(longMsg).into(AppQuestions.CHAT_INPUT)
        );
    }

    @Then("el campo no debería permitir más de {int} caracteres")
    public void elCampoNoDeberiaPermitirMasDeNCaracteres(int maxLength) {
        // Verificamos que el valor del campo no exceda maxLength (HTML maxLength lo garantiza)
        theActorInTheSpotlight().attemptsTo(
            Ensure.that(net.serenitybdd.screenplay.questions.Value.of(AppQuestions.CHAT_INPUT))
                .hasSizeLessThanOrEqualTo(maxLength)
        );
    }
}
