package com.futskol.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.futskol.admin.enums.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AnnualPaymentRequest(
        @NotNull UUID playerId,
        @NotNull @Min(2000) @Max(2100) Integer year,
        @NotNull @Size(min = 1) List<Integer> months,
        PaymentStatus status,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate paymentDate,
        @DecimalMin("0.0") BigDecimal amount
) {}
