package com.futskol.admin.repository;

import com.futskol.admin.entity.Cost;
import com.futskol.admin.enums.CostCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface CostRepository extends JpaRepository<Cost, UUID> {

    List<Cost> findAllByOrderByDateDesc();

    List<Cost> findAllByCategoryOrderByDateDesc(CostCategory category);

    List<Cost> findAllByDateBetweenOrderByDateDesc(LocalDate from, LocalDate to);

    List<Cost> findAllByCategoryAndDateBetweenOrderByDateDesc(CostCategory category,
                                                             LocalDate from,
                                                             LocalDate to);

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0) FROM Cost c
            WHERE c.date BETWEEN :from AND :to
            """)
    BigDecimal sumBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM Cost c")
    BigDecimal sumAll();
}
