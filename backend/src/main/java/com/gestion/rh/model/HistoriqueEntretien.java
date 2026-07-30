package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historiqueentretien")
public class HistoriqueEntretien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "identretien", nullable = false)
    private Entretien entretien;

    @ManyToOne
    @JoinColumn(name = "idstatut", nullable = false)
    private StatutEntretien statut;

    @Column(name = "datechangement")
    private LocalDateTime datechangement = LocalDateTime.now();

    public HistoriqueEntretien() {}

    public HistoriqueEntretien(Entretien entretien, StatutEntretien statut) {
        this.entretien = entretien;
        this.statut = statut;
        this.datechangement = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Entretien getEntretien() {
        return entretien;
    }

    public void setEntretien(Entretien entretien) {
        this.entretien = entretien;
    }

    public StatutEntretien getStatut() {
        return statut;
    }

    public void setStatut(StatutEntretien statut) {
        this.statut = statut;
    }

    public LocalDateTime getDatechangement() {
        return datechangement;
    }

    public void setDatechangement(LocalDateTime datechangement) {
        this.datechangement = datechangement;
    }
}
