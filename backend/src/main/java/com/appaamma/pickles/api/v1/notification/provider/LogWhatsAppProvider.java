package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.domain.notification.WhatsAppProviderType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LogWhatsAppProvider implements WhatsAppProvider {

    @Override
    public WhatsAppProviderType type() {
        return WhatsAppProviderType.LOG;
    }

    @Override
    public NotificationProviderResponse send(String phoneNumber, String message) {
        log.warn("[WHATSAPP:LOG] to={} message={}", phoneNumber, message);
        return new NotificationProviderResponse("log-whatsapp", null, "logged");
    }
}