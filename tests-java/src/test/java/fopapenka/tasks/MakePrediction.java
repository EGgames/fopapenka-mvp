package fopapenka.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.abilities.BrowseTheWeb;
import net.serenitybdd.screenplay.actions.*;
import net.serenitybdd.screenplay.targets.Target;
import net.serenitybdd.screenplay.waits.WaitUntil;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

/**
 * Tarea Screenplay: guarda un pronóstico en la UI de predicciones.
 * Usa el atributo data-match-id para localizar el bloque del partido.
 */
public class MakePrediction implements Task {

    private final String matchDomId;
    private final Integer homeGoals;
    private final Integer awayGoals;

    private MakePrediction(String matchDomId, Integer homeGoals, Integer awayGoals) {
        this.matchDomId = matchDomId;
        this.homeGoals = homeGoals;
        this.awayGoals = awayGoals;
    }

    public static MakePrediction of(String matchDomId, int homeGoals, int awayGoals) {
        return new MakePrediction(matchDomId, homeGoals, awayGoals);
    }

    private Target homeInput() {
        return Target.the("goles local para " + matchDomId)
            .located(By.cssSelector("[data-match-id='" + matchDomId + "'] .home-goals"));
    }

    private Target saveButton() {
        return Target.the("botón guardar para " + matchDomId)
            .located(By.cssSelector("[data-match-id='" + matchDomId + "'] .save-prediction"));
    }

    private void setInputValue(WebDriver driver, String selector, String value) {
        ((JavascriptExecutor) driver).executeScript(
            "var el = document.querySelector(arguments[0]);" +
            "var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;" +
            "nativeSetter.call(el, arguments[1]);" +
            "el.dispatchEvent(new Event('input', {bubbles: true}));" +
            "el.dispatchEvent(new Event('change', {bubbles: true}));",
            selector, value
        );
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.url("http://localhost:5173/predictions"),
            WaitUntil.the(homeInput(), WebElementStateMatchers.isPresent()).forNoMoreThan(15).seconds()
        );
        WebDriver driver = BrowseTheWeb.as(actor).getDriver();
        setInputValue(driver, "[data-match-id='" + matchDomId + "'] .home-goals", String.valueOf(homeGoals));
        setInputValue(driver, "[data-match-id='" + matchDomId + "'] .away-goals", String.valueOf(awayGoals));
        actor.attemptsTo(
            Click.on(saveButton())
        );
    }
}
