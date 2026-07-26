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

    @Query("SELECT DISTINCT a FROM Annonce a " +
           "LEFT JOIN FETCH a.departement " +
           "LEFT JOIN FETCH a.profil " +
           "LEFT JOIN FETCH a.typeannonce " +
           "WHERE (cast(:motCle as string) IS NULL OR :motCle = '' OR LOWER(a.nomposte) LIKE LOWER(CONCAT('%', :motCle, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :motCle, '%'))) " +
           "AND (cast(:idDepartement as integer) IS NULL OR a.departement.id = :idDepartement) " +
           "AND (cast(:idProfil as integer) IS NULL OR a.profil.id = :idProfil) " +
           "AND (cast(:idTypeAnnonce as integer) IS NULL OR a.typeannonce.id = :idTypeAnnonce) " +
           "AND (cast(:dateDebut as date) IS NULL OR a.datepublication >= :dateDebut) " +
           "AND (cast(:dateFin as date) IS NULL OR a.datepublication <= :dateFin) " +
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