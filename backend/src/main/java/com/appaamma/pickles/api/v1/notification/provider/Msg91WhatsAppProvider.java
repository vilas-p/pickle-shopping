package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.notification.WhatsAppProviderType;
import com.appaamma.pickles.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class Msg91WhatsAppProvider implements WhatsAppProvider {

    private final NotificationProperties properties;
    private final RestClient.Builder restClientBuilder;

    @Override
    public WhatsAppProviderType type() {
        return WhatsAppProviderType.MSG91;
    }

    @Override
    public NotificationProviderResponse send(String phoneNumber, String message) {
        NotificationProperties.WhatsApp whatsapp = properties.whatsapp();
        require(whatsapp.msg91BaseUrl(), "app.notification.whatsapp.msg91-base-url");
        require(whatsapp.msg91AuthKey(), "app.notification.whatsapp.msg91-auth-key");
        require(whatsapp.msg91IntegratedNumber(), "app.notification.whatsapp.msg91-integrated-number");

        if (phoneNumber == null || !phoneNumber.matches("^\\d{10,15}$")) {
            throw new BadRequestException("Invalid mobile number format for WhatsApp: " + phoneNumber);
        }

        try {
            String response = restClientBuilder.build()
                    .post()
                    .uri(whatsapp.msg91BaseUrl())
                    .header("authkey", whatsapp.msg91AuthKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "integrated_number", whatsapp.msg91IntegratedNumber(),
                            "content_type", "template",
                            "payload", Map.of(
                                    "messaging_product", "whatsapp",
                                    "type", "template",
                                    "template", Map.of(
                                            "name", extractTemplateName(message),
                                            "language", Map.of("code", "en"),
                                            "components", buildComponents(message)
                                    ),
                                    "to", phoneNumber
                            )
                    ))
                    .retrieve()
                    .body(String.class);

            log.info("MSG91 WhatsApp sent to {}: response={}", phoneNumber, response);
            return new NotificationProviderResponse("msg91-whatsapp", null, response);

        } catch (HttpClientErrorException ex) {
            return handleClientError(ex, phoneNumber);
        } catch (HttpServerErrorException ex) {
            log.error("MSG91 WhatsApp server error ({}): {} for recipient {}",
                    ex.getStatusCode(), ex.getResponseBodyAsString(), phoneNumber);
            throw new RuntimeException("MSG91 WhatsApp server error: " + ex.getStatusCode(), ex);
        } catch (ResourceAccessException ex) {
            log.error("MSG91 WhatsApp timeout/connection error for recipient {}: {}", phoneNumber, ex.getMessage());
            throw new RuntimeException("MSG91 WhatsApp connection error: " + ex.getMessage(), ex);
        }
    }

    /**
     * Sends a WhatsApp template message with explicit template name and variable values.
     */
    public NotificationProviderResponse sendTemplate(String phoneNumber, String templateName, List<String> variables) {
        NotificationProperties.WhatsApp whatsapp = properties.whatsapp();
        require(whatsapp.msg91BaseUrl(), "app.notification.whatsapp.msg91-base-url");
        require(whatsapp.msg91AuthKey(), "app.notification.whatsapp.msg91-auth-key");
        require(whatsapp.msg91IntegratedNumber(), "app.notification.whatsapp.msg91-integrated-number");

        if (phoneNumber == null || !phoneNumber.matches("^\\d{10,15}$")) {
            throw new BadRequestException("Invalid mobile number format for WhatsApp: " + phoneNumber);
        }
        if (templateName == null || templateName.isBlank()) {
            throw new BadRequestException("WhatsApp template name is required");
        }

        List<Map<String, Object>> bodyParameters = variables == null ? List.of() :
                variables.stream()
                        .map(v -> Map.<String, Object>of("type", "text", "text", v))
                        .toList();

        try {
            String response = restClientBuilder.build()
                    .post()
                    .uri(whatsapp.msg91BaseUrl())
                    .header("authkey", whatsapp.msg91AuthKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "integrated_number", whatsapp.msg91IntegratedNumber(),
                            "content_type", "template",
                            "payload", Map.of(
                                    "messaging_product", "whatsapp",
                                    "type", "template",
                                    "template", Map.of(
                                            "name", templateName,
                                            "language", Map.of("code", "en"),
                                            "components", List.of(
                                                    Map.of("type", "body", "parameters", bodyParameters)
                                            )
                                    ),
                                    "to", phoneNumber
                            )
                    ))
                    .retrieve()
                    .body(String.class);

            log.info("MSG91 WhatsApp template '{}' sent to {}: response={}", templateName, phoneNumber, response);
            return new NotificationProviderResponse("msg91-whatsapp", null, response);

        } catch (HttpClientErrorException ex) {
            return handleClientError(ex, phoneNumber);
        } catch (HttpServerErrorException ex) {
            log.error("MSG91 WhatsApp server error ({}): {} for recipient {}",
                    ex.getStatusCode(), ex.getResponseBodyAsString(), phoneNumber);
            throw new RuntimeException("MSG91 WhatsApp server error: " + ex.getStatusCode(), ex);
        } catch (ResourceAccessException ex) {
            log.error("MSG91 WhatsApp timeout/connection error for recipient {}: {}", phoneNumber, ex.getMessage());
            throw new RuntimeException("MSG91 WhatsApp connection error: " + ex.getMessage(), ex);
        }
    }

    private NotificationProviderResponse handleClientError(HttpClientErrorException ex, String phoneNumber) {
        HttpStatusCode status = ex.getStatusCode();
        String body = ex.getResponseBodyAsString();

        if (status.value() == 401) {
            log.error("MSG91 WhatsApp auth failure (401): {} for recipient {}", body, phoneNumber);
            throw new RuntimeException("MSG91 WhatsApp authentication failed: invalid authkey");
        } else if (status.value() == 429) {
            log.warn("MSG91 WhatsApp rate limited (429) for recipient {}: {}", phoneNumber, body);
            throw new RuntimeException("MSG91 WhatsApp rate limited: " + body);
        } else {
            log.error("MSG91 WhatsApp client error ({}): {} for recipient {}", status, body, phoneNumber);
            throw new RuntimeException("MSG91 WhatsApp client error " + status + ": " + body);
        }
    }

    private String extractTemplateName(String message) {
        // The rendered message from NotificationTemplateEngine is the template body.
        // For MSG91 WhatsApp, we use the message as a fallback template name if it looks
        // like a template identifier, otherwise default to generic.
        if (message != null && message.matches("^[a-z0-9_]+$")) {
            return message;
        }
        return "generic_notification";
    }

    private List<Map<String, Object>> buildComponents(String message) {
        // When called via the standard WhatsAppProvider interface (queue processor),
        // the rendered message body is sent as a single body parameter.
        if (message == null || message.isBlank()) {
            return List.of();
        }
        return List.of(
                Map.of("type", "body", "parameters",
                        List.of(Map.<String, Object>of("type", "text", "text", message)))
        );
    }

    private void require(String value, String key) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Missing notification provider config: " + key);
        }
    }
}
