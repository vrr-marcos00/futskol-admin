package com.futskol.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.futskol.admin.enums.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

public record PaymentRequest(
        @NotNull UUID playerId,
        @NotNull @JsonFormat(pattern = "yyyy-MM") YearMonth referenceMonth,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal amount,
        PaymentStatus status,
        LocalDate paymentDate,
        String notes
) {}
