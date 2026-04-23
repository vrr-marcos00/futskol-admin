package com.futskol.admin.dto;

import com.futskol.admin.enums.CostCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CostRequest(
        @NotBlank String name,
        @NotNull CostCategory category,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal amount,
        @NotNull LocalDate date,
        String notes
) {}
