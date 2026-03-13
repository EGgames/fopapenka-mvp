package fopapenka.support;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.thucydides.core.webdriver.ThucydidesWebDriverSupport;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

/**
 * Hooks de Cucumber que inicializan el Stage de Serenity Screenplay
 * antes de cada escenario y lo limpian al finalizar.
 */
public class ScenarioHooks {

    @Before(order = 1)
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @Before(order = 2)
    public void clearBrowserState() {
        try {
            WebDriver driver = ThucydidesWebDriverSupport.getDriver();
            driver.get("http://localhost:5173");
            ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        } catch (Exception ignored) {
        }
    }

    @After(order = 1)
    public void tidyUpTheStage() {
        OnStage.drawTheCurtain();
    }
}
