package com.gestion.rh.repository;

import com.gestion.rh.model.LigneBulletinPaie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LigneBulletinPaieRepository extends JpaRepository<LigneBulletinPaie, Long> {
    List<LigneBulletinPaie> findByBulletinPaieId(Long idBulletinPaie);
    void deleteByBulletinPaieId(Long idBulletinPaie);
}
