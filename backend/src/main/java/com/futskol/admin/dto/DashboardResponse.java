package com.futskol.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.YearMonth;

public record DashboardResponse(
        @JsonFormat(pattern = "yyyy-MM") YearMonth month,
        BigDecimal totalExpected,
        BigDecimal totalPaid,
        BigDecimal totalPending,
        long payingCount,
        long defaultingCount,
        long injuredCount,
        BigDecimal totalCosts,
        BigDecimal currentCash
) {}
