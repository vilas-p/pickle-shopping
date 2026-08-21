package com.appaamma.pickles.api.v1.customerauth.otp;

import com.appaamma.pickles.api.v1.notification.provider.WhatsAppBusinessApiProvider;
import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * WhatsApp Business API OTP delivery strategy.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WhatsAppOtpDeliveryStrategy implements OtpDeliveryStrategy {

    public static final String PROVIDER_CODE = "WHATSAPP_BUSINESS_API";

    private final WhatsAppBusinessApiProvider whatsAppProvider;

    @Override
    public String deliver(OtpIdentifierKind kind, String recipient, String otp, long expiryMinutes) {
        if (kind == OtpIdentifierKind.EMAIL) {
            throw new UnsupportedOperationException("WhatsApp strategy does not support email delivery");
        }

        String message = String.format(
            "Your Appa & Amma's Pickles login OTP is %s. It expires in %d minutes.",
            otp, expiryMinutes
        );

        try {
            whatsAppProvider.send(recipient, message);
            log.info("OTP sent via WhatsApp to {}", recipient);
            return "whatsapp";
        } catch (Exception ex) {
            log.error("Failed to send OTP via WhatsApp to {}: {}", recipient, ex.getMessage());
            throw new RuntimeException("Failed to send OTP. Please try again.", ex);
        }
    }

    @Override
    public String getProviderCode() {
        return PROVIDER_CODE;
    }
}
