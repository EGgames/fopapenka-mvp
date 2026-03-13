package fopapenka.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.targets.Target;
import net.serenitybdd.screenplay.questions.Text;
import org.openqa.selenium.By;

/**
 * Questions Screenplay reutilizables para el proyecto.
 */
public class AppQuestions {

    /** Texto del indicador del nombre de la penca en el dashboard */
    public static final Target PENCA_NAME = Target.the("nombre de la penca")
        .located(By.cssSelector("[data-testid='penca-name']"));

    /** Mensaje de error en los formularios */
    public static final Target ERROR_MESSAGE = Target.the("mensaje de error")
        .located(By.cssSelector("[role='alert'], .error-message, .text-red-500, p.error"));

    /** Mensajes de chat */
    public static final Target CHAT_MESSAGES = Target.the("mensajes del chat")
        .located(By.cssSelector("[data-testid='chat-message']"));

    public static final Target CHAT_MESSAGE_CONTENT = Target.the("contenido de mensajes del chat")
        .located(By.cssSelector(".chat-message p.text-sm"));

    /** Filas del ranking */
    public static final Target RANKING_ROWS = Target.the("filas del ranking")
        .located(By.cssSelector("tbody tr, [data-testid='ranking-row']"));

    /** Fila del usuario actual en el ranking */
    public static final Target MY_RANKING_ROW = Target.the("mi fila en el ranking")
        .located(By.cssSelector("tr.highlighted, tr[data-current-user='true'], [data-testid='my-ranking-row']"));

    /** Columna de puntos en el ranking */
    public static final Target RANKING_POINTS = Target.the("puntos en el ranking")
        .located(By.cssSelector("tbody tr td:nth-child(3), [data-testid='ranking-points']"));

    /** Mensaje de partido bloqueado en predicciones */
    public static final Target MATCH_LOCKED_MSG = Target.the("mensaje partido bloqueado")
        .located(By.cssSelector(".match-locked, [data-testid='match-locked']"));

    /** Badge con el pronóstico guardado */
    public static Target predictionBadge(String matchDomId) {
        return Target.the("pronóstico guardado para " + matchDomId)
            .located(By.cssSelector("[data-match-id='" + matchDomId + "'] [data-testid='prediction-badge'], "
                + "[data-match-id='" + matchDomId + "'] .prediction-saved"));
    }

    /** Campo de input del chat (para verificar maxLength) */
    public static final Target CHAT_INPUT = Target.the("input del chat")
        .located(By.cssSelector("[data-testid='chat-input']"));

    private AppQuestions() {}
}
