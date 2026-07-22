package com.gestion.rh.repository;

import com.gestion.rh.model.Annonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    @Query("SELECT a FROM Annonce a " +
           "WHERE (:motCle IS NULL OR :motCle = '' OR LOWER(a.nomposte) LIKE LOWER(CONCAT('%', :motCle, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :motCle, '%'))) " +
           "AND (:idDepartement IS NULL OR a.departement.id = :idDepartement) " +
           "AND (:idProfil IS NULL OR a.profil.id = :idProfil) " +
           "AND (:idTypeAnnonce IS NULL OR a.typeannonce.id = :idTypeAnnonce) " +
           "AND (:dateDebut IS NULL OR a.datepublication >= :dateDebut) " +
           "AND (:dateFin IS NULL OR a.datepublication <= :dateFin) " +
           "ORDER BY a.datepublication DESC")
    List<Annonce> rechercheMulticritere(
        @Param("motCle") String motCle,
        @Param("idDepartement") Integer idDepartement,
        @Param("idProfil") Integer idProfil,
        @Param("idTypeAnnonce") Integer idTypeAnnonce,
        @Param("dateDebut") LocalDate dateDebut,
        @Param("dateFin") LocalDate dateFin
    );
}