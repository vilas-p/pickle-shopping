package com.appaamma.pickles.domain.otp;

/**
 * What an OTP code is being used for. Drives downstream behaviour after verification
 * (e.g. LOGIN → issue customer JWT, ADD_ADDRESS → confirm an address change).
 */
public enum OtpPurpose {
    LOGIN,
    PHONE_CHANGE,
    EMAIL_CHANGE
}
