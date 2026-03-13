package fopapenka.stepdefs;

import fopapenka.tasks.AuthenticateAs;
import fopapenka.tasks.MakePrediction;
import fopapenka.questions.AppQuestions;
import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.ensure.Ensure;
import net.serenitybdd.screenplay.questions.Text;
import net.serenitybdd.screenplay.actions.Open;
import net.serenitybdd.screenplay.waits.WaitUntil;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;

import static net.serenitybdd.screenplay.actors.OnStage.theActorCalled;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;

public class PredictionStepDefs {

    // ID usado en data-match-id del frontend para River Plate vs Racing, Fecha 3
    private static final String SCHEDULED_MATCH_ID = "river-racing-f3";

    private static final java.util.Map<String, String> CEDULAS = java.util.Map.of(
        "Ronaldo", "22222222",
        "Messi", "11111111",
        "AdminFopa", "12345678"
    );

    @Given("que el jugador {string} está autenticado en la penca {string}")
    public void queElJugadorEstaAutenticado(String nickname, String inviteCode) {
        theActorCalled(nickname).attemptsTo(
            AuthenticateAs.withCredentials(inviteCode, nickname, CEDULAS.getOrDefault(nickname, "99999999"))
        );
    }

    @Given("existe el partido {string} en la Fecha {int}")
    public void existeElPartido(String matchName, int fixtureNum) {
        // El partido ya existe en la DB (seeder). No se necesita acción.
    }

    @When("pronóstica {int} a {int} a favor del local")
    public void pronostica(int homeGoals, int awayGoals) {
        theActorCalled("Ronaldo").attemptsTo(
            MakePrediction.of(SCHEDULED_MATCH_ID, homeGoals, awayGoals)
        );
    }

    @Then("su pronóstico debería quedar guardado como {string}")
    public void suPronosticoDeberiaQuedarGuardadoComo(String expectedLabel) {
        theActorCalled("Ronaldo").attemptsTo(
            Ensure.that(Text.of(AppQuestions.predictionBadge(SCHEDULED_MATCH_ID)))
                .containsIgnoringCase(expectedLabel)
        );
    }

    @Given("que el partido {string} ya fue jugado con resultado {int}-{int}")
    public void queElPartidoYaFueJugado(String matchName, int home, int away) {
        // Partidos de Fecha 1 y 2 ya tienen status='played' en la DB (seeder).
    }

    @When("el jugador intenta pronosticar ese partido")
    public void elJugadorIntentaPronosticar() {
        theActorCalled("Ronaldo").attemptsTo(
            AuthenticateAs.withCredentials("AMIGOS2026", "Ronaldo", CEDULAS.getOrDefault("Ronaldo", "99999999")),
            Open.url("http://localhost:5173/predictions"),
            WaitUntil.the(AppQuestions.MATCH_LOCKED_MSG, WebElementStateMatchers.isVisible())
                .forNoMoreThan(15).seconds()
        );
    }

    @Then("debería ver el mensaje {string}")
    public void deberiaVerElMensaje(String message) {
        theActorInTheSpotlight().attemptsTo(
            Ensure.that(Text.of(AppQuestions.MATCH_LOCKED_MSG)).containsIgnoringCase(message)
        );
    }

    @Given("que el jugador {string} ya pronosticó {int}-{int} en {string}")
    public void queElJugadorYaPronostico(String nickname, int homeGoals, int awayGoals, String matchName) {
        String cedula = CEDULAS.getOrDefault(nickname, "99999999");
        theActorCalled(nickname).attemptsTo(
            AuthenticateAs.withCredentials("AMIGOS2026", nickname, cedula),
            MakePrediction.of(SCHEDULED_MATCH_ID, homeGoals, awayGoals)
        );
    }

    @When("cambia su pronóstico a {int}-{int}")
    public void cambiarPronostico(int homeGoals, int awayGoals) {
        theActorCalled("Ronaldo").attemptsTo(
            MakePrediction.of(SCHEDULED_MATCH_ID, homeGoals, awayGoals)
        );
    }

    @Then("su pronóstico debería quedar como {string}")
    public void suPronosticoDeberiaQuedarComo(String expectedLabel) {
        theActorCalled("Ronaldo").attemptsTo(
            Ensure.that(Text.of(AppQuestions.predictionBadge(SCHEDULED_MATCH_ID)))
                .containsIgnoringCase(expectedLabel)
        );
    }
}
