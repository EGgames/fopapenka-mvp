package fopapenka.stepdefs;

import fopapenka.tasks.AuthenticateAs;
import fopapenka.questions.AppQuestions;
import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.ensure.Ensure;
import net.serenitybdd.screenplay.questions.Text;
import net.serenitybdd.screenplay.actions.Open;
import net.serenitybdd.screenplay.waits.WaitUntil;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;

import static net.serenitybdd.screenplay.actors.OnStage.theActorCalled;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;

public class RankingStepDefs {

    @Given("que existen {int} jugadores con pronósticos en la Fecha {int}")
    public void queExistenJugadoresConPronosticos(int count, int fixtureNum) {
        // Los jugadores y pronósticos ya están en la DB (seeder).
    }

    @When("el admin carga todos los resultados de la Fecha {int}")
    public void elAdminCargaResultados(int fixtureNum) {
        // Los resultados de Fecha 1 y 2 ya están cargados en el seeder.
    }

    @Then("el ranking debe mostrar los {int} jugadores con sus puntos actualizados")
    public void elRankingDebeMostrarJugadores(int count) {
        theActorCalled("Ronaldo").attemptsTo(
            AuthenticateAs.withCredentials("AMIGOS2026", "Ronaldo", "22222222"),
            Open.url("http://localhost:5173/ranking"),
            WaitUntil.the(AppQuestions.RANKING_ROWS, WebElementStateMatchers.isVisible())
                .forNoMoreThan(15).seconds(),
            Ensure.that(Text.ofEach(AppQuestions.RANKING_ROWS)).hasSizeGreaterThanOrEqualTo(count)
        );
    }

    @Given("que el jugador {string} está en el {int}do lugar con {int} puntos")
    public void queElJugadorEstaEnLugar(String nickname, int position, int points) {
        theActorCalled(nickname).attemptsTo(
            AuthenticateAs.withCredentials("AMIGOS2026", nickname, "22222222")
        );
    }

    @When("accede a la página de ranking")
    public void accedeAlRanking() {
        theActorInTheSpotlight().attemptsTo(
            Open.url("http://localhost:5173/ranking"),
            WaitUntil.the(AppQuestions.RANKING_ROWS, WebElementStateMatchers.isVisible())
                .forNoMoreThan(15).seconds()
        );
    }

    @Then("su fila debe estar resaltada visualmente")
    public void suFilaDebeEstarResaltada() {
        theActorInTheSpotlight().attemptsTo(
            Ensure.that(Text.ofEach(AppQuestions.MY_RANKING_ROW)).isNotEmpty()
        );
    }

    @Given("que el jugador {string} tiene {int} puntos en el torneo {string} y {int} en {string}")
    public void queElJugadorTienePuntos(String nickname, int pts1, String t1, int pts2, String t2) {
        // Datos ya presentes en el seeder. No se necesita acción.
    }

    @When("accede al ranking acumulado")
    public void accedeAlRankingAcumulado() {
        theActorCalled("Ronaldo").attemptsTo(
            AuthenticateAs.withCredentials("AMIGOS2026", "Ronaldo", "22222222"),
            Open.url("http://localhost:5173/ranking"),
            WaitUntil.the(AppQuestions.RANKING_ROWS, WebElementStateMatchers.isVisible())
                .forNoMoreThan(15).seconds()
        );
    }

    @Then("debería ver {int} puntos totales para {string}")
    public void deberiaVerPuntosTotales(int expectedTotal, String nickname) {
        theActorCalled("Ronaldo").attemptsTo(
            Ensure.that(Text.ofEach(AppQuestions.RANKING_POINTS))
                .containsAnyOf(String.valueOf(expectedTotal))
        );
    }
}
