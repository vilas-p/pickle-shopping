package com.appaamma.pickles.api.v1.order;

import com.appaamma.pickles.domain.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Generates human-readable, collision-checked order numbers of the form
 * {@code AAP-YYYYMMDD-XXXXXXXX} where the suffix is 8 random hex chars (~4 billion
 * combinations per day). On the astronomically rare collision, retries up to
 * {@link #MAX_ATTEMPTS} times before giving up with an {@link IllegalStateException}.
 */
@Component
@RequiredArgsConstructor
public class OrderNumberGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final String PREFIX = "AAP";
    private static final int SUFFIX_LEN = 8;
    private static final int MAX_ATTEMPTS = 5;
    private static final char[] HEX = "0123456789ABCDEF".toCharArray();

    private final OrderRepository orderRepository;
    private final SecureRandom random = new SecureRandom();
    private final Clock clock = Clock.systemDefaultZone();

    public String next() {
        String date = LocalDate.now(clock).format(DATE_FMT);
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String candidate = PREFIX + "-" + date + "-" + randomSuffix();
            if (!orderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException(
                "Failed to generate a unique order number after " + MAX_ATTEMPTS + " attempts");
    }

    private String randomSuffix() {
        char[] out = new char[SUFFIX_LEN];
        for (int i = 0; i < SUFFIX_LEN; i++) {
            out[i] = HEX[random.nextInt(HEX.length)];
        }
        return new String(out);
    }
}
