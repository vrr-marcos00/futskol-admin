package com.futskol.admin.repository;

import com.futskol.admin.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlayerRepository extends JpaRepository<Player, UUID> {

    Optional<Player> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    List<Player> findAllByActiveTrueOrderByNameAsc();

    @Query("""
            SELECT p FROM Player p
            WHERE (:active IS NULL OR p.active = :active)
              AND (:typeId IS NULL OR p.playerType.id = :typeId)
            ORDER BY p.name ASC
            """)
    List<Player> filter(@Param("active") Boolean active,
                        @Param("typeId") UUID typeId);

    @Query("""
            SELECT p FROM Player p
            WHERE (:active IS NULL OR p.active = :active)
              AND (:typeId IS NULL OR p.playerType.id = :typeId)
              AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR p.cpf LIKE CONCAT('%', :search, '%'))
            ORDER BY p.name ASC
            """)
    List<Player> searchByText(@Param("active") Boolean active,
                              @Param("typeId") UUID typeId,
                              @Param("search") String search);
}
