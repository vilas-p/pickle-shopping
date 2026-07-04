package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.notification.WhatsAppProviderType;
import com.appaamma.pickles.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WhatsAppBusinessApiProvider implements WhatsAppProvider {

    private final NotificationProperties properties;
    private final RestClient.Builder restClientBuilder;

    @Override
    public WhatsAppProviderType type() {
        return WhatsAppProviderType.WHATSAPP_BUSINESS_API;
    }

    @Override
    public NotificationProviderResponse send(String phoneNumber, String message) {
        NotificationProperties.WhatsApp whatsapp = properties.whatsapp();
        require(whatsapp.baseUrl(), "app.notification.whatsapp.base-url");
        require(whatsapp.accessToken(), "app.notification.whatsapp.access-token");

        String response = restClientBuilder.build()
                .post()
                .uri(whatsapp.baseUrl())
                .header("Authorization", "Bearer " + whatsapp.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "messaging_product", "whatsapp",
                        "to", phoneNumber,
                        "type", "text",
                        "text", Map.of("body", message),
                        "phone_number_id", blankToDefault(whatsapp.phoneNumberId(), "")
                ))
                .retrieve()
                .body(String.class);

        return new NotificationProviderResponse("whatsapp-business-api", null, response);
    }

    private void require(String value, String key) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Missing notification provider config: " + key);
        }
    }

    private String blankToDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}