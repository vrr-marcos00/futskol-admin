package com.futskol.admin.repository;

import com.futskol.admin.entity.Injury;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InjuryRepository extends JpaRepository<Injury, UUID> {

    Optional<Injury> findByPlayerIdAndEndDateIsNull(UUID playerId);

    List<Injury> findAllByPlayerIdOrderByStartDateDesc(UUID playerId);

    List<Injury> findAllByEndDateIsNullOrderByStartDateDesc();

    List<Injury> findAllByOrderByStartDateDesc();

    long countByEndDateIsNull();
}
