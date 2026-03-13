package fopapenka.stepdefs;

import fopapenka.support.ApiClient;
import fopapenka.tasks.AuthenticateAs;
import fopapenka.questions.AppQuestions;
import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.ensure.Ensure;
import net.serenitybdd.screenplay.questions.Text;

import static net.serenitybdd.screenplay.actors.OnStage.theActorCalled;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;

public class AuthStepDefs {

    private String uniqueNickname;

    @Given("que existe una penca con código {string}")
    public void queExisteUnaPencaConCodigo(String code) {
        // La penca ya existe en la DB (seeder). Marcamos que usaremos nickname único.
        uniqueNickname = null; // se setea en el When
    }

    @Given("que existe una penca con código {string} con el usuario {string} registrado")
    public void pencaConUsuarioRegistrado(String code, String existingUser) {
        uniqueNickname = existingUser; // no modificar — debe chocar
    }

    @When("el usuario ingresa el código {string}, el apodo {string} y la cédula {string}")
    public void elUsuarioIngresa(String inviteCode, String nickname, String cedula) {
        // Para el escenario de registro válido usamos nickname único para evitar duplicados
        String finalNickname = (uniqueNickname == null)
            ? nickname + "_" + System.currentTimeMillis()
            : nickname;

        theActorCalled("Visitante").attemptsTo(
            AuthenticateAs.registeringAs(inviteCode, finalNickname, cedula)
        );
    }

    @Then("debería ingresar al dashboard de la penca {string}")
    public void deberiaIngresarAlDashboard(String pencaName) {
        theActorInTheSpotlight().attemptsTo(
            Ensure.that(Text.of(AppQuestions.PENCA_NAME)).containsIgnoringCase(pencaName)
        );
    }

    @Then("debería ver el mensaje de error {string}")
    public void deberiaVerMensajeDeError(String message) {
        theActorInTheSpotlight().attemptsTo(
            Ensure.that(Text.of(AppQuestions.ERROR_MESSAGE)).containsIgnoringCase(message)
        );
    }
}
