package com.futskol.admin.dto;

import com.futskol.admin.entity.Injury;
import com.futskol.admin.entity.Player;

import java.time.LocalDate;
import java.util.UUID;

public record PlayerResponse(
        UUID id,
        String name,
        String cpf,
        String phone,
        PlayerTypeResponse type,
        boolean active,
        String notes,
        InjurySummary injury
) {
    public record InjurySummary(UUID id, LocalDate startDate, String notes) {}

    public static PlayerResponse from(Player p) {
        return from(p, null);
    }

    public static PlayerResponse from(Player p, Injury activeInjury) {
        InjurySummary injurySummary = activeInjury == null
                ? null
                : new InjurySummary(activeInjury.getId(), activeInjury.getStartDate(), activeInjury.getNotes());
        return new PlayerResponse(
                p.getId(),
                p.getName(),
                p.getCpf(),
                p.getPhone(),
                PlayerTypeResponse.from(p.getPlayerType()),
                p.isActive(),
                p.getNotes(),
                injurySummary
        );
    }
}
