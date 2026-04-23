package com.futskol.admin.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record InjuryCloseRequest(
        @NotNull LocalDate endDate,
        String notes
) {}
