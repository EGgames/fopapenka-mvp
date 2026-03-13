package fopapenka.support;

import net.serenitybdd.core.Serenity;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.*;

import java.io.IOException;

/**
 * Cliente HTTP liviano para llamadas a la API REST del backend.
 * Usado en los step definitions de scoring (100% API, sin UI).
 */
public class ApiClient {

    private static final String BASE_URL = "http://localhost:4001/api";
    private static final MediaType JSON = MediaType.get("application/json");
    private static final OkHttpClient client = new OkHttpClient();

    public static String login(String nickname, String cedula) throws IOException {
        String body = String.format(
            "{\"invite_code\":\"AMIGOS2026\",\"nickname\":\"%s\",\"cedula\":\"%s\"}",
            nickname, cedula
        );
        Request req = new Request.Builder()
            .url(BASE_URL + "/auth/login")
            .post(RequestBody.create(body, JSON))
            .build();
        try (Response resp = client.newCall(req).execute()) {
            String json = resp.body().string();
            JsonObject obj = JsonParser.parseString(json).getAsJsonObject();
            return obj.get("token").getAsString();
        }
    }

    public static int createOrUpdatePrediction(String token, int matchId, int home, int away) throws IOException {
        String body = String.format(
            "{\"match_id\":%d,\"predicted_home\":%d,\"predicted_away\":%d}",
            matchId, home, away
        );
        Request req = new Request.Builder()
            .url(BASE_URL + "/predictions")
            .post(RequestBody.create(body, JSON))
            .header("Authorization", "Bearer " + token)
            .build();
        try (Response resp = client.newCall(req).execute()) {
            String json = resp.body().string();
            // Si ya existe (409) intentamos PUT
            if (resp.code() == 409 || resp.code() == 400) {
                return updatePrediction(token, matchId, home, away);
            }
            JsonObject obj = JsonParser.parseString(json).getAsJsonObject();
            return obj.getAsJsonObject("prediction").get("id").getAsInt();
        }
    }

    private static int updatePrediction(String token, int matchId, int home, int away) throws IOException {
        String body = String.format("{\"predicted_home\":%d,\"predicted_away\":%d}", home, away);
        Request req = new Request.Builder()
            .url(BASE_URL + "/predictions/match/" + matchId)
            .put(RequestBody.create(body, JSON))
            .header("Authorization", "Bearer " + token)
            .build();
        try (Response resp = client.newCall(req).execute()) {
            JsonObject obj = JsonParser.parseString(resp.body().string()).getAsJsonObject();
            return obj.getAsJsonObject("prediction").get("id").getAsInt();
        }
    }

    public static void setMatchResult(String adminToken, int matchId, int home, int away) throws IOException {
        String body = String.format("{\"home_score\":%d,\"away_score\":%d}", home, away);
        Request req = new Request.Builder()
            .url(BASE_URL + "/matches/" + matchId + "/result")
            .put(RequestBody.create(body, JSON))
            .header("Authorization", "Bearer " + adminToken)
            .build();
        try (Response resp = client.newCall(req).execute()) {
            if (!resp.isSuccessful()) {
                throw new IOException("setMatchResult falló: " + resp.code() + " " + resp.body().string());
            }
        }
    }

    public static void resetMatchResult(String adminToken, int matchId) throws IOException {
        Request req = new Request.Builder()
            .url(BASE_URL + "/matches/" + matchId + "/result")
            .delete()
            .header("Authorization", "Bearer " + adminToken)
            .build();
        try (Response resp = client.newCall(req).execute()) {
            // ignorar errores — el partido puede ya estar scheduled
        }
    }

    public static int getScheduledMatchIdInFecha3(String adminToken) throws IOException {
        Request req = new Request.Builder()
            .url(BASE_URL + "/fixtures/tournament/1")
            .header("Authorization", "Bearer " + adminToken)
            .build();
        try (Response resp = client.newCall(req).execute()) {
            JsonObject root = JsonParser.parseString(resp.body().string()).getAsJsonObject();
            var fixtures = root.getAsJsonArray("fixtures");
            for (var f : fixtures) {
                JsonObject fixture = f.getAsJsonObject();
                if (fixture.get("number").getAsInt() == 3) {
                    var matches = fixture.getAsJsonArray("Matches");
                    for (var m : matches) {
                        JsonObject match = m.getAsJsonObject();
                        if ("scheduled".equals(match.get("status").getAsString())) {
                            return match.get("id").getAsInt();
                        }
                    }
                }
            }
        }
        throw new IllegalStateException("No hay partidos scheduled en Fecha 3");
    }

    public static void resetAllFecha3Matches(String adminToken) throws IOException {
        Request req = new Request.Builder()
            .url(BASE_URL + "/fixtures/tournament/1")
            .header("Authorization", "Bearer " + adminToken)
            .build();
        try (Response resp = client.newCall(req).execute()) {
            JsonObject root = JsonParser.parseString(resp.body().string()).getAsJsonObject();
            var fixtures = root.getAsJsonArray("fixtures");
            for (var f : fixtures) {
                JsonObject fixture = f.getAsJsonObject();
                if (fixture.get("number").getAsInt() == 3) {
                    var matches = fixture.getAsJsonArray("Matches");
                    for (var m : matches) {
                        int id = m.getAsJsonObject().get("id").getAsInt();
                        resetMatchResult(adminToken, id);
                    }
                }
            }
        }
    }

    /**
     * Obtiene los puntos del usuario para un partido dado.
     * @return puntos (0 si no hay Score o pronóstico)
     */
    public static int getPredictionPoints(String userToken, int matchId) throws IOException {
        Request req = new Request.Builder()
            .url(BASE_URL + "/predictions/mine")
            .header("Authorization", "Bearer " + userToken)
            .build();
        try (Response resp = client.newCall(req).execute()) {
            JsonObject root = JsonParser.parseString(resp.body().string()).getAsJsonObject();
            var predictions = root.getAsJsonArray("predictions");
            for (var p : predictions) {
                JsonObject pred = p.getAsJsonObject();
                if (pred.get("match_id").getAsInt() == matchId) {
                    if (pred.has("Score") && !pred.get("Score").isJsonNull()) {
                        return pred.getAsJsonObject("Score").get("points").getAsInt();
                    }
                    return 0;
                }
            }
        }
        throw new IllegalStateException("No se encontró pronóstico para matchId=" + matchId);
    }
}
