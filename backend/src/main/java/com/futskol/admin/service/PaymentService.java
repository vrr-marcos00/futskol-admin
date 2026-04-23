package com.futskol.admin.service;

import com.futskol.admin.dto.PaymentRequest;
import com.futskol.admin.dto.PaymentResponse;
import com.futskol.admin.entity.Injury;
import com.futskol.admin.entity.Payment;
import com.futskol.admin.entity.Player;
import com.futskol.admin.enums.PaymentStatus;
import com.futskol.admin.exception.ConflictException;
import com.futskol.admin.exception.NotFoundException;
import com.futskol.admin.repository.InjuryRepository;
import com.futskol.admin.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
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
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PlayerService playerService;
    private final InjuryRepository injuryRepository;

    @Transactional(readOnly = true)
    public List<PaymentResponse> search(UUID playerId, PaymentStatus status, YearMonth yearMonth) {
        LocalDate refDate = yearMonth == null ? null : yearMonth.atDay(1);
        return paymentRepository.search(playerId, status, refDate).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> findByMonth(YearMonth yearMonth) {
        return paymentRepository.findAllByReferenceMonthOrderByPlayerNameAsc(yearMonth.atDay(1)).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @Transactional
    public PaymentResponse create(PaymentRequest req) {
        Player player = playerService.findEntity(req.playerId());
        LocalDate refMonth = req.referenceMonth().atDay(1);

        paymentRepository.findByPlayerIdAndReferenceMonth(player.getId(), refMonth)
                .ifPresent(p -> {
                    throw new ConflictException("Já existe pagamento para esse jogador nesse mês");
                });

        Injury activeInjury = injuryRepository.findByPlayerIdAndEndDateIsNull(player.getId()).orElse(null);
        boolean injuryCoversMonth = activeInjury != null
                && !refMonth.isBefore(YearMonth.from(activeInjury.getStartDate()).atDay(1));

        PaymentStatus status;
        Injury linkedInjury = null;
        if (req.status() != null) {
            status = req.status();
        } else if (injuryCoversMonth && req.paymentDate() == null) {
            status = PaymentStatus.ISENTO;
            linkedInjury = activeInjury;
        } else {
            status = defaultStatus(refMonth, req.paymentDate());
        }

        Payment payment = Payment.builder()
                .player(player)
                .referenceMonth(refMonth)
                .amount(Optional.ofNullable(req.amount()).orElse(player.getPlayerType().getMonthlyFee()))
                .status(status)
                .paymentDate(req.paymentDate())
                .injury(linkedInjury)
                .notes(req.notes())
                .build();

        return PaymentResponse.from(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse update(UUID id, PaymentRequest req) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pagamento não encontrado"));

        LocalDate refMonth = req.referenceMonth().atDay(1);
        if (!payment.getReferenceMonth().equals(refMonth) || !payment.getPlayer().getId().equals(req.playerId())) {
            paymentRepository.findByPlayerIdAndReferenceMonth(req.playerId(), refMonth)
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new ConflictException("Já existe pagamento para esse jogador nesse mês");
                        }
                    });
        }

        if (!payment.getPlayer().getId().equals(req.playerId())) {
            payment.setPlayer(playerService.findEntity(req.playerId()));
        }

        payment.setReferenceMonth(refMonth);
        if (req.amount() != null) payment.setAmount(req.amount());
        if (req.status() != null) payment.setStatus(req.status());
        payment.setPaymentDate(req.paymentDate());
        payment.setNotes(req.notes());
        return PaymentResponse.from(payment);
    }

    private PaymentStatus defaultStatus(LocalDate refMonth, LocalDate paymentDate) {
        if (paymentDate != null) return PaymentStatus.PAGO;
        LocalDate firstOfCurrent = YearMonth.now().atDay(1);
        return refMonth.isBefore(firstOfCurrent) ? PaymentStatus.ATRASADO : PaymentStatus.PENDENTE;
    }

    /**
     * Job diário às 00:05 que promove pagamentos PENDENTE em meses passados para ATRASADO.
     */
    @Scheduled(cron = "0 5 0 * * *", zone = "America/Sao_Paulo")
    @Transactional
    public void markOverduePayments() {
        LocalDate firstOfCurrentMonth = YearMonth.now().atDay(1);
        List<Payment> pendings = paymentRepository.findByStatusAndReferenceMonthLessThan(
                PaymentStatus.PENDENTE, firstOfCurrentMonth);
        pendings.forEach(p -> p.setStatus(PaymentStatus.ATRASADO));
        if (!pendings.isEmpty()) {
            log.info("Marcados como ATRASADO: {} pagamentos", pendings.size());
        }
    }
}
