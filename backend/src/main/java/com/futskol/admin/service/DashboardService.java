package com.futskol.admin.service;

import com.futskol.admin.dto.CashResponse;
import com.futskol.admin.dto.DashboardResponse;
import com.futskol.admin.entity.Player;
import com.futskol.admin.entity.PlayerType;
import com.futskol.admin.enums.PaymentStatus;
import com.futskol.admin.repository.CostRepository;
import com.futskol.admin.repository.InjuryRepository;
import com.futskol.admin.repository.PaymentRepository;
import com.futskol.admin.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PaymentRepository paymentRepository;
    private final CostRepository costRepository;
    private final PlayerRepository playerRepository;
    private final InjuryRepository injuryRepository;

    @Transactional(readOnly = true)
    public DashboardResponse summary(YearMonth yearMonth) {
        YearMonth ym = yearMonth == null ? YearMonth.now() : yearMonth;
        LocalDate first = ym.atDay(1);
        LocalDate last = ym.atEndOfMonth();

        BigDecimal totalExpected = calculateExpected();
        BigDecimal totalPaid = paymentRepository.sumByStatusAndMonth(PaymentStatus.PAGO, first);
        BigDecimal totalPending = paymentRepository.sumByStatusesAndMonth(
                List.of(PaymentStatus.PENDENTE, PaymentStatus.ATRASADO), first);
        long payingCount = paymentRepository.countDistinctPlayersByStatusAndMonth(PaymentStatus.PAGO, first);
        long defaultingCount = paymentRepository.countDistinctPlayersByStatusesAndMonth(
                List.of(PaymentStatus.PENDENTE, PaymentStatus.ATRASADO), first);
        long injuredCount = injuryRepository.countByEndDateIsNull();
        BigDecimal totalCosts = costRepository.sumBetween(first, last);
        BigDecimal currentCash = currentCash();

        return new DashboardResponse(
                ym, totalExpected, totalPaid, totalPending,
                payingCount, defaultingCount, injuredCount, totalCosts, currentCash
        );
    }

    @Transactional(readOnly = true)
    public CashResponse cash() {
        BigDecimal totalPaid = paymentRepository.sumAllPaid();
        BigDecimal totalCosts = costRepository.sumAll();
        return new CashResponse(totalPaid, totalCosts, totalPaid.subtract(totalCosts));
    }

    private BigDecimal currentCash() {
        return paymentRepository.sumAllPaid().subtract(costRepository.sumAll());
    }

    /**
     * Soma do monthly_fee de cada jogador ativo, respeitando o limite mensal do seu tipo
     * (ex.: Convidado só gera expectativa de 1 partida por mês).
     */
    private BigDecimal calculateExpected() {
        List<Player> activePlayers = playerRepository.findAllByActiveTrueOrderByNameAsc();
        return activePlayers.stream()
                .map(p -> {
                    PlayerType t = p.getPlayerType();
                    if (!t.isActive()) return BigDecimal.ZERO;
                    return t.getMonthlyFee();
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
