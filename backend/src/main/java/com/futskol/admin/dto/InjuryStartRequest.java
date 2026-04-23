package com.futskol.admin.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record InjuryStartRequest(
        @NotNull LocalDate startDate,
        String notes
) {}
