package com.appaamma.pickles.api.v1.customerauth.dto;

import java.time.Instant;

public record RequestOtpResponse(String channel, Instant expiresAt) {}
