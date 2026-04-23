package com.futskol.admin.repository;

import com.futskol.admin.entity.PlayerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlayerTypeRepository extends JpaRepository<PlayerType, UUID> {
    List<PlayerType> findAllByOrderByNameAsc();
    List<PlayerType> findAllByActiveOrderByNameAsc(boolean active);
    boolean existsByNameIgnoreCase(String name);
}
