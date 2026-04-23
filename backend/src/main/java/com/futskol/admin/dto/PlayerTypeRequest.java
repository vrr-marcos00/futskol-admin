package com.futskol.admin.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PlayerTypeRequest(
        @NotBlank String name,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal monthlyFee,
        @Min(1) Integer monthlyLimit,
        Boolean active
) {}
