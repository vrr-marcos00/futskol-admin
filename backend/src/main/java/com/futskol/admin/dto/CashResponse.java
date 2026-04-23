package com.futskol.admin.dto;

import java.math.BigDecimal;

public record CashResponse(
        BigDecimal totalPaid,
        BigDecimal totalCosts,
        BigDecimal currentCash
) {}
