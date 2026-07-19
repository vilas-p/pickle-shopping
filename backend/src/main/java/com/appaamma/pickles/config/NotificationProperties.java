package com.appaamma.pickles.config;

import com.appaamma.pickles.domain.notification.EmailProviderType;
import com.appaamma.pickles.domain.notification.SmsProviderType;
import com.appaamma.pickles.domain.notification.WhatsAppProviderType;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "app.notification")
public record NotificationProperties(
        @Min(1) int maxAttempts,
        Duration retryBackoff,
        Duration retryScanInterval,
        boolean asyncEnabled,
        Sms sms,
        WhatsApp whatsapp,
        Email email
) {

    public NotificationProperties {
        retryBackoff = retryBackoff == null ? Duration.ofMinutes(5) : retryBackoff;
        retryScanInterval = retryScanInterval == null ? Duration.ofMinutes(1) : retryScanInterval;
                sms = sms == null ? new Sms(SmsProviderType.MOCK, null, null, null, null, null, null, null) : sms;
                whatsapp = whatsapp == null ? new WhatsApp(WhatsAppProviderType.MOCK, null, null, null, null, null, null, null) : whatsapp;
                email = email == null ? new Email(EmailProviderType.MOCK, null, null, null, null, null, null, null, null) : email;
    }

    public record Sms(
            SmsProviderType provider,
            String msg91BaseUrl,
            String msg91AuthKey,
            String msg91SenderId,
            String twilioBaseUrl,
            String twilioAccountSid,
            String twilioAuthToken,
            String twilioFromNumber
    ) {
    }

    public record WhatsApp(
            WhatsAppProviderType provider,
            String baseUrl,
            String accessToken,
            String phoneNumberId,
            String senderName,
            String msg91BaseUrl,
            String msg91AuthKey,
            String msg91IntegratedNumber
    ) {
    }

    public record Email(
            EmailProviderType provider,
            String resendBaseUrl,
            String resendApiKey,
            String resendFromAddress,
            String sesEndpointUrl,
            String sesAccessKey,
            String sesSecretKey,
            String sesRegion,
            String sesFromAddress
    ) {
    }
}