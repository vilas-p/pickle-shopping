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
public class AmazonSesEmailProvider implements EmailProvider {

    private final NotificationProperties properties;
    private final RestClient.Builder restClientBuilder;

    @Override
    public EmailProviderType type() {
        return EmailProviderType.AMAZON_SES;
    }

    @Override
    public NotificationProviderResponse send(String emailAddress, String subject, String body) {
        NotificationProperties.Email email = properties.email();
        require(email.sesEndpointUrl(), "app.notification.email.ses-endpoint-url");
        require(email.sesAccessKey(), "app.notification.email.ses-access-key");
        require(email.sesSecretKey(), "app.notification.email.ses-secret-key");
        require(email.sesFromAddress(), "app.notification.email.ses-from-address");

        String response = restClientBuilder.build()
                .post()
                .uri(email.sesEndpointUrl())
                .header("X-SES-ACCESS-KEY", email.sesAccessKey())
                .header("X-SES-SECRET-KEY", email.sesSecretKey())
                .header("X-SES-REGION", blankToDefault(email.sesRegion(), "ap-south-1"))
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "from", email.sesFromAddress(),
                        "to", emailAddress,
                        "subject", subject,
                        "text", body
                ))
                .retrieve()
                .body(String.class);

        return new NotificationProviderResponse("amazon-ses", null, response);
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