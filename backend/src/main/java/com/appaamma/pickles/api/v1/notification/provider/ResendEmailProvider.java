package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.notification.EmailProviderType;
import com.appaamma.pickles.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ResendEmailProvider implements EmailProvider {

    private final NotificationProperties properties;
    private final RestClient.Builder restClientBuilder;

    @Override
    public EmailProviderType type() {
        return EmailProviderType.RESEND;
    }

    @Override
    public NotificationProviderResponse send(String emailAddress, String subject, String body) {
        NotificationProperties.Email email = properties.email();
        require(email.resendBaseUrl(), "app.notification.email.resend-base-url");
        require(email.resendApiKey(), "app.notification.email.resend-api-key");
        require(email.resendFromAddress(), "app.notification.email.resend-from-address");

        String response = restClientBuilder.build()
                .post()
                .uri(email.resendBaseUrl())
                .header("Authorization", "Bearer " + email.resendApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "from", email.resendFromAddress(),
                        "to", emailAddress,
                        "subject", subject,
                        "text", body
                ))
                .retrieve()
                .body(String.class);

        return new NotificationProviderResponse("resend", null, response);
    }

    private void require(String value, String key) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Missing notification provider config: " + key);
        }
    }
}