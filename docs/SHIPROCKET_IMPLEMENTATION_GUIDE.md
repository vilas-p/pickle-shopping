# Shiprocket Integration — Step-by-Step Implementation Guide

> **Project:** Appa & Amma's Pickles  
> **Date:** 2026-07-21  
> **Reference:** [SHIPROCKET_INTEGRATION_PLAN.md](./SHIPROCKET_INTEGRATION_PLAN.md)

---

## Prerequisites

- [ ] Shiprocket account created at https://app.shiprocket.in
- [ ] Shiprocket API credentials (email + password) available
- [ ] Pickup address configured in Shiprocket dashboard
- [ ] Webhook URL registered in Shiprocket settings (after Phase 4)
- [ ] Backend running with MySQL 8 and Flyway enabled
- [ ] Frontend running with Next.js 15

---

## Phase 1: Database & Domain Layer

### Step 1.1 — Create Flyway Migration

Create file: `backend/src/main/resources/db/migration/V11__shiprocket_integration.sql`

```sql
-- ============================================================
-- V11: Shiprocket Shipping Integration
-- ============================================================

-- 1. New table: shipments
CREATE TABLE shipments (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    order_id                BIGINT          NOT NULL,
    shiprocket_order_id     BIGINT          NULL,
    shiprocket_shipment_id  BIGINT          NULL,
    awb_number              VARCHAR(50)     NULL,
    courier_name            VARCHAR(100)    NULL,
    courier_id              INT             NULL,
    status                  VARCHAR(50)     NOT NULL DEFAULT 'CREATED',
    pickup_scheduled_date   DATE            NULL,
    pickup_token            VARCHAR(100)    NULL,
    label_url               VARCHAR(500)    NULL,
    manifest_url            VARCHAR(500)    NULL,
    invoice_url             VARCHAR(500)    NULL,
    estimated_delivery_date DATE            NULL,
    actual_delivery_date    DATETIME(6)     NULL,
    shipping_charge         DECIMAL(10,2)   NULL,
    weight                  DECIMAL(6,3)    NULL,
    length                  DECIMAL(6,2)    NULL,
    breadth                 DECIMAL(6,2)    NULL,
    height                  DECIMAL(6,2)    NULL,
    channel_order_id        VARCHAR(50)     NULL,
    cancellation_reason     VARCHAR(500)    NULL,
    created_at              DATETIME(6)     NOT NULL,
    updated_at              DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_shipments_order (order_id),
    KEY idx_shipments_awb (awb_number),
    KEY idx_shipments_status (status),
    KEY idx_shipments_sr_order (shiprocket_order_id),
    CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. New table: shipment_events
CREATE TABLE shipment_events (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    shipment_id         BIGINT          NOT NULL,
    status              VARCHAR(50)     NOT NULL,
    status_code         INT             NULL,
    description         VARCHAR(500)    NULL,
    location            VARCHAR(200)    NULL,
    event_time          DATETIME(6)     NOT NULL,
    shiprocket_status   VARCHAR(100)    NULL,
    raw_payload         JSON            NULL,
    created_at          DATETIME(6)     NOT NULL,
    updated_at          DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_se_shipment (shipment_id),
    KEY idx_se_event_time (event_time),
    CONSTRAINT fk_se_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. New table: shiprocket_tokens
CREATE TABLE shiprocket_tokens (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    token           TEXT            NOT NULL,
    expires_at      DATETIME(6)     NOT NULL,
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Add shipping columns to orders table
ALTER TABLE orders
    ADD COLUMN tracking_number VARCHAR(50) NULL AFTER notes,
    ADD COLUMN courier_name VARCHAR(100) NULL AFTER tracking_number,
    ADD COLUMN estimated_delivery_date DATE NULL AFTER courier_name,
    ADD COLUMN shipped_at DATETIME(6) NULL AFTER estimated_delivery_date,
    ADD COLUMN delivered_at DATETIME(6) NULL AFTER shipped_at;
```

### Step 1.2 — Create `ShipmentStatus` Enum

Create file: `backend/src/main/java/com/appaamma/pickles/domain/shipping/ShipmentStatus.java`

```java
package com.appaamma.pickles.domain.shipping;

public enum ShipmentStatus {
    CREATED,
    AWB_ASSIGNED,
    LABEL_GENERATED,
    PICKUP_SCHEDULED,
    PICKED_UP,
    IN_TRANSIT,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    RTO_INITIATED,
    RTO_DELIVERED,
    CREATION_FAILED
}
```

### Step 1.3 — Create `Shipment` Entity

Create file: `backend/src/main/java/com/appaamma/pickles/domain/shipping/Shipment.java`

```java
package com.appaamma.pickles.domain.shipping;

import com.appaamma.pickles.common.BaseEntity;
import com.appaamma.pickles.domain.order.Order;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Shipment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "shiprocket_order_id")
    private Long shiprocketOrderId;

    @Column(name = "shiprocket_shipment_id")
    private Long shiprocketShipmentId;

    @Column(name = "awb_number", length = 50)
    private String awbNumber;

    @Column(name = "courier_name", length = 100)
    private String courierName;

    @Column(name = "courier_id")
    private Integer courierId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.CREATED;

    @Column(name = "pickup_scheduled_date")
    private LocalDate pickupScheduledDate;

    @Column(name = "pickup_token", length = 100)
    private String pickupToken;

    @Column(name = "label_url", length = 500)
    private String labelUrl;

    @Column(name = "manifest_url", length = 500)
    private String manifestUrl;

    @Column(name = "invoice_url", length = 500)
    private String invoiceUrl;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private Instant actualDeliveryDate;

    @Column(name = "shipping_charge", precision = 10, scale = 2)
    private BigDecimal shippingCharge;

    @Column(precision = 6, scale = 3)
    private BigDecimal weight;

    @Column(name = "length", precision = 6, scale = 2)
    private BigDecimal length;

    @Column(name = "breadth", precision = 6, scale = 2)
    private BigDecimal breadth;

    @Column(name = "height", precision = 6, scale = 2)
    private BigDecimal height;

    @Column(name = "channel_order_id", length = 50)
    private String channelOrderId;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ShipmentEvent> events = new ArrayList<>();
}
```

### Step 1.4 — Create `ShipmentEvent` Entity

Create file: `backend/src/main/java/com/appaamma/pickles/domain/shipping/ShipmentEvent.java`

```java
package com.appaamma.pickles.domain.shipping;

import com.appaamma.pickles.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "shipment_events")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ShipmentEvent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(length = 500)
    private String description;

    @Column(length = 200)
    private String location;

    @Column(name = "event_time", nullable = false)
    private Instant eventTime;

    @Column(name = "shiprocket_status", length = 100)
    private String shiprocketStatus;

    @Column(name = "raw_payload", columnDefinition = "JSON")
    private String rawPayload;
}
```

### Step 1.5 — Create Repositories

Create file: `backend/src/main/java/com/appaamma/pickles/domain/shipping/ShipmentRepository.java`

```java
package com.appaamma.pickles.domain.shipping;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByOrderId(Long orderId);

    Optional<Shipment> findByAwbNumber(String awbNumber);

    Optional<Shipment> findByShiprocketOrderId(Long shiprocketOrderId);

    Page<Shipment> findByStatus(ShipmentStatus status, Pageable pageable);

    boolean existsByOrderId(Long orderId);
}
```

Create file: `backend/src/main/java/com/appaamma/pickles/domain/shipping/ShipmentEventRepository.java`

```java
package com.appaamma.pickles.domain.shipping;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentEventRepository extends JpaRepository<ShipmentEvent, Long> {

    List<ShipmentEvent> findByShipmentIdOrderByEventTimeAsc(Long shipmentId);
}
```

### Step 1.6 — Update `OrderStatus` Enum

Edit file: `backend/src/main/java/com/appaamma/pickles/domain/order/OrderStatus.java`

Add new values and update transition map:

```java
package com.appaamma.pickles.domain.order;

import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PACKED,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    RTO_INITIATED,
    RTO_DELIVERED;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_NEXT = Map.of(
            PENDING,            Set.of(CONFIRMED, CANCELLED),
            CONFIRMED,          Set.of(PACKED, CANCELLED),
            PACKED,             Set.of(SHIPPED, CANCELLED),
            SHIPPED,            Set.of(OUT_FOR_DELIVERY, DELIVERED, RTO_INITIATED),
            OUT_FOR_DELIVERY,   Set.of(DELIVERED, RTO_INITIATED),
            DELIVERED,          Set.of(),
            CANCELLED,          Set.of(),
            RTO_INITIATED,      Set.of(RTO_DELIVERED),
            RTO_DELIVERED,      Set.of()
    );

    public boolean canTransitionTo(OrderStatus next) {
        return ALLOWED_NEXT.getOrDefault(this, Set.of()).contains(next);
    }

    public boolean isTerminal() {
        return ALLOWED_NEXT.getOrDefault(this, Set.of()).isEmpty();
    }
}
```

### Step 1.7 — Add Shipping Fields to `Order` Entity

Add these fields to `Order.java` (after the `notes` field):

```java
@Column(name = "tracking_number", length = 50)
private String trackingNumber;

@Column(name = "courier_name", length = 100)
private String courierName;

@Column(name = "estimated_delivery_date")
private LocalDate estimatedDeliveryDate;

@Column(name = "shipped_at")
private Instant shippedAt;

@Column(name = "delivered_at")
private Instant deliveredAt;
```

Add imports: `java.time.Instant` and `java.time.LocalDate`.

---

## Phase 2: Configuration & Authentication

### Step 2.1 — Create `ShiprocketProperties`

Create file: `backend/src/main/java/com/appaamma/pickles/config/ShiprocketProperties.java`

```java
package com.appaamma.pickles.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;

@Validated
@ConfigurationProperties(prefix = "app.shiprocket")
public record ShiprocketProperties(
        @NotBlank String email,
        @NotBlank String password,
        @NotBlank String baseUrl,
        int tokenRefreshHours,
        String webhookSecret,
        String pickupLocationId,
        String pickupPincode,
        BigDecimal defaultWeightKg,
        BigDecimal defaultLengthCm,
        BigDecimal defaultBreadthCm,
        BigDecimal defaultHeightCm,
        boolean autoCreateShipment,
        boolean autoAssignAwb,
        boolean autoSchedulePickup
) {}
```

### Step 2.2 — Add Configuration to `application.yml`

Add under the `app:` section (after `razorpay:`):

```yaml
  shiprocket:
    email: ${SHIPROCKET_EMAIL:}
    password: ${SHIPROCKET_PASSWORD:}
    base-url: ${SHIPROCKET_BASE_URL:https://apiv2.shiprocket.in/v1/external}
    token-refresh-hours: ${SHIPROCKET_TOKEN_REFRESH_HOURS:216}
    webhook-secret: ${SHIPROCKET_WEBHOOK_SECRET:}
    pickup-location-id: ${SHIPROCKET_PICKUP_LOCATION_ID:}
    pickup-pincode: ${SHIPROCKET_PICKUP_PINCODE:585225}
    default-weight-kg: ${SHIPROCKET_DEFAULT_WEIGHT_KG:0.5}
    default-length-cm: ${SHIPROCKET_DEFAULT_LENGTH_CM:20}
    default-breadth-cm: ${SHIPROCKET_DEFAULT_BREADTH_CM:15}
    default-height-cm: ${SHIPROCKET_DEFAULT_HEIGHT_CM:10}
    auto-create-shipment: ${SHIPROCKET_AUTO_CREATE_SHIPMENT:true}
    auto-assign-awb: ${SHIPROCKET_AUTO_ASSIGN_AWB:true}
    auto-schedule-pickup: ${SHIPROCKET_AUTO_SCHEDULE_PICKUP:false}
```

### Step 2.3 — Enable Configuration Properties

In `PicklesApplication.java`, add:

```java
@EnableConfigurationProperties({..., ShiprocketProperties.class})
```

Or add to an existing `@Configuration` class.

### Step 2.4 — Create `ShiprocketAuthService`

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/ShiprocketAuthService.java`

```java
package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.config.ShiprocketProperties;
import com.appaamma.pickles.exception.ShiprocketApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShiprocketAuthService {

    private final ShiprocketProperties properties;
    private final RestTemplate restTemplate;

    private String cachedToken;
    private Instant tokenExpiry;

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

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                cachedToken = (String) response.getBody().get("token");
                // Shiprocket tokens are valid for ~10 days; refresh early
                tokenExpiry = Instant.now().plus(properties.tokenRefreshHours(), ChronoUnit.HOURS);
                log.info("Shiprocket token refreshed, expires at {}", tokenExpiry);
                return cachedToken;
            }
            throw new ShiprocketApiException("Failed to authenticate with Shiprocket");
        } catch (Exception e) {
            log.error("Shiprocket authentication failed", e);
            throw new ShiprocketApiException("Shiprocket auth failed: " + e.getMessage());
        }
    }

    public void invalidateToken() {
        cachedToken = null;
        tokenExpiry = null;
    }
}
```

### Step 2.5 — Create `ShiprocketApiClient`

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/ShiprocketApiClient.java`

```java
package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.config.ShiprocketProperties;
import com.appaamma.pickles.exception.ShiprocketApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ShiprocketApiClient {

    private final ShiprocketAuthService authService;
    private final ShiprocketProperties properties;
    private final RestTemplate restTemplate;

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
        String url = String.format("/courier/serviceability/?pickup_postcode=%s&delivery_postcode=%s&weight=%s&cod=%d",
                pickupPincode, deliveryPincode, weight, cod ? 1 : 0);
        return get(url);
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
        return executeWithRetry(path, HttpMethod.POST, body);
    }

    private Map<String, Object> get(String path) {
        return executeWithRetry(path, HttpMethod.GET, null);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> executeWithRetry(String path, HttpMethod method, Object body) {
        try {
            return execute(path, method, body);
        } catch (HttpClientErrorException.Unauthorized e) {
            log.warn("Shiprocket 401 — refreshing token and retrying");
            authService.invalidateToken();
            return execute(path, method, body);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> execute(String path, HttpMethod method, Object body) {
        String url = properties.baseUrl() + path;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(authService.getToken());

        HttpEntity<?> request = body != null ? new HttpEntity<>(body, headers) : new HttpEntity<>(headers);

        log.debug("Shiprocket {} {}", method, url);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, method, request, Map.class);
            return response.getBody();
        } catch (HttpClientErrorException.Unauthorized e) {
            throw e; // Let retry logic handle
        } catch (Exception e) {
            log.error("Shiprocket API call failed: {} {}", method, url, e);
            throw new ShiprocketApiException("Shiprocket API error: " + e.getMessage());
        }
    }
}
```

### Step 2.6 — Add `RestTemplate` Bean

If not already defined, add to a config class or create a new one:

```java
@Bean
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

---

## Phase 3: Core Shipment Service & Controllers

### Step 3.1 — Create Exception Classes

Create file: `backend/src/main/java/com/appaamma/pickles/exception/ShiprocketApiException.java`

```java
package com.appaamma.pickles.exception;

public class ShiprocketApiException extends RuntimeException {
    public ShiprocketApiException(String message) {
        super(message);
    }
}
```

Create file: `backend/src/main/java/com/appaamma/pickles/exception/ShipmentCreationException.java`

```java
package com.appaamma.pickles.exception;

public class ShipmentCreationException extends RuntimeException {
    public ShipmentCreationException(String message) {
        super(message);
    }
}
```

Create file: `backend/src/main/java/com/appaamma/pickles/exception/CourierUnavailableException.java`

```java
package com.appaamma.pickles.exception;

public class CourierUnavailableException extends RuntimeException {
    public CourierUnavailableException(String message) {
        super(message);
    }
}
```

Create file: `backend/src/main/java/com/appaamma/pickles/exception/ServiceabilityException.java`

```java
package com.appaamma.pickles.exception;

public class ServiceabilityException extends RuntimeException {
    public ServiceabilityException(String message) {
        super(message);
    }
}
```

### Step 3.2 — Add Exceptions to `GlobalExceptionHandler`

Add handler methods for the four new exception types. Map them to appropriate HTTP status codes:

- `ShiprocketApiException` → 502 Bad Gateway
- `ShipmentCreationException` → 500 Internal Server Error
- `CourierUnavailableException` → 422 Unprocessable Entity
- `ServiceabilityException` → 422 Unprocessable Entity

### Step 3.3 — Create DTOs

Create directory: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/dto/`

**CreateShipmentRequest.java**
```java
package com.appaamma.pickles.api.v1.shipping.dto;

import jakarta.validation.constraints.NotNull;

public record CreateShipmentRequest(
        @NotNull Long orderId,
        Integer courierId  // Optional: specify preferred courier
) {}
```

**ShipmentResponse.java**
```java
package com.appaamma.pickles.api.v1.shipping.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ShipmentResponse(
        Long id,
        Long orderId,
        String orderNumber,
        Long shiprocketOrderId,
        Long shiprocketShipmentId,
        String awbNumber,
        String courierName,
        Integer courierId,
        String status,
        LocalDate pickupScheduledDate,
        String labelUrl,
        String manifestUrl,
        String invoiceUrl,
        LocalDate estimatedDeliveryDate,
        Instant actualDeliveryDate,
        BigDecimal shippingCharge,
        BigDecimal weight,
        Instant createdAt,
        Instant updatedAt
) {}
```

**ServiceabilityRequest.java**
```java
package com.appaamma.pickles.api.v1.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ServiceabilityRequest(
        @NotBlank String deliveryPincode,
        @Positive double weight,
        boolean cod
) {}
```

**ServiceabilityResponse.java**
```java
package com.appaamma.pickles.api.v1.shipping.dto;

import java.util.List;

public record ServiceabilityResponse(
        boolean serviceable,
        List<CourierOption> availableCouriers
) {
    public record CourierOption(
            int courierId,
            String courierName,
            double rate,
            int estimatedDays,
            boolean cod
    ) {}
}
```

**ShippingRateRequest.java**
```java
package com.appaamma.pickles.api.v1.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ShippingRateRequest(
        @NotBlank String deliveryPincode,
        @Positive double weight,
        boolean cod
) {}
```

**TrackingResponse.java**
```java
package com.appaamma.pickles.api.v1.shipping.dto;

import java.time.Instant;
import java.util.List;

public record TrackingResponse(
        String orderNumber,
        String awbNumber,
        String courierName,
        String currentStatus,
        String estimatedDelivery,
        String trackingUrl,
        List<TrackingEvent> events
) {
    public record TrackingEvent(
            String status,
            String description,
            String location,
            Instant timestamp
    ) {}
}
```

### Step 3.4 — Create `ShiprocketStatusMapper`

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/ShiprocketStatusMapper.java`

```java
package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.shipping.ShipmentStatus;

import java.util.Map;

public final class ShiprocketStatusMapper {

    private ShiprocketStatusMapper() {}

    private static final Map<Integer, ShipmentStatus> SHIPMENT_STATUS_MAP = Map.ofEntries(
            Map.entry(1, ShipmentStatus.AWB_ASSIGNED),
            Map.entry(2, ShipmentStatus.LABEL_GENERATED),
            Map.entry(3, ShipmentStatus.PICKUP_SCHEDULED),
            Map.entry(4, ShipmentStatus.PICKUP_SCHEDULED),
            Map.entry(5, ShipmentStatus.PICKUP_SCHEDULED),
            Map.entry(6, ShipmentStatus.IN_TRANSIT),
            Map.entry(7, ShipmentStatus.DELIVERED),
            Map.entry(8, ShipmentStatus.CANCELLED),
            Map.entry(9, ShipmentStatus.RTO_INITIATED),
            Map.entry(10, ShipmentStatus.RTO_DELIVERED),
            Map.entry(17, ShipmentStatus.OUT_FOR_DELIVERY),
            Map.entry(18, ShipmentStatus.IN_TRANSIT),
            Map.entry(19, ShipmentStatus.PICKUP_SCHEDULED),
            Map.entry(38, ShipmentStatus.IN_TRANSIT)
    );

    private static final Map<Integer, OrderStatus> ORDER_STATUS_MAP = Map.of(
            6, OrderStatus.SHIPPED,
            7, OrderStatus.DELIVERED,
            8, OrderStatus.CANCELLED,
            9, OrderStatus.RTO_INITIATED,
            10, OrderStatus.RTO_DELIVERED,
            17, OrderStatus.OUT_FOR_DELIVERY
    );

    public static ShipmentStatus toShipmentStatus(int statusId) {
        return SHIPMENT_STATUS_MAP.getOrDefault(statusId, ShipmentStatus.IN_TRANSIT);
    }

    public static OrderStatus toOrderStatus(int statusId) {
        return ORDER_STATUS_MAP.get(statusId);
    }

    public static boolean shouldUpdateOrderStatus(int statusId) {
        return ORDER_STATUS_MAP.containsKey(statusId);
    }
}
```

### Step 3.5 — Create `ShipmentService`

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/ShipmentService.java`

```java
package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.*;
import com.appaamma.pickles.config.ShiprocketProperties;
import com.appaamma.pickles.domain.order.Order;
import com.appaamma.pickles.domain.order.OrderItem;
import com.appaamma.pickles.domain.order.OrderRepository;
import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.shipping.*;
import com.appaamma.pickles.exception.ShipmentCreationException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventRepository shipmentEventRepository;
    private final OrderRepository orderRepository;
    private final ShiprocketApiClient apiClient;
    private final ShiprocketProperties properties;

    @Transactional
    public ShipmentResponse createShipment(CreateShipmentRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + request.orderId()));

        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.PACKED) {
            throw new ShipmentCreationException("Order must be CONFIRMED or PACKED to create shipment");
        }

        if (shipmentRepository.existsByOrderId(order.getId())) {
            throw new ShipmentCreationException("Shipment already exists for order: " + order.getOrderNumber());
        }

        // Build Shiprocket order payload
        Map<String, Object> orderData = buildShiprocketOrderPayload(order);

        Map<String, Object> response = apiClient.createOrder(orderData);

        Shipment shipment = Shipment.builder()
                .order(order)
                .shiprocketOrderId(toLong(response.get("order_id")))
                .shiprocketShipmentId(toLong(response.get("shipment_id")))
                .status(ShipmentStatus.CREATED)
                .weight(properties.defaultWeightKg())
                .length(properties.defaultLengthCm())
                .breadth(properties.defaultBreadthCm())
                .height(properties.defaultHeightCm())
                .build();

        shipment = shipmentRepository.save(shipment);
        log.info("Shipment created for order {} — SR Order ID: {}", order.getOrderNumber(), shipment.getShiprocketOrderId());

        // Auto-assign AWB if enabled
        if (properties.autoAssignAwb()) {
            assignAwbInternal(shipment, request.courierId());
        }

        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse assignAwb(Long shipmentId) {
        Shipment shipment = findShipment(shipmentId);
        assignAwbInternal(shipment, null);
        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse schedulePickup(Long shipmentId) {
        Shipment shipment = findShipment(shipmentId);

        Map<String, Object> pickupData = Map.of("shipment_id", List.of(shipment.getShiprocketShipmentId()));
        Map<String, Object> response = apiClient.schedulePickup(pickupData);

        if (response.containsKey("pickup_scheduled_date")) {
            shipment.setPickupScheduledDate(LocalDate.parse((String) response.get("pickup_scheduled_date")));
        }
        if (response.containsKey("pickup_token_number")) {
            shipment.setPickupToken(String.valueOf(response.get("pickup_token_number")));
        }
        shipment.setStatus(ShipmentStatus.PICKUP_SCHEDULED);
        shipmentRepository.save(shipment);

        log.info("Pickup scheduled for shipment {} on {}", shipmentId, shipment.getPickupScheduledDate());
        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse cancelShipment(Long shipmentId, String reason) {
        Shipment shipment = findShipment(shipmentId);

        Map<String, Object> cancelData = Map.of("ids", List.of(shipment.getShiprocketOrderId()));
        apiClient.cancelOrder(cancelData);

        shipment.setStatus(ShipmentStatus.CANCELLED);
        shipment.setCancellationReason(reason);
        shipmentRepository.save(shipment);

        log.info("Shipment {} cancelled: {}", shipmentId, reason);
        return toResponse(shipment);
    }

    public String getLabel(Long shipmentId) {
        Shipment shipment = findShipment(shipmentId);

        if (shipment.getLabelUrl() != null) {
            return shipment.getLabelUrl();
        }

        Map<String, Object> labelData = Map.of("shipment_id", List.of(shipment.getShiprocketShipmentId()));
        Map<String, Object> response = apiClient.generateLabel(labelData);
        String labelUrl = (String) response.get("label_url");

        shipment.setLabelUrl(labelUrl);
        shipmentRepository.save(shipment);
        return labelUrl;
    }

    public ShipmentResponse getById(Long shipmentId) {
        return toResponse(findShipment(shipmentId));
    }

    public ShipmentResponse getByOrderId(Long orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("No shipment for order: " + orderId));
        return toResponse(shipment);
    }

    public Page<ShipmentResponse> list(Pageable pageable) {
        return shipmentRepository.findAll(pageable).map(this::toResponse);
    }

    // --- Private Helpers ---

    private void assignAwbInternal(Shipment shipment, Integer preferredCourierId) {
        Map<String, Object> assignData = new HashMap<>();
        assignData.put("shipment_id", shipment.getShiprocketShipmentId());
        if (preferredCourierId != null) {
            assignData.put("courier_id", preferredCourierId);
        }

        Map<String, Object> response = apiClient.assignAwb(assignData);
        @SuppressWarnings("unchecked")
        Map<String, Object> assignResponse = (Map<String, Object>) response.get("response");

        if (assignResponse != null) {
            Map<String, Object> data = (Map<String, Object>) assignResponse.get("data");
            if (data != null) {
                shipment.setAwbNumber(String.valueOf(data.get("awb_code")));
                shipment.setCourierName(String.valueOf(data.get("courier_name")));
                shipment.setCourierId((Integer) data.get("courier_company_id"));
            }
        }

        shipment.setStatus(ShipmentStatus.AWB_ASSIGNED);
        shipmentRepository.save(shipment);

        // Update order tracking number
        Order order = shipment.getOrder();
        order.setTrackingNumber(shipment.getAwbNumber());
        order.setCourierName(shipment.getCourierName());
        orderRepository.save(order);

        log.info("AWB assigned for shipment {}: {} ({})", shipment.getId(), shipment.getAwbNumber(), shipment.getCourierName());
    }

    private Map<String, Object> buildShiprocketOrderPayload(Order order) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("order_id", order.getOrderNumber());
        payload.put("order_date", order.getCreatedAt().toString().substring(0, 10));
        payload.put("pickup_location", properties.pickupLocationId());
        payload.put("billing_customer_name", order.getCustomer().getName());
        payload.put("billing_last_name", "");
        payload.put("billing_address", order.getShippingAddress().getLine1());
        payload.put("billing_city", order.getShippingAddress().getCity());
        payload.put("billing_pincode", order.getShippingAddress().getPincode());
        payload.put("billing_state", order.getShippingAddress().getState());
        payload.put("billing_country", "India");
        payload.put("billing_email", order.getCustomer().getEmail() != null ? order.getCustomer().getEmail() : "");
        payload.put("billing_phone", order.getCustomer().getPhone());

        // Shipping = Billing for this flow
        payload.put("shipping_is_billing", true);

        payload.put("payment_method", order.getPaymentMethod().name().equals("COD") ? "COD" : "Prepaid");
        payload.put("sub_total", order.getSubtotal().doubleValue());

        // Order items
        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            Map<String, Object> lineItem = new LinkedHashMap<>();
            lineItem.put("name", item.getProductName());
            lineItem.put("sku", "SKU-" + item.getProductId());
            lineItem.put("units", item.getQuantity());
            lineItem.put("selling_price", item.getUnitPrice().doubleValue());
            items.add(lineItem);
        }
        payload.put("order_items", items);

        payload.put("weight", properties.defaultWeightKg().doubleValue());
        payload.put("length", properties.defaultLengthCm().intValue());
        payload.put("breadth", properties.defaultBreadthCm().intValue());
        payload.put("height", properties.defaultHeightCm().intValue());

        return payload;
    }

    private Shipment findShipment(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found: " + id));
    }

    private ShipmentResponse toResponse(Shipment s) {
        return new ShipmentResponse(
                s.getId(),
                s.getOrder().getId(),
                s.getOrder().getOrderNumber(),
                s.getShiprocketOrderId(),
                s.getShiprocketShipmentId(),
                s.getAwbNumber(),
                s.getCourierName(),
                s.getCourierId(),
                s.getStatus().name(),
                s.getPickupScheduledDate(),
                s.getLabelUrl(),
                s.getManifestUrl(),
                s.getInvoiceUrl(),
                s.getEstimatedDeliveryDate(),
                s.getActualDeliveryDate(),
                s.getShippingCharge(),
                s.getWeight(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        return Long.parseLong(value.toString());
    }
}
```

### Step 3.6 — Create `ServiceabilityService`

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/ServiceabilityService.java`

```java
package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.ServiceabilityRequest;
import com.appaamma.pickles.api.v1.shipping.dto.ServiceabilityResponse;
import com.appaamma.pickles.config.ShiprocketProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceabilityService {

    private final ShiprocketApiClient apiClient;
    private final ShiprocketProperties properties;

    public ServiceabilityResponse check(ServiceabilityRequest request) {
        Map<String, Object> response = apiClient.checkServiceability(
                properties.pickupPincode(),
                request.deliveryPincode(),
                request.weight(),
                request.cod()
        );

        List<ServiceabilityResponse.CourierOption> couriers = new ArrayList<>();

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) response.get("data");
        if (data != null) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> courierList = (List<Map<String, Object>>) data.get("available_courier_companies");
            if (courierList != null) {
                for (Map<String, Object> c : courierList) {
                    couriers.add(new ServiceabilityResponse.CourierOption(
                            ((Number) c.get("courier_company_id")).intValue(),
                            (String) c.get("courier_name"),
                            ((Number) c.get("rate")).doubleValue(),
                            ((Number) c.get("estimated_delivery_days")).intValue(),
                            Boolean.TRUE.equals(c.get("cod"))
                    ));
                }
            }
        }

        return new ServiceabilityResponse(!couriers.isEmpty(), couriers);
    }
}
```

### Step 3.7 — Create Controllers

**ShipmentController.java** — Admin endpoints

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/ShipmentController.java`

```java
package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.CreateShipmentRequest;
import com.appaamma.pickles.api.v1.shipping.dto.ShipmentResponse;
import com.appaamma.pickles.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shipments")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ShipmentResponse> create(@Valid @RequestBody CreateShipmentRequest request) {
        return ApiResponse.success(shipmentService.createShipment(request));
    }

    @GetMapping
    public ApiResponse<Page<ShipmentResponse>> list(Pageable pageable) {
        return ApiResponse.success(shipmentService.list(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ShipmentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(shipmentService.getById(id));
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<ShipmentResponse> getByOrderId(@PathVariable Long orderId) {
        return ApiResponse.success(shipmentService.getByOrderId(orderId));
    }

    @PostMapping("/{id}/assign-awb")
    public ApiResponse<ShipmentResponse> assignAwb(@PathVariable Long id) {
        return ApiResponse.success(shipmentService.assignAwb(id));
    }

    @PostMapping("/{id}/pickup")
    public ApiResponse<ShipmentResponse> schedulePickup(@PathVariable Long id) {
        return ApiResponse.success(shipmentService.schedulePickup(id));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<ShipmentResponse> cancel(@PathVariable Long id, @RequestParam String reason) {
        return ApiResponse.success(shipmentService.cancelShipment(id, reason));
    }

    @GetMapping("/{id}/label")
    public ApiResponse<String> getLabel(@PathVariable Long id) {
        return ApiResponse.success(shipmentService.getLabel(id));
    }
}
```

**ServiceabilityController.java** — Public endpoint

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/ServiceabilityController.java`

```java
package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.ServiceabilityRequest;
import com.appaamma.pickles.api.v1.shipping.dto.ServiceabilityResponse;
import com.appaamma.pickles.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class ServiceabilityController {

    private final ServiceabilityService serviceabilityService;

    @PostMapping("/serviceability")
    public ApiResponse<ServiceabilityResponse> checkServiceability(
            @Valid @RequestBody ServiceabilityRequest request) {
        return ApiResponse.success(serviceabilityService.check(request));
    }
}
```

### Step 3.8 — Update `SecurityConfig`

Add to the permit-all list in `securityFilterChain`:

```java
.requestMatchers("/api/v1/shipping/serviceability").permitAll()
.requestMatchers("/api/v1/shipping/rates").permitAll()
.requestMatchers("/api/v1/tracking/**").permitAll()
.requestMatchers("/api/v1/webhooks/shiprocket").permitAll()
```

---

## Phase 4: Webhook Processing

### Step 4.1 — Create `ShiprocketWebhookController`

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/ShiprocketWebhookController.java`

```java
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
```

### Step 4.2 — Create `ShiprocketWebhookService`

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/ShiprocketWebhookService.java`

```java
package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.domain.order.Order;
import com.appaamma.pickles.domain.order.OrderRepository;
import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.shipping.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShiprocketWebhookService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventRepository shipmentEventRepository;
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void processWebhook(Map<String, Object> payload) {
        String awb = getString(payload, "awb");
        int statusId = getInt(payload, "current_status_id");
        String statusText = getString(payload, "current_status");

        // Find shipment by AWB or Shiprocket order ID
        Optional<Shipment> shipmentOpt = findShipment(payload);
        if (shipmentOpt.isEmpty()) {
            log.warn("No shipment found for webhook payload: awb={}, order_id={}",
                    awb, payload.get("order_id"));
            return;
        }

        Shipment shipment = shipmentOpt.get();

        // Create event record (idempotency: always log the event)
        ShipmentEvent event = ShipmentEvent.builder()
                .shipment(shipment)
                .status(statusText)
                .statusCode(statusId)
                .description(getString(payload, "description"))
                .location(getString(payload, "current_city"))
                .eventTime(Instant.now())
                .shiprocketStatus(statusText)
                .rawPayload(payload.toString())
                .build();
        shipmentEventRepository.save(event);

        // Update shipment status
        ShipmentStatus newShipmentStatus = ShiprocketStatusMapper.toShipmentStatus(statusId);
        shipment.setStatus(newShipmentStatus);

        if (statusId == 7) { // Delivered
            shipment.setActualDeliveryDate(Instant.now());
        }

        shipmentRepository.save(shipment);

        // Update order status if applicable
        if (ShiprocketStatusMapper.shouldUpdateOrderStatus(statusId)) {
            OrderStatus newOrderStatus = ShiprocketStatusMapper.toOrderStatus(statusId);
            Order order = shipment.getOrder();

            if (order.getStatus().canTransitionTo(newOrderStatus)) {
                order.setStatus(newOrderStatus);

                if (newOrderStatus == OrderStatus.SHIPPED) {
                    order.setShippedAt(Instant.now());
                } else if (newOrderStatus == OrderStatus.DELIVERED) {
                    order.setDeliveredAt(Instant.now());
                }

                orderRepository.save(order);
                log.info("Order {} status updated to {} via webhook", order.getOrderNumber(), newOrderStatus);

                // Publish notification event
                // eventPublisher.publishEvent(new OrderStatusChangedEvent(order, newOrderStatus));
            } else {
                log.warn("Cannot transition order {} from {} to {} — skipping",
                        order.getOrderNumber(), order.getStatus(), newOrderStatus);
            }
        }
    }

    private Optional<Shipment> findShipment(Map<String, Object> payload) {
        String awb = getString(payload, "awb");
        if (awb != null && !awb.isBlank()) {
            Optional<Shipment> byAwb = shipmentRepository.findByAwbNumber(awb);
            if (byAwb.isPresent()) return byAwb;
        }

        Object orderId = payload.get("order_id");
        if (orderId != null) {
            try {
                Long srOrderId = Long.parseLong(orderId.toString());
                return shipmentRepository.findByShiprocketOrderId(srOrderId);
            } catch (NumberFormatException ignored) {}
        }

        return Optional.empty();
    }

    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : null;
    }

    private int getInt(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof Number n) return n.intValue();
        if (val != null) return Integer.parseInt(val.toString());
        return 0;
    }
}
```

---

## Phase 5: Public Tracking API

### Step 5.1 — Create Tracking Controller

Create file: `backend/src/main/java/com/appaamma/pickles/api/v1/shipping/TrackingController.java`

```java
package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.TrackingResponse;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.domain.order.Order;
import com.appaamma.pickles.domain.order.OrderRepository;
import com.appaamma.pickles.domain.shipping.Shipment;
import com.appaamma.pickles.domain.shipping.ShipmentEvent;
import com.appaamma.pickles.domain.shipping.ShipmentEventRepository;
import com.appaamma.pickles.domain.shipping.ShipmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventRepository shipmentEventRepository;

    @GetMapping("/{orderNumber}")
    public ApiResponse<TrackingResponse> track(@PathVariable String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderNumber));

        Shipment shipment = shipmentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new EntityNotFoundException("No shipment for order: " + orderNumber));

        List<ShipmentEvent> events = shipmentEventRepository
                .findByShipmentIdOrderByEventTimeAsc(shipment.getId());

        List<TrackingResponse.TrackingEvent> trackingEvents = events.stream()
                .map(e -> new TrackingResponse.TrackingEvent(
                        e.getStatus(),
                        e.getDescription(),
                        e.getLocation(),
                        e.getEventTime()
                ))
                .toList();

        return ApiResponse.success(new TrackingResponse(
                order.getOrderNumber(),
                shipment.getAwbNumber(),
                shipment.getCourierName(),
                shipment.getStatus().name(),
                shipment.getEstimatedDeliveryDate() != null ? shipment.getEstimatedDeliveryDate().toString() : null,
                null, // tracking URL can be constructed from courier + AWB
                trackingEvents
        ));
    }
}
```

---

## Phase 6: Notification Enhancement

### Step 6.1 — Create Migration for Notification Templates

Create file: `backend/src/main/resources/db/migration/V12__shiprocket_notification_templates.sql`

```sql
-- ============================================================
-- V12: Notification templates for Shiprocket shipping events
-- ============================================================

INSERT INTO notification_templates (code, channel, subject, body, description, active, created_at, updated_at) VALUES
('SHIPMENT_CREATED_WHATSAPP', 'WHATSAPP', NULL,
 '📦 *Shipment Created!*\n\nHi {{customerName}},\n\nYour order *{{orderNumber}}* has been prepared for shipping.\n\nWe''ll notify you once it''s picked up by the courier.\n\n— Appa & Amma''s Pickles',
 'Sent when shipment is created on Shiprocket', true, NOW(), NOW()),

('ORDER_SHIPPED_WHATSAPP', 'WHATSAPP', NULL,
 '🚚 *Order Shipped!*\n\nHi {{customerName}},\n\nYour order *{{orderNumber}}* is on its way!\n\n📦 Courier: {{courierName}}\n🔢 Tracking: {{awbNumber}}\n📅 Expected by: {{estimatedDeliveryDate}}\n\nTrack: {{trackingUrl}}\n\n— Appa & Amma''s Pickles',
 'Sent when order is picked up and in transit', true, NOW(), NOW()),

('ORDER_SHIPPED_EMAIL', 'EMAIL', 'Your order {{orderNumber}} has been shipped! 🚚',
 '<h2>Your order is on its way!</h2><p>Hi {{customerName}},</p><p>Great news! Your order <strong>{{orderNumber}}</strong> has been shipped.</p><p><strong>Courier:</strong> {{courierName}}<br/><strong>Tracking Number:</strong> {{awbNumber}}<br/><strong>Expected Delivery:</strong> {{estimatedDeliveryDate}}</p><p><a href="{{trackingUrl}}">Track your order →</a></p><p>— Appa & Amma''s Pickles</p>',
 'Shipping confirmation email with tracking details', true, NOW(), NOW()),

('OUT_FOR_DELIVERY_WHATSAPP', 'WHATSAPP', NULL,
 '🏍️ *Out for Delivery!*\n\nHi {{customerName}},\n\nYour order *{{orderNumber}}* is out for delivery today!\n\nCourier: {{courierName}}\n\nPlease keep your phone handy. 🙏\n\n— Appa & Amma''s Pickles',
 'Sent when order is out for delivery', true, NOW(), NOW()),

('ORDER_DELIVERED_EMAIL', 'EMAIL', 'Your order {{orderNumber}} has been delivered! 🎉',
 '<h2>Order Delivered!</h2><p>Hi {{customerName}},</p><p>Your order <strong>{{orderNumber}}</strong> has been successfully delivered.</p><p>We hope you enjoy our homemade pickles! 🫙</p><p><a href="{{reviewUrl}}">Leave a review →</a></p><p>— Appa & Amma''s Pickles</p>',
 'Delivery confirmation + review request', true, NOW(), NOW()),

('SHIPMENT_CANCELLED_WHATSAPP', 'WHATSAPP', NULL,
 '❌ *Shipment Cancelled*\n\nHi {{customerName}},\n\nYour order *{{orderNumber}}* shipment has been cancelled.\n\nReason: {{cancellationReason}}\n\nIf this was prepaid, your refund will be processed within 5-7 business days.\n\n— Appa & Amma''s Pickles',
 'Sent when shipment is cancelled', true, NOW(), NOW()),

('RTO_INITIATED_WHATSAPP', 'WHATSAPP', NULL,
 '↩️ *Package Returning*\n\nHi {{customerName}},\n\nYour order *{{orderNumber}}* could not be delivered and is being returned to us.\n\nWe''ll reach out to reschedule delivery or process a refund.\n\n— Appa & Amma''s Pickles',
 'Sent when RTO is initiated', true, NOW(), NOW());
```

### Step 6.2 — Create New Notification Events

Add shipping-related events to the existing notification event system. Create events like:

- `ShipmentCreatedEvent` — published after shipment creation
- `OrderShippedEvent` (enhanced) — published when webhook status = Shipped  
- `OutForDeliveryEvent` — published when webhook status = Out for Delivery

Wire these into `ShiprocketWebhookService.processWebhook()` by uncommenting and implementing the `eventPublisher.publishEvent(...)` call.

---

## Phase 7: Frontend — Shipping Feature Module

### Step 7.1 — Create Shipping API Module

Create file: `frontend/src/features/shipping/api.ts`

```typescript
import { apiClient } from '@/shared/lib/api-client';

export interface ServiceabilityRequest {
  deliveryPincode: string;
  weight: number;
  cod: boolean;
}

export interface CourierOption {
  courierId: number;
  courierName: string;
  rate: number;
  estimatedDays: number;
  cod: boolean;
}

export interface ServiceabilityResponse {
  serviceable: boolean;
  availableCouriers: CourierOption[];
}

export interface TrackingEvent {
  status: string;
  description: string;
  location: string;
  timestamp: string;
}

export interface TrackingResponse {
  orderNumber: string;
  awbNumber: string;
  courierName: string;
  currentStatus: string;
  estimatedDelivery: string | null;
  trackingUrl: string | null;
  events: TrackingEvent[];
}

export async function checkServiceability(request: ServiceabilityRequest): Promise<ServiceabilityResponse> {
  const res = await apiClient.post('/shipping/serviceability', request);
  return res.data.data;
}

export async function getTracking(orderNumber: string): Promise<TrackingResponse> {
  const res = await apiClient.get(`/tracking/${orderNumber}`);
  return res.data.data;
}
```

### Step 7.2 — Create Shipping Types

Create file: `frontend/src/features/shipping/types.ts`

```typescript
export type ShipmentStatus =
  | 'CREATED'
  | 'AWB_ASSIGNED'
  | 'LABEL_GENERATED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RTO_INITIATED'
  | 'RTO_DELIVERED'
  | 'CREATION_FAILED';

export interface Shipment {
  id: number;
  orderId: number;
  orderNumber: string;
  shiprocketOrderId: number | null;
  shiprocketShipmentId: number | null;
  awbNumber: string | null;
  courierName: string | null;
  courierId: number | null;
  status: ShipmentStatus;
  pickupScheduledDate: string | null;
  labelUrl: string | null;
  estimatedDeliveryDate: string | null;
  shippingCharge: number | null;
  weight: number | null;
  createdAt: string;
  updatedAt: string;
}
```

### Step 7.3 — Create `ServiceabilityCheck` Component

Create file: `frontend/src/features/shipping/components/ServiceabilityCheck.tsx`

```tsx
'use client';

import { useState } from 'react';
import { checkServiceability, CourierOption } from '../api';

interface Props {
  onResult: (serviceable: boolean, couriers: CourierOption[]) => void;
  weight?: number;
  cod?: boolean;
}

export function ServiceabilityCheck({ onResult, weight = 0.5, cod = false }: Props) {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await checkServiceability({ deliveryPincode: pincode, weight, cod });
      onResult(result.serviceable, result.availableCouriers);
      if (!result.serviceable) {
        setError('Sorry, delivery is not available to this pincode');
      }
    } catch {
      setError('Unable to check serviceability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter delivery pincode"
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <button
          onClick={handleCheck}
          disabled={loading || pincode.length !== 6}
          className="px-4 py-2 bg-green-700 text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

### Step 7.4 — Create `TrackingTimeline` Component

Create file: `frontend/src/features/shipping/components/TrackingTimeline.tsx`

```tsx
'use client';

import { TrackingEvent } from '../api';

interface Props {
  events: TrackingEvent[];
  currentStatus: string;
  courierName?: string;
  awbNumber?: string;
}

export function TrackingTimeline({ events, currentStatus, courierName, awbNumber }: Props) {
  return (
    <div className="space-y-4">
      {courierName && awbNumber && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Courier: <strong>{courierName}</strong></span>
          <span>AWB: <strong>{awbNumber}</strong></span>
        </div>
      )}

      <div className="relative">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${index === events.length - 1 ? 'bg-green-600' : 'bg-gray-300'}`} />
              {index < events.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
            </div>
            <div className="flex-1 -mt-1">
              <p className="font-medium text-sm">{event.status}</p>
              {event.description && <p className="text-sm text-gray-600">{event.description}</p>}
              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                {event.location && <span>{event.location}</span>}
                <span>{new Date(event.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 7.5 — Create Admin Shipments API

Create file: `frontend/src/features/admin/shipments/api.ts`

```typescript
import { apiClient } from '@/shared/lib/api-client';
import { Shipment } from '@/features/shipping/types';

export interface CreateShipmentRequest {
  orderId: number;
  courierId?: number;
}

export async function createShipment(request: CreateShipmentRequest): Promise<Shipment> {
  const res = await apiClient.post('/shipments', request);
  return res.data.data;
}

export async function listShipments(page = 0, size = 20): Promise<{ content: Shipment[]; totalElements: number }> {
  const res = await apiClient.get(`/shipments?page=${page}&size=${size}`);
  return res.data.data;
}

export async function getShipment(id: number): Promise<Shipment> {
  const res = await apiClient.get(`/shipments/${id}`);
  return res.data.data;
}

export async function assignAwb(id: number): Promise<Shipment> {
  const res = await apiClient.post(`/shipments/${id}/assign-awb`);
  return res.data.data;
}

export async function schedulePickup(id: number): Promise<Shipment> {
  const res = await apiClient.post(`/shipments/${id}/pickup`);
  return res.data.data;
}

export async function cancelShipment(id: number, reason: string): Promise<Shipment> {
  const res = await apiClient.post(`/shipments/${id}/cancel?reason=${encodeURIComponent(reason)}`);
  return res.data.data;
}

export async function getLabel(id: number): Promise<string> {
  const res = await apiClient.get(`/shipments/${id}/label`);
  return res.data.data;
}
```

### Step 7.6 — Integrate into Checkout Page

In the checkout page (`frontend/src/app/checkout/page.tsx`):

1. Import `ServiceabilityCheck` component
2. Add it after the pincode field in the shipping address form
3. Store the selected courier in state
4. Replace the flat shipping fee with the real rate from the selected courier
5. Show estimated delivery date

### Step 7.7 — Enhance Track Order Page

In `frontend/src/app/track-order/page.tsx`:

1. Import `TrackingTimeline` and `getTracking` from the shipping feature
2. After fetching order by number, call `getTracking(orderNumber)`
3. Display the `TrackingTimeline` with AWB, courier, and events

---

## Phase 8: Admin Shipment Pages

### Step 8.1 — Create Shipment List Page

Create file: `frontend/src/app/admin/(protected)/shipments/page.tsx`

Build a table with columns: Order #, AWB, Courier, Status, Created At, Actions.

### Step 8.2 — Create Shipment Detail Page

Create file: `frontend/src/app/admin/(protected)/shipments/[id]/page.tsx`

Display full shipment details with action buttons:
- Assign AWB (if status = CREATED)
- Schedule Pickup (if status = AWB_ASSIGNED)
- Download Label (if AWB assigned)
- Cancel Shipment

### Step 8.3 — Add Shipment Link to Admin Order Detail

In the admin order detail page, add:
- "Create Shipment" button if no shipment exists and order is CONFIRMED
- Shipment status badge + link to shipment detail if shipment exists

### Step 8.4 — Add Navigation Link

Add "Shipments" to the admin sidebar navigation linking to `/admin/shipments`.

---

## Phase 9: Testing

### Step 9.1 — Unit Tests

Create test files:

- `ShiprocketAuthServiceTest.java` — Token caching, refresh, 401 handling
- `ShipmentServiceTest.java` — Create, AWB assign, pickup, cancel
- `ShiprocketWebhookServiceTest.java` — Webhook processing, idempotency
- `ShiprocketStatusMapperTest.java` — Status code mappings
- `ServiceabilityServiceTest.java` — Serviceability check

### Step 9.2 — Integration Tests

- Mock Shiprocket API responses using WireMock or MockRestServiceServer
- Test full flow: Order confirmed → Shipment created → AWB assigned
- Test webhook processing: Receive webhook → Order status updated → Notification sent

### Step 9.3 — Frontend Tests

- Test `ServiceabilityCheck` component renders and handles API response
- Test `TrackingTimeline` component renders events correctly
- Test admin shipment list page with mocked data

---

## Phase 10: Deployment & Go-Live

### Step 10.1 — Environment Setup

1. Add Shiprocket environment variables to production secrets
2. Configure webhook URL in Shiprocket dashboard: `https://your-domain.com/api/v1/webhooks/shiprocket`
3. Configure pickup location in Shiprocket dashboard
4. Set `SHIPROCKET_AUTO_SCHEDULE_PICKUP=false` initially (manual pickup scheduling)

### Step 10.2 — Feature Flags for Gradual Rollout

```yaml
# Start with manual mode
SHIPROCKET_AUTO_CREATE_SHIPMENT=false  # Admin creates shipments manually first
SHIPROCKET_AUTO_ASSIGN_AWB=false       # Admin assigns AWB manually
SHIPROCKET_AUTO_SCHEDULE_PICKUP=false  # Admin schedules pickup manually
```

Once confident, enable auto-creation:
```yaml
SHIPROCKET_AUTO_CREATE_SHIPMENT=true
SHIPROCKET_AUTO_ASSIGN_AWB=true
SHIPROCKET_AUTO_SCHEDULE_PICKUP=true  # Full automation
```

### Step 10.3 — Monitoring

- Monitor Shiprocket API response times and error rates
- Alert on: token refresh failures, shipment creation failures, webhook processing errors
- Dashboard for: shipments created per day, average delivery time, RTO rate

### Step 10.4 — Rollback Plan

- Feature flags allow disabling Shiprocket integration without code deploy
- Existing manual order status update flow remains as fallback
- If Shiprocket is down, orders are still created — shipments can be created later

---

## Quick Reference: File Creation Checklist

### Backend Files to Create

| # | File | Phase |
|---|---|---|
| 1 | `src/main/resources/db/migration/V11__shiprocket_integration.sql` | 1 |
| 2 | `domain/shipping/ShipmentStatus.java` | 1 |
| 3 | `domain/shipping/Shipment.java` | 1 |
| 4 | `domain/shipping/ShipmentEvent.java` | 1 |
| 5 | `domain/shipping/ShipmentRepository.java` | 1 |
| 6 | `domain/shipping/ShipmentEventRepository.java` | 1 |
| 7 | `config/ShiprocketProperties.java` | 2 |
| 8 | `api/v1/shipping/ShiprocketAuthService.java` | 2 |
| 9 | `api/v1/shipping/ShiprocketApiClient.java` | 2 |
| 10 | `exception/ShiprocketApiException.java` | 3 |
| 11 | `exception/ShipmentCreationException.java` | 3 |
| 12 | `exception/CourierUnavailableException.java` | 3 |
| 13 | `exception/ServiceabilityException.java` | 3 |
| 14 | `api/v1/shipping/dto/CreateShipmentRequest.java` | 3 |
| 15 | `api/v1/shipping/dto/ShipmentResponse.java` | 3 |
| 16 | `api/v1/shipping/dto/ServiceabilityRequest.java` | 3 |
| 17 | `api/v1/shipping/dto/ServiceabilityResponse.java` | 3 |
| 18 | `api/v1/shipping/dto/ShippingRateRequest.java` | 3 |
| 19 | `api/v1/shipping/dto/TrackingResponse.java` | 3 |
| 20 | `api/v1/shipping/ShiprocketStatusMapper.java` | 3 |
| 21 | `api/v1/shipping/ShipmentService.java` | 3 |
| 22 | `api/v1/shipping/ServiceabilityService.java` | 3 |
| 23 | `api/v1/shipping/ShipmentController.java` | 3 |
| 24 | `api/v1/shipping/ServiceabilityController.java` | 3 |
| 25 | `api/v1/shipping/ShiprocketWebhookController.java` | 4 |
| 26 | `api/v1/shipping/ShiprocketWebhookService.java` | 4 |
| 27 | `api/v1/shipping/TrackingController.java` | 5 |
| 28 | `src/main/resources/db/migration/V12__shiprocket_notification_templates.sql` | 6 |

### Backend Files to Modify

| # | File | Change |
|---|---|---|
| 1 | `domain/order/OrderStatus.java` | Add `OUT_FOR_DELIVERY`, `RTO_INITIATED`, `RTO_DELIVERED` |
| 2 | `domain/order/Order.java` | Add shipping fields |
| 3 | `config/SecurityConfig.java` | Whitelist shipping/webhook endpoints |
| 4 | `exception/GlobalExceptionHandler.java` | Add handlers for new exceptions |
| 5 | `resources/application.yml` | Add `app.shiprocket` section |
| 6 | `PicklesApplication.java` | Enable `ShiprocketProperties` |

### Frontend Files to Create

| # | File | Phase |
|---|---|---|
| 1 | `features/shipping/api.ts` | 7 |
| 2 | `features/shipping/types.ts` | 7 |
| 3 | `features/shipping/components/ServiceabilityCheck.tsx` | 7 |
| 4 | `features/shipping/components/TrackingTimeline.tsx` | 7 |
| 5 | `features/admin/shipments/api.ts` | 8 |
| 6 | `app/admin/(protected)/shipments/page.tsx` | 8 |
| 7 | `app/admin/(protected)/shipments/[id]/page.tsx` | 8 |

### Frontend Files to Modify

| # | File | Change |
|---|---|---|
| 1 | `app/checkout/page.tsx` | Add serviceability check + dynamic rates |
| 2 | `app/track-order/page.tsx` | Enhanced tracking timeline |
| 3 | `app/account/orders/page.tsx` | Show tracking info |
| 4 | Admin sidebar/navigation | Add "Shipments" link |

---

*End of Implementation Guide*
