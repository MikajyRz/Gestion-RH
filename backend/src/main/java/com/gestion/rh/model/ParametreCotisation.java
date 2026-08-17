package com.gestion.rh.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "parametre_cotisation")
public class ParametreCotisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "libelle", nullable = false, unique = true, length = 100)
    private String libelle;

    @Column(name = "taux", nullable = false, precision = 6, scale = 2)
    private BigDecimal taux;

    @Column(name = "plafond_salarial", precision = 12, scale = 2)
    private BigDecimal plafondSalarial;

    @Column(name = "date_effet", nullable = false)
    private LocalDate dateEffet;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    public ParametreCotisation() {
    }

    public ParametreCotisation(String libelle, BigDecimal taux, BigDecimal plafondSalarial, LocalDate dateEffet) {
        this.libelle = libelle;
        this.taux = taux;
        this.plafondSalarial = plafondSalarial;
        this.dateEffet = dateEffet;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public BigDecimal getTaux() {
        return taux;
    }

    public void setTaux(BigDecimal taux) {
        this.taux = taux;
    }

    public BigDecimal getPlafondSalarial() {
        return plafondSalarial;
    }

    public void setPlafondSalarial(BigDecimal plafondSalarial) {
        this.plafondSalarial = plafondSalarial;
    }

    public LocalDate getDateEffet() {
        return dateEffet;
    }

    public void setDateEffet(LocalDate dateEffet) {
        this.dateEffet = dateEffet;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }
}
