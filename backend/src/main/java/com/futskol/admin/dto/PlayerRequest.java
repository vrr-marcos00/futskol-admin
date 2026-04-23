package com.futskol.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record PlayerRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos numéricos") String cpf,
        @NotBlank @Size(max = 20) String phone,
        @NotNull UUID playerTypeId,
        Boolean active,
        String notes
) {}
