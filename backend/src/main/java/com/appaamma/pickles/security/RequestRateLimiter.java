package com.appaamma.pickles.security;

import com.appaamma.pickles.exception.TooManyRequestsException;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class RequestRateLimiter {

    private final ConcurrentMap<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    public void checkAndRecord(String key, int maxAttempts, Duration window, String message) {
        Deque<Instant> bucket = attempts.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (bucket) {
            prune(bucket, window);
            if (bucket.size() >= maxAttempts) {
                throw new TooManyRequestsException(message);
            }
            bucket.addLast(Instant.now());
        }
    }

    public void assertAllowed(String key, int maxAttempts, Duration window, String message) {
        Deque<Instant> bucket = attempts.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (bucket) {
            prune(bucket, window);
            if (bucket.size() >= maxAttempts) {
                throw new TooManyRequestsException(message);
            }
        }
    }

    public void record(String key, Duration window) {
        Deque<Instant> bucket = attempts.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (bucket) {
            prune(bucket, window);
            bucket.addLast(Instant.now());
        }
    }

    public void reset(String key) {
        attempts.remove(key);
    }

    private void prune(Deque<Instant> bucket, Duration window) {
        Instant cutoff = Instant.now().minus(window);
        while (!bucket.isEmpty() && bucket.peekFirst().isBefore(cutoff)) {
            bucket.removeFirst();
        }
    }
}