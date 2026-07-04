package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.notification.SmsProviderType;
import com.appaamma.pickles.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@RequiredArgsConstructor
public class TwilioSmsProvider implements SmsProvider {

    private final NotificationProperties properties;
    private final RestClient.Builder restClientBuilder;

    @Override
    public SmsProviderType type() {
        return SmsProviderType.TWILIO;
    }

    @Override
    public NotificationProviderResponse send(String phoneNumber, String message) {
        NotificationProperties.Sms sms = properties.sms();
        require(sms.twilioBaseUrl(), "app.notification.sms.twilio-base-url");
        require(sms.twilioAccountSid(), "app.notification.sms.twilio-account-sid");
        require(sms.twilioAuthToken(), "app.notification.sms.twilio-auth-token");
        require(sms.twilioFromNumber(), "app.notification.sms.twilio-from-number");

        LinkedMultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("To", phoneNumber);
        body.add("From", sms.twilioFromNumber());
        body.add("Body", message);

        String auth = Base64.getEncoder().encodeToString(
                (sms.twilioAccountSid() + ":" + sms.twilioAuthToken()).getBytes(StandardCharsets.UTF_8)
        );

        String response = restClientBuilder.build()
                .post()
                .uri(sms.twilioBaseUrl())
                .header("Authorization", "Basic " + auth)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(String.class);

        return new NotificationProviderResponse("twilio", null, response);
    }

    private void require(String value, String key) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Missing notification provider config: " + key);
        }
    }
}