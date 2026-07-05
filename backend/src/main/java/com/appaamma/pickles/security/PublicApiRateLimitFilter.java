package com.appaamma.pickles.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PublicApiRateLimitFilter extends OncePerRequestFilter {

    private static final Duration WINDOW = Duration.ofMinutes(5);

    private final RequestRateLimiter requestRateLimiter;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        RateLimitRule rule = matchRule(request);
        if (rule != null) {
            requestRateLimiter.checkAndRecord(
                    rule.keyPrefix() + ':' + clientIp(request),
                    rule.maxRequests(),
                    WINDOW,
                    rule.message()
            );
        }
        filterChain.doFilter(request, response);
    }

    private RateLimitRule matchRule(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        if ("GET".equals(method) && uri.startsWith("/api/v1/orders/number/")) {
            return new RateLimitRule("track-order", 20, "Too many order tracking requests. Please try again later.");
        }
        if ("POST".equals(method) && uri.equals("/api/v1/orders")) {
            return new RateLimitRule("place-order", 10, "Too many order requests. Please try again later.");
        }
        if ("POST".equals(method) && List.of("/api/v1/contacts", "/api/v1/reviews", "/api/v1/delivery/estimate").contains(uri)) {
            return new RateLimitRule("public-form", 15, "Too many requests. Please slow down and try again shortly.");
        }
        return null;
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    private record RateLimitRule(String keyPrefix, int maxRequests, String message) {}
}