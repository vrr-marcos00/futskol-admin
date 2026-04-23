package com.futskol.admin.repository;

import com.futskol.admin.entity.Payment;
import com.futskol.admin.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByPlayerIdAndReferenceMonth(UUID playerId, LocalDate referenceMonth);

    List<Payment> findAllByReferenceMonthOrderByPlayerNameAsc(LocalDate referenceMonth);

    @Query("""
            SELECT p FROM Payment p
            WHERE (:playerId IS NULL OR p.player.id = :playerId)
              AND (:status IS NULL OR p.status = :status)
              AND (:referenceMonth IS NULL OR p.referenceMonth = :referenceMonth)
            ORDER BY p.referenceMonth DESC, p.player.name ASC
            """)
    List<Payment> search(@Param("playerId") UUID playerId,
                         @Param("status") PaymentStatus status,
                         @Param("referenceMonth") LocalDate referenceMonth);

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0) FROM Payment p
            WHERE p.status = :status AND p.referenceMonth = :month
            """)
    BigDecimal sumByStatusAndMonth(@Param("status") PaymentStatus status,
                                   @Param("month") LocalDate month);

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0) FROM Payment p
            WHERE p.status IN :statuses AND p.referenceMonth = :month
            """)
    BigDecimal sumByStatusesAndMonth(@Param("statuses") List<PaymentStatus> statuses,
                                     @Param("month") LocalDate month);

    @Query("""
            SELECT COUNT(DISTINCT p.player.id) FROM Payment p
            WHERE p.status = :status AND p.referenceMonth = :month
            """)
    long countDistinctPlayersByStatusAndMonth(@Param("status") PaymentStatus status,
                                              @Param("month") LocalDate month);

    @Query("""
            SELECT COUNT(DISTINCT p.player.id) FROM Payment p
            WHERE p.status IN :statuses AND p.referenceMonth = :month
            """)
    long countDistinctPlayersByStatusesAndMonth(@Param("statuses") List<PaymentStatus> statuses,
                                                @Param("month") LocalDate month);

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0) FROM Payment p
            WHERE p.status = 'PAGO'
            """)
    BigDecimal sumAllPaid();

    List<Payment> findByStatusAndReferenceMonthLessThan(PaymentStatus status, LocalDate referenceMonth);

    List<Payment> findByInjuryIdAndStatusAndReferenceMonthGreaterThan(UUID injuryId,
                                                                     PaymentStatus status,
                                                                     LocalDate referenceMonth);
}
