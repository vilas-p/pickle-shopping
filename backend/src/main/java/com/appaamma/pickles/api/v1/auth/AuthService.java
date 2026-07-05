package com.appaamma.pickles.api.v1.auth;

import com.appaamma.pickles.api.v1.auth.dto.LoginRequest;
import com.appaamma.pickles.api.v1.auth.dto.LoginResponse;
import com.appaamma.pickles.domain.user.User;
import com.appaamma.pickles.domain.user.UserRepository;
import com.appaamma.pickles.exception.TooManyRequestsException;
import com.appaamma.pickles.security.JwtTokenProvider;
import com.appaamma.pickles.security.RequestRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

        private static final Duration LOGIN_WINDOW = Duration.ofMinutes(15);
        private static final int MAX_FAILED_LOGINS_PER_IP = 10;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
        private final RequestRateLimiter requestRateLimiter;

    @Transactional(readOnly = true)
        public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
                String rateLimitKey = "admin-login:" + clientIp(httpRequest);
                requestRateLimiter.assertAllowed(
                                rateLimitKey,
                                MAX_FAILED_LOGINS_PER_IP,
                                LOGIN_WINDOW,
                                "Too many failed login attempts. Please try again later."
                );

                Authentication auth;
                try {
                        auth = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(request.email(), request.password())
                        );
                } catch (BadCredentialsException ex) {
                        requestRateLimiter.record(rateLimitKey, LOGIN_WINDOW);
                        throw ex;
                }

                requestRateLimiter.reset(rateLimitKey);

        UserDetails principal = (UserDetails) auth.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        User user = userRepository.findByEmailIgnoreCase(principal.getUsername()).orElseThrow();
        Set<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return new LoginResponse(
                token,
                "Bearer",
                tokenProvider.getExpirationMs(),
                new LoginResponse.UserSummary(user.getId(), user.getFullName(), user.getEmail(), roles)
        );
    }

        private String clientIp(HttpServletRequest request) {
                return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
        }
}
