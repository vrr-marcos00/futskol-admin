package com.futskol.admin.dto;

import com.futskol.admin.entity.PlayerType;

import java.math.BigDecimal;
import java.util.UUID;

public record PlayerTypeResponse(
        UUID id,
        String name,
        BigDecimal monthlyFee,
        Integer monthlyLimit,
        boolean active,
        boolean generatesMonthlyPayment
) {
    public static PlayerTypeResponse from(PlayerType pt) {
        return new PlayerTypeResponse(
                pt.getId(),
                pt.getName(),
                pt.getMonthlyFee(),
                pt.getMonthlyLimit(),
                pt.isActive(),
                pt.isGeneratesMonthlyPayment()
        );
    }
}
