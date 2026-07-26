package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historiquecandidature")
public class HistoriqueCandidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idcandidat")
    private Candidat candidat;

    @ManyToOne
    @JoinColumn(name = "idstatut")
    private StatutCandidat statut;

    @Column(name = "datechangement")
    private LocalDateTime datechangement;

    public HistoriqueCandidature() {
        this.datechangement = LocalDateTime.now();
    }

    public HistoriqueCandidature(Candidat candidat, StatutCandidat statut) {
        this.candidat = candidat;
        this.statut = statut;
        this.datechangement = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Candidat getCandidat() {
        return candidat;
    }

    public void setCandidat(Candidat candidat) {
        this.candidat = candidat;
    }

    public StatutCandidat getStatut() {
        return statut;
    }

    public void setStatut(StatutCandidat statut) {
        this.statut = statut;
    }

    public LocalDateTime getDatechangement() {
        return datechangement;
    }

    public void setDatechangement(LocalDateTime datechangement) {
        this.datechangement = datechangement;
    }
}
