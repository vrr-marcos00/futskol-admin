package com.futskol.admin.dto;

import com.futskol.admin.entity.Cost;
import com.futskol.admin.enums.CostCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CostResponse(
        UUID id,
        String name,
        CostCategory category,
        BigDecimal amount,
        LocalDate date,
        String notes
) {
    public static CostResponse from(Cost c) {
        return new CostResponse(
                c.getId(),
                c.getName(),
                c.getCategory(),
                c.getAmount(),
                c.getDate(),
                c.getNotes()
        );
    }
}
