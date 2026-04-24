package com.futskol.admin.service;

import com.futskol.admin.dto.PlayerRequest;
import com.futskol.admin.dto.PlayerResponse;
import com.futskol.admin.entity.Injury;
import com.futskol.admin.entity.Player;
import com.futskol.admin.entity.PlayerType;
import com.futskol.admin.exception.BusinessException;
import com.futskol.admin.exception.ConflictException;
import com.futskol.admin.exception.NotFoundException;
import com.futskol.admin.repository.InjuryRepository;
import com.futskol.admin.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository repository;
    private final PlayerTypeService playerTypeService;
    private final InjuryRepository injuryRepository;

    @Transactional(readOnly = true)
    public List<PlayerResponse> search(Boolean active, UUID typeId, String search) {
        String q = (search == null || search.isBlank()) ? null : search.trim();
        List<Player> players = q == null
                ? repository.filter(active, typeId)
                : repository.searchByText(active, typeId, q);
        return players.stream().map(this::withInjury).toList();
    }

    @Transactional(readOnly = true)
    public Player findEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Jogador não encontrado"));
    }

    @Transactional(readOnly = true)
    public PlayerResponse findById(UUID id) {
        return withInjury(findEntity(id));
    }

    @Transactional
    public PlayerResponse create(PlayerRequest req) {
        if (req.cpf() != null) {
            validateCpf(req.cpf());
            if (repository.existsByCpf(req.cpf())) {
                throw new ConflictException("Já existe um jogador com esse CPF");
            }
        }
        PlayerType type = playerTypeService.findEntity(req.playerTypeId());

        Player player = Player.builder()
                .name(req.name())
                .cpf(req.cpf())
                .phone(req.phone())
                .playerType(type)
                .active(Optional.ofNullable(req.active()).orElse(true))
                .notes(req.notes())
                .build();
        return withInjury(repository.save(player));
    }

    @Transactional
    public PlayerResponse update(UUID id, PlayerRequest req) {
        Player player = findEntity(id);
        String newCpf = req.cpf();

        if (!Objects.equals(player.getCpf(), newCpf)) {
            if (newCpf != null) {
                validateCpf(newCpf);
                repository.findByCpf(newCpf).ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new ConflictException("Já existe um jogador com esse CPF");
                    }
                });
            }
            player.setCpf(newCpf);
        }

        if (!player.getPlayerType().getId().equals(req.playerTypeId())) {
            player.setPlayerType(playerTypeService.findEntity(req.playerTypeId()));
        }

        player.setName(req.name());
        player.setPhone(req.phone());
        player.setNotes(req.notes());
        if (req.active() != null) player.setActive(req.active());
        return withInjury(player);
    }

    @Transactional
    public void softDelete(UUID id) {
        Player player = findEntity(id);
        player.setActive(false);
    }

    @Transactional(readOnly = true)
    public List<Player> findEligibleForMonthlyGeneration() {
        return repository.findEligibleForMonthlyGeneration();
    }

    private PlayerResponse withInjury(Player player) {
        Injury active = injuryRepository.findByPlayerIdAndEndDateIsNull(player.getId()).orElse(null);
        return PlayerResponse.from(player, active);
    }

    private void validateCpf(String cpf) {
        if (!CpfValidator.isValid(cpf)) {
            throw new BusinessException("CPF inválido");
        }
    }
}
