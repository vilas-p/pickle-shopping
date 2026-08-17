package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.credential.CredService;
import com.appaamma.pickles.domain.notification.SmsProviderType;
import com.appaamma.pickles.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class Msg91SmsProvider implements SmsProvider {

    private static final String PROVIDER_CODE = "MSG91";

    private final NotificationProperties properties;
    private final CredService credService;
    private final RestClient.Builder restClientBuilder;

    @Override
    public SmsProviderType type() {
        return SmsProviderType.MSG91;
    }

    @Override
    public NotificationProviderResponse send(String phoneNumber, String message) {
        NotificationProperties.Sms sms = properties.sms();
        String msg91BaseUrl = requireCredential("sms_base_url");
        String msg91AuthKey = requireCredential("auth_key");
        String msg91SenderId = optionalCredential("sender_id");

        String response = restClientBuilder.build()
                .post()
            .uri(msg91BaseUrl)
            .header("authkey", msg91AuthKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "mobile", phoneNumber,
                        "message", message,
                "sender", blankToDefault(msg91SenderId, "APPAAM")
                ))
                .retrieve()
                .body(String.class);

        return new NotificationProviderResponse("msg91", null, response);
    }

    private void require(String value, String key) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Missing notification provider config: " + key);
        }
    }

    private String blankToDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private String requireCredential(String key) {
        String value = credService.getActiveCredentialEntriesByProviderCode(PROVIDER_CODE).get(key);
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Missing notification provider credential: " + PROVIDER_CODE + "." + key);
        }
        return value;
    }

    private String optionalCredential(String key) {
        return credService.getActiveCredentialEntriesByProviderCode(PROVIDER_CODE).get(key);
    }
}