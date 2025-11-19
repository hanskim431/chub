package com.chub.stt;

import com.chub.config.GMSConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SttClient {

    private final GMSConfig config;

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final MediaType AUDIO_WEBM = MediaType.parse("audio/webm");

    private static final String WHISPER_MODEL = "whisper-1";
    private static final String STT_PROMPT = "기업 입사 면접 상황, 시간 복잡도, 알고리즘, 해시, 스택, 큐, 트리, 머지 소트, 그래프, spring, java, c, 웹, 프레임워크, 데이터 베이스, 인덱스, 도메인, 함수, 쿼리, 최적화, 정렬";

    public String transcribe(String filePath) {
        try {
            MultipartBody requestBody = buildRequestBody(filePath);
            Request request = buildRequest(requestBody);
            return executeTranscriptionRequest(request);
        } catch (Exception e) {
            log.error(e.getMessage());
            //throw AudioProcessingException.audioTranscriptionFailed();
            return "";
        }
    }

    private MultipartBody buildRequestBody(String filePath) {
        File audioFile = new File(filePath);

        // 파일 존재 여부 및 크기 확인
        log.info("STT 파일 체크 - 경로: {}, 존재: {}, 크기: {} bytes",
                filePath, audioFile.exists(), audioFile.length());

        RequestBody fileBody = RequestBody.create(audioFile, AUDIO_WEBM);

        return new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", audioFile.getName(), fileBody)
                .addFormDataPart("model", WHISPER_MODEL)
                .addFormDataPart("language", "ko")
                .addFormDataPart("prompt", STT_PROMPT)
                .build();
    }

    private Request buildRequest(MultipartBody requestBody) {
        return new Request.Builder()
                .url(config.getWhisperUrl())
                .addHeader("Authorization", "Bearer " + config.getApiKey())
                .addHeader("Content-Type", "multipart/form-data")
                .post(requestBody)
                .build();
    }

    private String executeTranscriptionRequest(Request request) throws Exception {
        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();

            log.info("STT API 응답 - 상태코드: {}, 응답 본문: {}", response.code(), responseBody);

            if (!response.isSuccessful()) {
                log.error("STT API 호출 실패 - 상태코드: {}, 응답: {}", response.code(), responseBody);
                throw new Exception("STT API 호출 실패: " + response.code());
            }

            return parseTranscriptionResponse(responseBody);
        }
    }

    private String parseTranscriptionResponse(String responseBody) throws Exception {
        JsonNode jsonNode = objectMapper.readTree(responseBody);

        // "text" 필드 존재 여부 확인
        JsonNode textNode = jsonNode.get("text");
        if (textNode == null) {
            log.error("STT 응답에 'text' 필드가 없습니다. 전체 응답: {}", responseBody);
            throw new Exception("STT 응답 파싱 실패: 'text' 필드 없음");
        }

        String transcribedText = textNode.asText();
        log.info("STT 변환 결과: {}", transcribedText);

        return transcribedText;
    }

}
