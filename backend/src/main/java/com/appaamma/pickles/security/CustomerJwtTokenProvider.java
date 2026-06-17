package com.appaamma.pickles.security;

import com.appaamma.pickles.config.CustomerJwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Issues and verifies JWTs for storefront customers (separate signing key from admin JWTs).
 * Subject is the numeric customer id; {@code phone} and {@code email} are carried as claims
 * so the filter can build a {@link CustomerPrincipal} without an extra DB lookup.
 */
@Slf4j
@Component
public class CustomerJwtTokenProvider {

    private static final String CLAIM_PHONE = "phone";
    private static final String CLAIM_EMAIL = "email";

    private final SecretKey key;
    private final long expirationMs;

    public CustomerJwtTokenProvider(CustomerJwtProperties props) {
        this.key = Keys.hmacShaKeyFor(props.secret().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = props.expirationMs();
    }

    public String generateToken(Long customerId, String phone, String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(customerId))
                .claim(CLAIM_PHONE, phone)
                .claim(CLAIM_EMAIL, email)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public CustomerPrincipal parseToPrincipal(String token) {
        Claims c = parse(token);
        Long id = Long.parseLong(c.getSubject());
        return new CustomerPrincipal(id, c.get(CLAIM_PHONE, String.class), c.get(CLAIM_EMAIL, String.class));
    }

    public boolean validate(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception ex) {
            log.debug("Invalid customer JWT: {}", ex.getMessage());
            return false;
        }
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
