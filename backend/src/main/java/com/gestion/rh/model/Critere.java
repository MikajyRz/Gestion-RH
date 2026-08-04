package com.gestion.rh.model;

import jakarta.persistence.*;

@Entity
@Table(name = "critere")
public class Critere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nom;

    @ManyToOne
    @JoinColumn(name = "id_type_champ")
    private TypeChamp typechamp;

    public Critere() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public TypeChamp getTypechamp() {
        return typechamp;
    }

    public void setTypechamp(TypeChamp typechamp) {
        this.typechamp = typechamp;
    }
}
