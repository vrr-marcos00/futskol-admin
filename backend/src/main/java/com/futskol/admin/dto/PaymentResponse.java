package com.futskol.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.futskol.admin.entity.Payment;
import com.futskol.admin.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID playerId,
        String playerName,
        @JsonFormat(pattern = "yyyy-MM") YearMonth referenceMonth,
        BigDecimal amount,
        PaymentStatus status,
        LocalDate paymentDate,
        String notes,
        UUID injuryId
) {
    public static PaymentResponse from(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getPlayer().getId(),
                p.getPlayer().getName(),
                YearMonth.from(p.getReferenceMonth()),
                p.getAmount(),
                p.getStatus(),
                p.getPaymentDate(),
                p.getNotes(),
                p.getInjury() == null ? null : p.getInjury().getId()
        );
    }
}
