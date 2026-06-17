package com.appaamma.pickles.api.v1.auth;

import com.appaamma.pickles.api.v1.auth.dto.LoginRequest;
import com.appaamma.pickles.api.v1.auth.dto.LoginResponse;
import com.appaamma.pickles.domain.user.User;
import com.appaamma.pickles.domain.user.UserRepository;
import com.appaamma.pickles.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

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
}
