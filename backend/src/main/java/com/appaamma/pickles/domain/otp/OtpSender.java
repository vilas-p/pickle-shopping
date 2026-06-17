package com.appaamma.pickles.domain.otp;

/**
 * Strategy for delivering an OTP code to the customer. Provider-specific implementations
 * (Msg91, Twilio, AWS SNS) live behind this interface; tests and the dev profile use
 * {@code LogOtpSender}.
 */
public interface OtpSender {

    /**
     * @return the channel/provider name actually used (for logging).
     */
    String send(OtpIdentifierKind kind, String identifier, String code, OtpPurpose purpose);
}
