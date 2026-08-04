package com.gestion.rh.model;

import jakarta.persistence.*;

@Entity
@Table(name = "type_conge")
public class TypeConge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String libelle;

    @Column(name = "est_remunere")
    private Boolean estRemunere = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    public TypeConge() {}

    public TypeConge(String libelle, Boolean estRemunere, String description) {
        this.libelle = libelle;
        this.estRemunere = estRemunere;
        this.description = description;
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

    public Boolean getEstRemunere() {
        return estRemunere;
    }

    public void setEstRemunere(Boolean estRemunere) {
        this.estRemunere = estRemunere;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
