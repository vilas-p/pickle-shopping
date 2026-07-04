package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.config.NotificationProperties;
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

    private final NotificationProperties properties;
    private final RestClient.Builder restClientBuilder;

    @Override
    public SmsProviderType type() {
        return SmsProviderType.MSG91;
    }

    @Override
    public NotificationProviderResponse send(String phoneNumber, String message) {
        NotificationProperties.Sms sms = properties.sms();
        require(sms.msg91BaseUrl(), "app.notification.sms.msg91-base-url");
        require(sms.msg91AuthKey(), "app.notification.sms.msg91-auth-key");

        String response = restClientBuilder.build()
                .post()
                .uri(sms.msg91BaseUrl())
                .header("authkey", sms.msg91AuthKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "mobile", phoneNumber,
                        "message", message,
                        "sender", blankToDefault(sms.msg91SenderId(), "APPAAM")
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
}