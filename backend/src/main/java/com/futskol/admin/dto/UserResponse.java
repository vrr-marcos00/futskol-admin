package com.futskol.admin.dto;

import com.futskol.admin.entity.User;
import com.futskol.admin.enums.UserRole;

import java.util.UUID;

public record UserResponse(UUID id, String email, UserRole role) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getRole());
    }
}
