package com.gestion.rh.model;

import jakarta.persistence.*;

@Entity
@Table(name = "statut_demande_conge")
public class StatutDemandeConge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // EN_ATTENTE, APPROUVE, REFUSE, ANNULE

    @Column(nullable = false, length = 100)
    private String libelle;

    public StatutDemandeConge() {}

    public StatutDemandeConge(String code, String libelle) {
        this.code = code;
        this.libelle = libelle;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }
}
