package com.gestion.rh.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "solde_conge")
public class SoldeConge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_employe", nullable = false)
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "id_type_conge", nullable = false)
    private TypeConge typeConge;

    @Column(nullable = false)
    private Integer annee;

    @Column(name = "jours_acquis", precision = 6, scale = 2)
    private BigDecimal joursAcquis = BigDecimal.ZERO;

    @Column(name = "jours_pris", precision = 6, scale = 2)
    private BigDecimal joursPris = BigDecimal.ZERO;

    @Column(name = "jours_restants", precision = 6, scale = 2)
    private BigDecimal joursRestants = BigDecimal.ZERO;

    @Column(name = "date_calcul")
    private LocalDateTime dateCalcul = LocalDateTime.now();

    public SoldeConge() {}

    public SoldeConge(Employe employe, TypeConge typeConge, Integer annee, BigDecimal joursAcquis) {
        this.employe = employe;
        this.typeConge = typeConge;
        this.annee = annee;
        this.joursAcquis = joursAcquis != null ? joursAcquis : BigDecimal.ZERO;
        this.joursPris = BigDecimal.ZERO;
        this.joursRestants = this.joursAcquis;
        this.dateCalcul = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Employe getEmploye() {
        return employe;
    }

    public void setEmploye(Employe employe) {
        this.employe = employe;
    }

    public TypeConge getTypeConge() {
        return typeConge;
    }

    public void setTypeConge(TypeConge typeConge) {
        this.typeConge = typeConge;
    }

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }

    public BigDecimal getJoursAcquis() {
        return joursAcquis;
    }

    public void setJoursAcquis(BigDecimal joursAcquis) {
        this.joursAcquis = joursAcquis;
    }

    public BigDecimal getJoursPris() {
        return joursPris;
    }

    public void setJoursPris(BigDecimal joursPris) {
        this.joursPris = joursPris;
    }

    public BigDecimal getJoursRestants() {
        return joursRestants;
    }

    public void setJoursRestants(BigDecimal joursRestants) {
        this.joursRestants = joursRestants;
    }

    public LocalDateTime getDateCalcul() {
        return dateCalcul;
    }

    public void setDateCalcul(LocalDateTime dateCalcul) {
        this.dateCalcul = dateCalcul;
    }
}
