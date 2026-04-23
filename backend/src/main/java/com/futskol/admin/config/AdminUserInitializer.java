package com.futskol.admin.config;

import com.futskol.admin.entity.User;
import com.futskol.admin.enums.UserRole;
import com.futskol.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements CommandLineRunner {

    private static final String DEFAULT_EMAIL = "admin@admin.com";
    private static final String DEFAULT_PASSWORD = "admin";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(DEFAULT_EMAIL)) {
            return;
        }
        User admin = User.builder()
                .email(DEFAULT_EMAIL)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(UserRole.ADMIN)
                .build();
        userRepository.save(admin);
        log.info("Admin default criado: {} / {}", DEFAULT_EMAIL, DEFAULT_PASSWORD);
    }
}
