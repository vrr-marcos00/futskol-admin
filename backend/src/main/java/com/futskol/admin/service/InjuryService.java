package com.futskol.admin.service;

import com.futskol.admin.dto.InjuryCloseRequest;
import com.futskol.admin.dto.InjuryResponse;
import com.futskol.admin.dto.InjuryStartRequest;
import com.futskol.admin.entity.Injury;
import com.futskol.admin.entity.Payment;
import com.futskol.admin.entity.Player;
import com.futskol.admin.enums.PaymentStatus;
import com.futskol.admin.exception.BusinessException;
import com.futskol.admin.exception.ConflictException;
import com.futskol.admin.exception.NotFoundException;
import com.futskol.admin.repository.InjuryRepository;
import com.futskol.admin.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InjuryService {

    private final InjuryRepository injuryRepository;
    private final PlayerService playerService;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public List<InjuryResponse> listAll(Boolean active, UUID playerId) {
        List<Injury> injuries;
        if (playerId != null) {
            injuries = injuryRepository.findAllByPlayerIdOrderByStartDateDesc(playerId);
        } else if (Boolean.TRUE.equals(active)) {
            injuries = injuryRepository.findAllByEndDateIsNullOrderByStartDateDesc();
        } else {
            injuries = injuryRepository.findAllByOrderByStartDateDesc();
        }
        return injuries.stream().map(InjuryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Optional<Injury> findActiveForPlayer(UUID playerId) {
        return injuryRepository.findByPlayerIdAndEndDateIsNull(playerId);
    }

    @Transactional(readOnly = true)
    public long countActive() {
        return injuryRepository.countByEndDateIsNull();
    }

    @Transactional
    public InjuryResponse start(UUID playerId, InjuryStartRequest req) {
        Player player = playerService.findEntity(playerId);
        injuryRepository.findByPlayerIdAndEndDateIsNull(playerId).ifPresent(existing -> {
            throw new ConflictException("Jogador já está lesionado");
        });
        Injury injury = Injury.builder()
                .player(player)
                .startDate(req.startDate())
                .notes(req.notes())
                .build();
        return InjuryResponse.from(injuryRepository.save(injury));
    }

    @Transactional
    public InjuryResponse close(UUID playerId, UUID injuryId, InjuryCloseRequest req) {
        Injury injury = injuryRepository.findById(injuryId)
                .orElseThrow(() -> new NotFoundException("Lesão não encontrada"));
        if (!injury.getPlayer().getId().equals(playerId)) {
            throw new NotFoundException("Lesão não encontrada");
        }
        if (injury.getEndDate() != null) {
            throw new BusinessException("Lesão já foi encerrada");
        }
        if (req.endDate().isBefore(injury.getStartDate())) {
            throw new BusinessException("Data de fim não pode ser anterior ao início");
        }
        injury.setEndDate(req.endDate());
        if (req.notes() != null && !req.notes().isBlank()) {
            injury.setNotes(req.notes());
        }

        LocalDate firstOfCurrent = YearMonth.now().atDay(1);
        List<Payment> futureExempt = paymentRepository.findByInjuryIdAndStatusAndReferenceMonthGreaterThan(
                injury.getId(), PaymentStatus.ISENTO, firstOfCurrent);
        for (Payment p : futureExempt) {
            p.setStatus(PaymentStatus.PENDENTE);
            p.setInjury(null);
        }
        if (!futureExempt.isEmpty()) {
            log.info("Lesão {} encerrada: {} pagamento(s) ISENTO futuro(s) revertido(s) para PENDENTE",
                    injury.getId(), futureExempt.size());
        }

        return InjuryResponse.from(injury);
    }
}
