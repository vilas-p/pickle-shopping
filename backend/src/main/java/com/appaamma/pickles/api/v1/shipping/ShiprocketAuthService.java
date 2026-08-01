package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.config.ShiprocketProperties;
import com.appaamma.pickles.exception.ShiprocketApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Service
@Slf4j
public class ShiprocketAuthService {

    private final ShiprocketProperties properties;
    private final RestClient restClient;

    private String cachedToken;
    private Instant tokenExpiry;

    public ShiprocketAuthService(ShiprocketProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.build();
    }

    public synchronized String getToken() {
        if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }
        return refreshToken();
    }

    public synchronized String refreshToken() {
        log.info("Refreshing Shiprocket auth token");
        String url = properties.baseUrl() + "/auth/login";

        Map<String, String> body = Map.of(
                "email", properties.email(),
                "password", properties.password()
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("token")) {
                cachedToken = (String) response.get("token");
                tokenExpiry = Instant.now().plus(properties.tokenRefreshHours(), ChronoUnit.HOURS);
                log.info("Shiprocket token refreshed, expires at {}", tokenExpiry);
                return cachedToken;
            }
            throw new ShiprocketApiException("Failed to authenticate with Shiprocket — no token in response");
        } catch (ShiprocketApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Shiprocket authentication failed", e);
            throw new ShiprocketApiException("Shiprocket auth failed: " + e.getMessage());
        }
    }

    public synchronized void invalidateToken() {
        cachedToken = null;
        tokenExpiry = null;
    }
}
