package com.gestion.rh.repository;

import com.gestion.rh.model.StatutBulletin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatutBulletinRepository extends JpaRepository<StatutBulletin, Long> {
    Optional<StatutBulletin> findByCode(String code);
}
