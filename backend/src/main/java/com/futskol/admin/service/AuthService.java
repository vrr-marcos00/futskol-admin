package com.futskol.admin.service;

import com.futskol.admin.dto.LoginRequest;
import com.futskol.admin.dto.LoginResponse;
import com.futskol.admin.dto.UserResponse;
import com.futskol.admin.entity.User;
import com.futskol.admin.exception.NotFoundException;
import com.futskol.admin.repository.UserRepository;
import com.futskol.admin.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, UserResponse.from(user));
    }

    public UserResponse currentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Senha atual incorreta");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
    }
}
