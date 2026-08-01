package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.config.ShiprocketProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks/shiprocket")
@RequiredArgsConstructor
@Slf4j
public class ShiprocketWebhookController {

    private final ShiprocketWebhookService webhookService;
    private final ShiprocketProperties properties;

    @PostMapping
    public ResponseEntity<Void> handleWebhook(
            @RequestHeader(value = "X-Shiprocket-Secret", required = false) String secret,
            @RequestBody Map<String, Object> payload) {

        // Validate webhook secret if configured
        if (properties.webhookSecret() != null && !properties.webhookSecret().isBlank()) {
            if (!properties.webhookSecret().equals(secret)) {
                log.warn("Invalid Shiprocket webhook secret received");
                return ResponseEntity.status(401).build();
            }
        }

        log.info("Shiprocket webhook received: status_id={}, awb={}",
                payload.get("current_status_id"), payload.get("awb"));

        webhookService.processWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
