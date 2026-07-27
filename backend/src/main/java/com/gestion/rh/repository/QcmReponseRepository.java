package com.gestion.rh.repository;

import com.gestion.rh.model.QcmReponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QcmReponseRepository extends JpaRepository<QcmReponse, Integer> {
    List<QcmReponse> findByCandidatId(Long idCandidat);
    List<QcmReponse> findByTestId(Integer idTest);
}
