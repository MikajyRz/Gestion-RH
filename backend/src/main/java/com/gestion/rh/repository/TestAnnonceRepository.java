package com.gestion.rh.repository;

import com.gestion.rh.model.TestAnnonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestAnnonceRepository extends JpaRepository<TestAnnonce, Integer> {
    List<TestAnnonce> findByAnnonceId(Long idAnnonce);
    List<TestAnnonce> findByTestId(Integer idTest);
}
