package fopapenka.stepdefs;

import fopapenka.support.ApiClient;
import io.cucumber.java.Before;
import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.ensure.Ensure;
import net.serenitybdd.screenplay.questions.Text;

import static net.serenitybdd.screenplay.actors.OnStage.theActorCalled;
import static org.assertj.core.api.Assertions.assertThat;

public class ScoringStepDefs {

    private static final String ADMIN_CEDULA = "12345678";
    private static final String RONALDO_CEDULA = "22222222";

    private int currentMatchId;
    private String adminToken;
    private String ronaldoToken;

    @Before("@scoring")
    public void resetFecha3Matches() throws Exception {
        adminToken = ApiClient.login("AdminFopa", ADMIN_CEDULA);
        ApiClient.resetAllFecha3Matches(adminToken);
    }

    @Given("que el jugador {string} pronosticó {int}-{int} en {string}")
    public void queElJugadorPronostico(String nickname, int home, int away, String matchName) throws Exception {
        if (adminToken == null) adminToken = ApiClient.login("AdminFopa", ADMIN_CEDULA);
        ronaldoToken = ApiClient.login("Ronaldo", RONALDO_CEDULA);
        currentMatchId = ApiClient.getScheduledMatchIdInFecha3(adminToken);
        ApiClient.createOrUpdatePrediction(ronaldoToken, currentMatchId, home, away);
    }

    @When("el admin carga el resultado {int}-{int}")
    public void elAdminCargaElResultado(int home, int away) throws Exception {
        if (adminToken == null) adminToken = ApiClient.login("AdminFopa", ADMIN_CEDULA);
        ApiClient.setMatchResult(adminToken, currentMatchId, home, away);
    }

    @Then("el puntaje del jugador en ese partido debe ser {int}")
    public void elPuntajeDebe(int expectedPoints) throws Exception {
        int actualPoints = ApiClient.getPredictionPoints(ronaldoToken, currentMatchId);
        assertThat(actualPoints)
            .as("Puntos para el partido %d", currentMatchId)
            .isEqualTo(expectedPoints);
    }
}
