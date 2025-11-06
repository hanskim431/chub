package com.chub.tailquestion.client;

import com.chub.config.GMSConfig;
import com.chub.tailquestion.dto.TailQuestionRequest;
import com.chub.tailquestion.dto.TailQuestionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TailQuestionClient {

    private final GMSConfig config;
    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TailQuestionResponse generate(TailQuestionRequest tailQuestionRequest) {
        try {
            String json = objectMapper.writeValueAsString(tailQuestionRequest);
            RequestBody requestBody = RequestBody.create(
                    json, MediaType.parse("application/json")
            );
            Request request = buildRequest(requestBody);
            return executeGenerationRequest(request);
        } catch (Exception e) {
            // Exception 처리는 Service에서
            throw new RuntimeException("Failed to generate tail questions", e);
        }
    }

    private Request buildRequest(RequestBody requestBody) {
        return new Request.Builder()
                .url(config.getGptUrl())
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer " + config.getApiKey())
                .post(requestBody)
                .build();
    }

    private TailQuestionResponse executeGenerationRequest(Request request) throws Exception {
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("API call failed: " + response.code());
            }
            return parseTailQuestionResponse(response.body().string());
        }
    }

    private TailQuestionResponse parseTailQuestionResponse(String responseBody) throws Exception {
        JsonNode jsonNode = objectMapper.readTree(responseBody);
        String responseMessage = jsonNode.get("choices").get(0).get("message").get("content").asText();

        List<String> questions = new ArrayList<>();
        for (String line : responseMessage.split("\n")) {
            String parsed = line.trim();
            if (!parsed.isEmpty()) {
                questions.add(parsed);
            }
        }

        return new TailQuestionResponse(questions);
    }
}
