package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "jour_ferie")
public class JourFerie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String libelle;

    @Column(name = "date_ferie", nullable = false, unique = true)
    private LocalDate dateFerie;

    public JourFerie() {}

    public JourFerie(String libelle, LocalDate dateFerie) {
        this.libelle = libelle;
        this.dateFerie = dateFerie;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public LocalDate getDateFerie() {
        return dateFerie;
    }

    public void setDateFerie(LocalDate dateFerie) {
        this.dateFerie = dateFerie;
    }
}
