package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.config.ShiprocketProperties;
import com.appaamma.pickles.exception.ShiprocketApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@Slf4j
public class ShiprocketApiClient {

    private final ShiprocketAuthService authService;
    private final ShiprocketProperties properties;
    private final RestClient restClient;

    public ShiprocketApiClient(ShiprocketAuthService authService, ShiprocketProperties properties,
                                RestClient.Builder restClientBuilder) {
        this.authService = authService;
        this.properties = properties;
        this.restClient = restClientBuilder.build();
    }

    // --- Order APIs ---

    public Map<String, Object> createOrder(Map<String, Object> orderData) {
        return post("/orders/create/adhoc", orderData);
    }

    public Map<String, Object> cancelOrder(Map<String, Object> cancelData) {
        return post("/orders/cancel", cancelData);
    }

    // --- Courier APIs ---

    public Map<String, Object> assignAwb(Map<String, Object> assignData) {
        return post("/courier/assign/awb", assignData);
    }

    public Map<String, Object> checkServiceability(String pickupPincode, String deliveryPincode,
                                                    double weight, boolean cod) {
        String path = String.format("/courier/serviceability/?pickup_postcode=%s&delivery_postcode=%s&weight=%s&cod=%d",
                pickupPincode, deliveryPincode, weight, cod ? 1 : 0);
        return get(path);
    }

    // --- Pickup & Label ---

    public Map<String, Object> schedulePickup(Map<String, Object> pickupData) {
        return post("/courier/generate/pickup", pickupData);
    }

    public Map<String, Object> generateLabel(Map<String, Object> labelData) {
        return post("/courier/generate/label", labelData);
    }

    public Map<String, Object> generateInvoice(Map<String, Object> invoiceData) {
        return post("/orders/print/invoice", invoiceData);
    }

    public Map<String, Object> generateManifest(Map<String, Object> manifestData) {
        return post("/manifests/generate", manifestData);
    }

    // --- Tracking ---

    public Map<String, Object> trackByAwb(String awb) {
        return get("/courier/track/awb/" + awb);
    }

    // --- HTTP Helpers ---

    private Map<String, Object> post(String path, Object body) {
        return executeWithRetry(path, "POST", body);
    }

    private Map<String, Object> get(String path) {
        return executeWithRetry(path, "GET", null);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> executeWithRetry(String path, String method, Object body) {
        try {
            return execute(path, method, body);
        } catch (ShiprocketApiException e) {
            if (e.getMessage() != null && e.getMessage().contains("401")) {
                log.warn("Shiprocket 401 — refreshing token and retrying");
                authService.invalidateToken();
                return execute(path, method, body);
            }
            throw e;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> execute(String path, String method, Object body) {
        String url = properties.baseUrl() + path;
        String token = authService.getToken();

        log.debug("Shiprocket {} {}", method, url);
        try {
            if ("POST".equals(method)) {
                return restClient.post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .body(body)
                        .retrieve()
                        .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                            if (res.getStatusCode().value() == 401) {
                                throw new ShiprocketApiException("Shiprocket API returned 401");
                            }
                            throw new ShiprocketApiException("Shiprocket API error: " + res.getStatusCode());
                        })
                        .body(Map.class);
            } else {
                return restClient.get()
                        .uri(url)
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                            if (res.getStatusCode().value() == 401) {
                                throw new ShiprocketApiException("Shiprocket API returned 401");
                            }
                            throw new ShiprocketApiException("Shiprocket API error: " + res.getStatusCode());
                        })
                        .body(Map.class);
            }
        } catch (ShiprocketApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Shiprocket API call failed: {} {}", method, url, e);
            throw new ShiprocketApiException("Shiprocket API error: " + e.getMessage());
        }
    }
}
