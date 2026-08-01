# Razorpay Payment Gateway — Complete Setup Guide

Step-by-step instructions for setting up Razorpay in the Appa Amma's Pickles project (Spring Boot 3 + Next.js 15).

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create a Razorpay Account](#2-create-a-razorpay-account)
3. [Generate API Keys](#3-generate-api-keys)
4. [Configure Backend](#4-configure-backend)
5. [Configure Frontend](#5-configure-frontend)
6. [Security Configuration](#6-security-configuration)
7. [Database Setup](#7-database-setup)
8. [Payment Flow — How It Works](#8-payment-flow--how-it-works)
9. [Backend Code Reference](#9-backend-code-reference)
10. [Frontend Code Reference](#10-frontend-code-reference)
11. [Webhook Setup](#11-webhook-setup)
12. [Run & Test Locally](#12-run--test-locally)
13. [Go Live (Production)](#13-go-live-production)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prerequisites

Before starting, make sure you have:

- [ ] **Java 17+** installed (`java -version`)
- [ ] **Node.js 18+** installed (`node -v`)
- [ ] **MySQL 8** running locally or via Docker
- [ ] **Backend** builds successfully: `cd backend && ./gradlew.bat build`
- [ ] **Frontend** installs and runs: `cd frontend && npm install && npm run dev`
- [ ] At least **one product** exists in the database (to add to cart)
- [ ] OTP auth working (checkout requires phone verification first)

---

## 2. Create a Razorpay Account

1. Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup).
2. Sign up with your email and phone number.
3. Complete the KYC verification:
   - **Business Type**: Select your entity type (Individual, Partnership, etc.).
   - **Business Category**: Food & Beverages.
   - Upload PAN card, GST certificate (if applicable), and bank account details.
4. Once verified, you'll have access to both **Test Mode** and **Live Mode** from the dashboard.

> **For development**: You can skip KYC and use **Test Mode** immediately. KYC is only required for Live Mode.

---

## 3. Generate API Keys

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** (toggle at the top-left) for development.
3. Go to **Settings → API Keys → Generate Key**.
4. You will get three values:

| Key | Format | Where Used |
|---|---|---|
| **Key ID** | `rzp_test_XXXXXXXXXXXXXX` | Backend + Frontend |
| **Key Secret** | Random string (shown **once**) | Backend only |
| **Webhook Secret** | Set later in Step 11 | Backend only |

5. **Copy the Key Secret immediately** — it is shown only once. If lost, you must regenerate.

> **⚠️ Security**: Never commit Key Secret or Webhook Secret to version control.

---

## 4. Configure Backend

### 4.1 How Config Works

The backend uses a Spring Boot `@ConfigurationProperties` record at `config/RazorpayProperties.java`:

```java
@Validated
@ConfigurationProperties(prefix = "app.razorpay")
public record RazorpayProperties(
    @NotBlank String keyId,
    @NotBlank String keySecret,
    @NotBlank String webhookSecret
) {}
```

All three fields are **required** (`@NotBlank`) — the app will fail to start if any are missing or empty.

### 4.2 Config Files (already wired)

**`application.yml`** (base — no defaults, reads from env vars):

```yaml
app:
  razorpay:
    key-id: ${RAZORPAY_KEY_ID:}
    key-secret: ${RAZORPAY_KEY_SECRET:}
    webhook-secret: ${RAZORPAY_WEBHOOK_SECRET:}
```

**`application-dev.yml`** (local dev — has fallback defaults):

```yaml
app:
  razorpay:
    key-id: ${RAZORPAY_KEY_ID:rzp_test_XXXXXXXXXXXXXXX}
    key-secret: ${RAZORPAY_KEY_SECRET:your_test_key_secret_here}
    webhook-secret: ${RAZORPAY_WEBHOOK_SECRET:your_webhook_secret_here}
```

> **Action required**: Replace the default values in `application-dev.yml` with your actual test keys from Step 3. Or set them as environment variables (see below).

### 4.3 Set Environment Variables

**Option A — Windows (PowerShell, for current session):**

```powershell
$env:RAZORPAY_KEY_ID = "rzp_test_XXXXXXXXXXXXXX"
$env:RAZORPAY_KEY_SECRET = "your_actual_key_secret"
$env:RAZORPAY_WEBHOOK_SECRET = "dummy_for_local_dev"
```

**Option B — IntelliJ / VS Code Run Config:**

Add to your launch configuration's environment variables section.

**Option C — Docker Compose** (`docker-compose.yml`):

```yaml
services:
  backend:
    environment:
      - RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
      - RAZORPAY_KEY_SECRET=your_actual_key_secret
      - RAZORPAY_WEBHOOK_SECRET=dummy_for_local_dev
```

### 4.4 Gradle Dependency (already added)

```kotlin
// build.gradle.kts
implementation("com.razorpay:razorpay-java:1.4.6")
```

No action needed — already present.

### 4.5 Placeholder Credential Detection

The `PaymentService` has a safety check — it will **reject payment requests** if the keys look like placeholders:

```java
private boolean looksLikePlaceholderCredential(String value) {
    String normalised = value.trim().toLowerCase();
    return normalised.startsWith("dev-")
        || normalised.contains("placeholder")
        || normalised.contains("dummy")
        || normalised.equals("changeme");
}
```

If your Key ID or Key Secret contains words like `dev-`, `placeholder`, `dummy`, or `changeme`, the service will respond with: *"Online payments are temporarily unavailable."*

**Make sure your `application-dev.yml` defaults use your actual `rzp_test_*` keys, not placeholder strings.**

---

## 5. Configure Frontend

### 5.1 Create `frontend/.env.local`

This file does **not exist by default** — you must create it:

```env
# Backend API URL (adjust port if needed)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Enable the Razorpay payment feature flag
NEXT_PUBLIC_ENABLE_PAYMENTS=true

# Razorpay Key ID (public — safe for browser)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
```

> **Key ID must match** the one used on the backend. If they don't match, signature verification will fail.

### 5.2 What Each Variable Does

| Variable | Default | Effect if Missing |
|---|---|---|
| `NEXT_PUBLIC_ENABLE_PAYMENTS` | `false` | Razorpay checkout.js script is NOT loaded; payment options hidden |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `""` (empty) | Razorpay popup will fail with "Invalid Key ID" |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8002/api/v1` | API calls go to wrong port |

### 5.3 How the Frontend Loads Razorpay

`RazorpayScript.tsx` conditionally loads the Razorpay Checkout.js CDN script:

```tsx
export function RazorpayScript() {
  if (!config.features.enablePayments) return null;  // ← gated by env var

  return (
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="afterInteractive"
    />
  );
}
```

This component is rendered in `app/checkout/page.tsx`. If `NEXT_PUBLIC_ENABLE_PAYMENTS` is not `true`, **no Razorpay script is loaded and payment options won't appear**.

### 5.4 No NPM Package Needed

Razorpay is loaded via CDN script — there is no `npm install` step for Razorpay.

---

## 6. Security Configuration

### 6.1 Webhook Endpoint — Unauthenticated (by design)

The webhook endpoint must be accessible without JWT auth because Razorpay's servers call it directly. This is configured in `SecurityConfig.java`:

```java
.requestMatchers(HttpMethod.POST,
    "/api/v1/payments/webhook"   // ← permitAll()
).permitAll()
```

All other payment endpoints (`/create-order`, `/verify`, `/cancel-order`) require `ROLE_CUSTOMER` authentication.

### 6.2 Webhook Signature Verification

Even though the webhook endpoint is public, it's protected by HMAC signature verification:

```
expected_signature = HMAC_SHA256(request_body, webhook_secret)
```

The backend compares this with the `X-Razorpay-Signature` header. Invalid signatures → `400 Bad Request`.

### 6.3 Payment Verification — Server-Side Only

The backend **never trusts** the amount sent from the frontend. After receiving a payment, it:

1. Fetches the actual payment from Razorpay API (`razorpayClient.payments.fetch()`)
2. Validates the amount matches the original order
3. Validates the `order_id` matches
4. Verifies the HMAC signature using the Key Secret

### 6.4 Idempotency

- If a payment is already `CAPTURED`, re-verifying the same `razorpay_payment_id` returns success without creating a duplicate order.
- If a `razorpay_payment_id` is already linked to a different order, the request is rejected.

---

## 7. Database Setup

### 7.1 Flyway Migrations (automatic)

These migrations run automatically when the backend starts:

| Migration | File | What It Creates |
|---|---|---|
| V5 | `db/migration/V5__payments.sql` | `payments` table — stores completed payment records (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `amount`, `currency`, `status`) |
| V7 | `db/migration/V7__payment_attempts.sql` | `payment_attempts` table — tracks every payment attempt before order creation (stores full `order_request_json` so the order can be rebuilt after async payment) |
| V8 | `db/migration/V8__payment_security_hardening.sql` | Adds indexes and constraints for security and performance |

**No manual SQL needed** — just ensure MySQL is running and the DB connection is configured.

### 7.2 Key Domain Entities

| Entity | Table | Purpose |
|---|---|---|
| `Payment` | `payments` | One record per successful payment |
| `PaymentAttempt` | `payment_attempts` | One record per payment attempt (created BEFORE Razorpay popup opens; stores full order data so it can be used to create the order after payment succeeds) |
| `Order` | `orders` | Created only AFTER payment is verified (or immediately for COD) |

### 7.3 Payment Status Lifecycle

```
CREATED → (user pays) → AUTHORIZED → CAPTURED → (optional) REFUNDED
                     ↘ FAILED (if payment fails or is cancelled)
```

---

## 8. Payment Flow — How It Works

### 8.1 End-to-End Sequence

```
User                          Frontend                       Backend                        Razorpay
 │                               │                              │                              │
 │  1. Click "Pay Online"        │                              │                              │
 │──────────────────────────────►│                              │                              │
 │                               │  2. POST /payments/          │                              │
 │                               │     create-order             │                              │
 │                               │─────────────────────────────►│                              │
 │                               │                              │  3. Validate items,          │
 │                               │                              │     calculate price,         │
 │                               │                              │     reserve inventory        │
 │                               │                              │                              │
 │                               │                              │  4. POST orders.create()     │
 │                               │                              │─────────────────────────────►│
 │                               │                              │◄─────────────────────────────│
 │                               │                              │     razorpay_order_id        │
 │                               │                              │                              │
 │                               │                              │  5. Save PaymentAttempt      │
 │                               │                              │     (status=CREATED)         │
 │                               │◄─────────────────────────────│                              │
 │                               │  { razorpayOrderId,          │                              │
 │                               │    razorpayKeyId,            │                              │
 │                               │    amount, orderNumber }     │                              │
 │                               │                              │                              │
 │  6. Razorpay popup opens      │                              │                              │
 │◄──────────────────────────────│                              │                              │
 │                               │                              │                              │
 │  7. User completes payment    │                              │                              │
 │  (card/UPI/netbanking)        │                              │                              │
 │──────────────────────────────────────────────────────────────────────────────────────────── ►│
 │◄────────────────────────────────────────────────────────────────────────────────────────────│
 │  { payment_id, order_id,      │                              │                              │
 │    signature }                │                              │                              │
 │                               │                              │                              │
 │  8. Popup callback            │                              │                              │
 │──────────────────────────────►│                              │                              │
 │                               │  9. POST /payments/verify    │                              │
 │                               │─────────────────────────────►│                              │
 │                               │                              │  10. Verify HMAC signature   │
 │                               │                              │  11. Fetch payment from      │
 │                               │                              │      Razorpay API            │
 │                               │                              │  12. Validate amount/order   │
 │                               │                              │  13. Auto-capture if only    │
 │                               │                              │      authorized              │
 │                               │                              │  14. Create Order in DB      │
 │                               │                              │  15. Save Payment record     │
 │                               │                              │  16. Update PaymentAttempt   │
 │                               │                              │      (status=CAPTURED)       │
 │                               │                              │  17. Publish                 │
 │                               │                              │      PaymentSuccessEvent     │
 │                               │                              │      (sends notifications)   │
 │                               │◄─────────────────────────────│                              │
 │                               │  "Payment verified"          │                              │
 │  18. Redirect to              │                              │                              │
 │      confirmation page        │                              │                              │
 │◄──────────────────────────────│                              │                              │
```

### 8.2 What Happens If the User Closes the Browser After Paying?

The webhook handles this (see Step 11). Razorpay sends a `payment.captured` event → backend creates the order via `reconcileCapturedWebhook()`.

### 8.3 What Happens If Payment Fails?

- `PaymentAttempt` is marked `FAILED` with a reason.
- **Inventory reservations are released** automatically.
- User can retry from checkout.

### 8.4 What Happens If User Cancels the Popup?

- Frontend calls `POST /payments/cancel-order`.
- `PaymentAttempt` is marked `FAILED` with reason `cancelled_by_customer`.
- Inventory reservations are released.

---

## 9. Backend Code Reference

### 9.1 Key Files

| File | Path | Purpose |
|---|---|---|
| RazorpayProperties | `config/RazorpayProperties.java` | Config record (`keyId`, `keySecret`, `webhookSecret`) |
| PaymentController | `api/v1/payment/PaymentController.java` | REST endpoints: create-order, verify, cancel-order, webhook |
| PaymentService | `api/v1/payment/PaymentService.java` | Business logic — Razorpay client init, order creation, signature verification, webhook processing, inventory release on failure |
| Payment | `domain/order/Payment.java` | JPA entity for completed payments |
| PaymentAttempt | `domain/order/PaymentAttempt.java` | JPA entity for payment attempts (stores full order JSON for deferred order creation) |
| PaymentStatus | `domain/order/PaymentStatus.java` | `CREATED`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED` |
| PaymentMethod | `domain/order/PaymentMethod.java` | `COD`, `UPI`, `RAZORPAY` |
| OrderService | `api/v1/order/OrderService.java` | `createPaidOnlineOrder()` — called after payment verification |
| OrderPricingService | `api/v1/order/OrderPricingService.java` | Calculates subtotal, shipping fee, total (server-side, never trusts client) |

### 9.2 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/payments/create-order` | `ROLE_CUSTOMER` | Creates Razorpay order, reserves inventory, saves PaymentAttempt |
| `POST` | `/api/v1/payments/verify` | `ROLE_CUSTOMER` | Verifies signature, fetches payment from Razorpay, creates order |
| `POST` | `/api/v1/payments/cancel-order` | `ROLE_CUSTOMER` | Cancels unpaid attempt, releases inventory |
| `POST` | `/api/v1/payments/webhook` | Public (HMAC verified) | Processes Razorpay events: `payment.captured`, `payment.failed`, `refund.processed` |

### 9.3 Request/Response DTOs

**CreateOrderRequest** (same DTO used for COD orders):

```json
{
  "customer": { "fullName": "...", "email": "...", "phone": "..." },
  "shippingAddress": { "line1": "...", "city": "...", "state": "...", "pincode": "..." },
  "items": [{ "productId": 1, "variantId": null, "quantity": 2 }],
  "paymentMethod": "RAZORPAY",
  "notes": ""
}
```

**PaymentOrderResponse** (returned from create-order):

```json
{
  "razorpayOrderId": "order_XXXXXXXXXXXXXX",
  "amount": 50000,
  "currency": "INR",
  "razorpayKeyId": "rzp_test_XXXXXXXXXXXXXX",
  "orderNumber": "AAP-20260719-XXXXXXXX",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "9876543210"
}
```

**VerifyPaymentRequest**:

```json
{
  "razorpayOrderId": "order_XXXXXXXXXXXXXX",
  "razorpayPaymentId": "pay_XXXXXXXXXXXXXX",
  "razorpaySignature": "hmac_signature_string"
}
```

---

## 10. Frontend Code Reference

### 10.1 Key Files

| File | Path | Purpose |
|---|---|---|
| CheckoutForm | `features/checkout/components/CheckoutForm.tsx` | Full checkout UI: OTP → address → delivery estimate → payment selection → Razorpay popup |
| RazorpayScript | `features/checkout/components/RazorpayScript.tsx` | Loads `checkout.razorpay.com/v1/checkout.js` when payments enabled |
| api.ts | `features/checkout/api.ts` | `createOrder()`, `verify()`, `cancelOrder()` API calls |
| types.ts | `features/checkout/types.ts` | `PaymentMethod`, `PaymentOrderResponse`, `VerifyPaymentPayload` TypeScript types |
| config.ts | `shared/lib/config.ts` | Reads `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `NEXT_PUBLIC_ENABLE_PAYMENTS` |
| checkout page | `app/checkout/page.tsx` | Server component rendering `<CheckoutForm />` + `<RazorpayScript />` |

### 10.2 Checkout Flow (User Journey)

```
1. Cart (items in Zustand store)
       ↓
2. /checkout page
       ↓
3. Enter phone → OTP verification (required)
       ↓
4. Select saved address OR enter new address
       ↓
5. Delivery estimate fetched automatically
       ↓
6. Select payment method: COD | UPI | RAZORPAY
       ↓
7. Click "Place Order"
       ↓ (if RAZORPAY/UPI)
8. Frontend calls POST /payments/create-order
       ↓
9. Razorpay popup opens with order details
       ↓
10. User pays → popup callback → POST /payments/verify
       ↓
11. Redirect to /checkout/confirmation/[orderNumber]
```

### 10.3 Razorpay Popup Configuration

```typescript
const options = {
  key: response.razorpayKeyId,       // from backend response
  amount: response.amount,            // in paise (₹500 = 50000)
  currency: "INR",
  name: "Appa & Amma's Pickles",
  description: "Order Payment",
  order_id: response.razorpayOrderId,
  handler: function (rzpResponse) {
    // Called on successful payment
    paymentsApi.verify({
      razorpayOrderId: rzpResponse.razorpay_order_id,
      razorpayPaymentId: rzpResponse.razorpay_payment_id,
      razorpaySignature: rzpResponse.razorpay_signature,
    });
  },
  modal: {
    ondismiss: function () {
      // Called when user closes popup without paying
      paymentsApi.cancelOrder(response.razorpayOrderId);
    },
  },
  prefill: {
    name: response.customerName,
    contact: formatPhoneForRazorpay(response.customerPhone),
    email: response.customerEmail,
  },
  theme: {
    color: "#4A7C59",  // brand green
  },
};

const rzp = new window.Razorpay(options);
rzp.open();
```

---

## 11. Webhook Setup

### 11.1 What Are Webhooks?

Webhooks are server-to-server HTTP callbacks. Razorpay sends a POST request to your backend whenever a payment event occurs — **regardless of whether the user's browser is still open**. This is a safety net for cases where the client-side verify call fails.

### 11.2 Do You Need Webhooks for Local Dev?

**No.** For local testing, the normal flow (popup → verify endpoint) is sufficient. Webhooks are mainly a production safety net. Set `RAZORPAY_WEBHOOK_SECRET` to any dummy value locally.

### 11.3 Configure in Razorpay Dashboard (for production or full testing)

1. Go to **Settings → Webhooks → Add New Webhook**.
2. Set the **Webhook URL**:
   - Production: `https://yourdomain.com/api/v1/payments/webhook`
   - Local testing (ngrok): `https://<id>.ngrok-free.app/api/v1/payments/webhook`
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
4. Set a **Webhook Secret** → copy it → set as `RAZORPAY_WEBHOOK_SECRET`.

### 11.4 Webhook Events Handled

| Event | Backend Action |
|---|---|
| `payment.authorized` / `payment.captured` | Creates order if not already created (reconciliation) |
| `payment.failed` | Marks PaymentAttempt as FAILED, releases inventory |
| `refund.processed` / `payment.refunded` | Reconciles refund status |
| All others | Logged and ignored |

### 11.5 Testing Webhooks Locally (optional)

```bash
# Option 1: ngrok (requires free account)
ngrok http 8080

# Option 2: cloudflared (no account needed)
cloudflared tunnel --url http://localhost:8080

# Option 3: localtunnel (no account needed)
npx localtunnel --port 8080
```

Copy the HTTPS URL and use it as the webhook URL in the Razorpay Dashboard.

---

## 12. Run & Test Locally

### 12.1 Step-by-Step

**Step 1 — Set backend keys** (update `application-dev.yml` with your real test keys):

```yaml
app:
  razorpay:
    key-id: rzp_test_YOUR_ACTUAL_KEY_ID
    key-secret: YOUR_ACTUAL_KEY_SECRET
    webhook-secret: any_dummy_value_for_local
```

**Step 2 — Create `frontend/.env.local`:**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
```

**Step 3 — Start backend:**

```powershell
cd backend
.\gradlew.bat bootRun --args='--spring.profiles.active=dev'
```

**Step 4 — Start frontend:**

```powershell
cd frontend
npm run dev
```

**Step 5 — Test the flow:**

1. Open `http://localhost:3000`
2. Add products to cart
3. Go to Checkout
4. Enter phone number → receive OTP (with `expose-debug-code: true`, check backend logs for OTP)
5. Select/enter address
6. Choose **Razorpay** or **UPI** as payment method
7. Click **Place Order**
8. Razorpay popup opens → use test credentials below

### 12.2 Test Payment Credentials

**Test Cards:**

| Field | Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g., `12/29`) |
| CVV | Any 3 digits (e.g., `123`) |
| 3D Secure OTP | `1234` |

**Test UPI:**

| UPI ID | Result |
|---|---|
| `success@razorpay` | Payment succeeds |
| `failure@razorpay` | Payment fails |

**Test Netbanking:**

Select any bank → Razorpay shows **Success** / **Failure** buttons.

### 12.3 Verify It Worked

After successful test payment:

- [ ] You are redirected to `/checkout/confirmation/AAP-XXXXXXXX-XXXXXXXX`
- [ ] Check backend logs for: `Payment verified for order AAP-...: razorpay_payment_id=pay_...`
- [ ] Check Razorpay Dashboard → **Transactions** — your test payment appears
- [ ] Check your database: `SELECT * FROM payments ORDER BY id DESC LIMIT 1;`
- [ ] Check your database: `SELECT * FROM orders ORDER BY id DESC LIMIT 1;`

---

## 13. Go Live (Production)

### 13.1 Pre-launch Checklist

- [ ] KYC verification completed on Razorpay Dashboard
- [ ] Live API keys generated (starts with `rzp_live_`)
- [ ] Backend environment variables set with live keys
- [ ] Frontend `NEXT_PUBLIC_RAZORPAY_KEY_ID` set to live key
- [ ] Webhook URL configured with production domain (`https://yourdomain.com/api/v1/payments/webhook`)
- [ ] `RAZORPAY_WEBHOOK_SECRET` set from live webhook config
- [ ] HTTPS enabled on your domain (required by Razorpay)
- [ ] `application-dev.yml` does NOT contain real live keys (use env vars only)
- [ ] Test with a real ₹1 transaction → verify order created → refund from dashboard

### 13.2 Production Environment Variables

**Backend:**

```
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=actual_live_secret
RAZORPAY_WEBHOOK_SECRET=live_webhook_secret
```

**Frontend:**

```
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXX
```

> **Key ID must match** between frontend and backend. Never mix test and live keys.

---

## 14. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| App fails to start with "Validation failed for RazorpayProperties" | Missing or empty Razorpay config | Ensure all 3 values (`key-id`, `key-secret`, `webhook-secret`) are set. Use `--spring.profiles.active=dev` for fallback defaults |
| "Online payments are temporarily unavailable" | Placeholder credential detected | Replace `dev-*`, `placeholder`, `dummy`, or `changeme` values with actual `rzp_test_*` keys |
| Razorpay payment options not showing on checkout | `NEXT_PUBLIC_ENABLE_PAYMENTS` not `true` | Create `frontend/.env.local` with `NEXT_PUBLIC_ENABLE_PAYMENTS=true` and restart dev server |
| Razorpay popup doesn't open | checkout.js not loaded | Check browser DevTools Network tab for `checkout.razorpay.com`. Ensure `RazorpayScript` component is rendered |
| "Invalid Key ID" in popup | Wrong or empty key | Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches your Razorpay Dashboard key |
| Signature verification fails | Key secret mismatch between create-order and verify | Ensure backend `key-secret` matches the key pair used for `key-id` |
| `403 Forbidden` on create-order | Not authenticated as customer | Ensure OTP verification is complete and JWT token is sent in request |
| Webhook returns 400 | Webhook secret mismatch | Re-copy webhook secret from Razorpay Dashboard |
| "Payment has not been captured by Razorpay" | Payment was only authorized, not captured | Backend auto-captures; check Razorpay Dashboard for payment status |
| Order not created after payment | Verify endpoint failed + no webhook configured | Check backend logs for errors. For local dev, verify the browser didn't navigate away before verify completed |
| Inventory not released after failed payment | `markAttemptFailed()` didn't run | Check if PaymentAttempt status is stuck in `CREATED`. Webhook should clean this up |
| CORS errors | Frontend and backend origins differ | Check `SecurityConfig.java` CORS configuration |
| `Amount mismatch` | Client sent different amount than server calculated | Backend always recalculates from product prices — this is by design |

---

## Quick Start Summary

```powershell
# 1. Update backend/src/main/resources/application-dev.yml with real test keys
#    key-id: rzp_test_YOUR_KEY
#    key-secret: YOUR_SECRET

# 2. Create frontend/.env.local
Set-Content frontend/.env.local @"
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
"@

# 3. Start backend (Terminal 1)
cd backend
.\gradlew.bat bootRun --args='--spring.profiles.active=dev'

# 4. Start frontend (Terminal 2)
cd frontend
npm run dev

# 5. Open http://localhost:3000 → Add to cart → Checkout → Pay with test card
#    Card: 4111 1111 1111 1111 | Expiry: 12/29 | CVV: 123 | OTP: 1234
```
