package com.futskol.admin.service;

import com.futskol.admin.dto.PlayerTypeRequest;
import com.futskol.admin.dto.PlayerTypeResponse;
import com.futskol.admin.entity.PlayerType;
import com.futskol.admin.exception.ConflictException;
import com.futskol.admin.exception.NotFoundException;
import com.futskol.admin.repository.PlayerTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlayerTypeService {

    private final PlayerTypeRepository repository;

    @Transactional(readOnly = true)
    public List<PlayerTypeResponse> list(Boolean active) {
        List<PlayerType> types = (active == null)
                ? repository.findAllByOrderByNameAsc()
                : repository.findAllByActiveOrderByNameAsc(active);
        return types.stream().map(PlayerTypeResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public PlayerType findEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de jogador não encontrado"));
    }

    @Transactional
    public PlayerTypeResponse create(PlayerTypeRequest req) {
        if (repository.existsByNameIgnoreCase(req.name())) {
            throw new ConflictException("Já existe um tipo com esse nome");
        }
        PlayerType entity = PlayerType.builder()
                .name(req.name())
                .monthlyFee(req.monthlyFee())
                .monthlyLimit(req.monthlyLimit())
                .active(Optional.ofNullable(req.active()).orElse(true))
                .build();
        return PlayerTypeResponse.from(repository.save(entity));
    }

    @Transactional
    public PlayerTypeResponse update(UUID id, PlayerTypeRequest req) {
        PlayerType entity = findEntity(id);
        entity.setName(req.name());
        entity.setMonthlyFee(req.monthlyFee());
        entity.setMonthlyLimit(req.monthlyLimit());
        if (req.active() != null) entity.setActive(req.active());
        return PlayerTypeResponse.from(entity);
    }
}
