package com.appaamma.pickles.config;

import com.appaamma.pickles.domain.user.Role;
import com.appaamma.pickles.domain.user.RoleRepository;
import com.appaamma.pickles.domain.user.User;
import com.appaamma.pickles.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Bootstraps the default admin account on first startup so the application is
 * usable out of the box. Credentials are overridable via env vars.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin-email:admin@appaammas.in}")
    private String adminEmail;

    @Value("${app.bootstrap.admin-password:Admin@123}")
    private String adminPassword;

    @Value("${app.bootstrap.admin-name:Site Administrator}")
    private String adminName;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            log.info("Admin user already present — skipping bootstrap.");
            return;
        }

        Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(Role.RoleName.ROLE_ADMIN).build()));

        User admin = User.builder()
                .fullName(adminName)
                .email(adminEmail.toLowerCase())
                .passwordHash(passwordEncoder.encode(adminPassword))
                .enabled(true)
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(admin);
        log.warn("Bootstrapped default admin user: {} — CHANGE THE PASSWORD IMMEDIATELY!", adminEmail);
    }
}
