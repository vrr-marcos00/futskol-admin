package com.futskol.admin.dto;

import com.futskol.admin.entity.Injury;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

public record InjuryResponse(
        UUID id,
        UUID playerId,
        String playerName,
        LocalDate startDate,
        LocalDate endDate,
        String notes,
        long daysInjured,
        boolean active
) {
    public static InjuryResponse from(Injury i) {
        LocalDate end = i.getEndDate() == null ? LocalDate.now() : i.getEndDate();
        long days = ChronoUnit.DAYS.between(i.getStartDate(), end);
        return new InjuryResponse(
                i.getId(),
                i.getPlayer().getId(),
                i.getPlayer().getName(),
                i.getStartDate(),
                i.getEndDate(),
                i.getNotes(),
                days,
                i.getEndDate() == null
        );
    }
}
