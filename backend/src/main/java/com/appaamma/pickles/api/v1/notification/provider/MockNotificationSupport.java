package com.appaamma.pickles.api.v1.notification.provider;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class MockNotificationSupport {

    private final ObjectMapper objectMapper;

    public NotificationProviderResponse capture(String channel, String recipient, String subject, String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("mode", "mock");
        payload.put("channel", channel);
        payload.put("recipient", recipient);
        payload.put("subject", subject);
        payload.put("message", message);
        payload.put("capturedAt", Instant.now().toString());

        String rawResponse = write(payload);
        log.warn("[MOCK:{}] {}", channel, rawResponse);
        return new NotificationProviderResponse("mock-notification", null, rawResponse);
    }

    private String write(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            return payload.toString();
        }
    }
}