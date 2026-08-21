package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.credential.CredService;
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

    private static final String PROVIDER_CODE = "RESEND";

    private final NotificationProperties properties;
    private final CredService credService;
    private final RestClient.Builder restClientBuilder;

    @Override
    public EmailProviderType type() {
        return EmailProviderType.RESEND;
    }

    @Override
    public NotificationProviderResponse send(String emailAddress, String subject, String body) {
        String resendBaseUrl = requireCredential("base_url");
        String resendApiKey = requireCredential("api_key");
        String resendFromAddress = requireCredential("from_address");

        String response = restClientBuilder.build()
                .post()
            .uri(resendBaseUrl)
            .header("Authorization", "Bearer " + resendApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                "from", resendFromAddress,
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

    private String requireCredential(String key) {
        String value = credService.getActiveCredentialEntriesByProviderCode(PROVIDER_CODE).get(key);
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Missing notification provider credential: " + PROVIDER_CODE + "." + key);
        }
        return value;
    }
}