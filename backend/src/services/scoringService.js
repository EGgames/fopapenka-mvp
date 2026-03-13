/**
 * Calcula los puntos para un pronóstico dado el resultado real.
 * Reglas:
 *   - Marcador exacto → 3 puntos
 *   - Resultado correcto (ganador o empate), distinto marcador → 1 punto
 *   - Sin acierto → 0 puntos
 */
const getResult = (home, away) => {
  if (home > away) return 'home';
  if (away > home) return 'away';
  return 'draw';
};

const calculatePoints = ({ predictedHome, predictedAway, actualHome, actualAway }) => {
  if (predictedHome === actualHome && predictedAway === actualAway) return 3;
  if (getResult(predictedHome, predictedAway) === getResult(actualHome, actualAway)) return 1;
  return 0;
};

module.exports = { calculatePoints };
