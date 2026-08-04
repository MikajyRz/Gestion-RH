package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "annonce")
public class Annonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_poste", nullable = false, length = 100)
    private String nomposte;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_debut")
    private LocalDate datedebut;

    @Column(name = "date_fin")
    private LocalDate datefin;

    @Column(name = "date_publication")
    private LocalDate datepublication;

    @ManyToOne
    @JoinColumn(name = "id_departement")
    private Departement departement;

    @ManyToOne
    @JoinColumn(name = "id_profil")
    private Profil profil;

    @ManyToOne
    @JoinColumn(name = "id_type_annonce")
    private TypeAnnonce typeannonce;

    public Annonce() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomposte() { return nomposte; }
    public void setNomposte(String nomposte) { this.nomposte = nomposte; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDatedebut() { return datedebut; }
    public void setDatedebut(LocalDate datedebut) { this.datedebut = datedebut; }
    public LocalDate getDatefin() { return datefin; }
    public void setDatefin(LocalDate datefin) { this.datefin = datefin; }
    public LocalDate getDatepublication() { return datepublication; }
    public void setDatepublication(LocalDate datepublication) { this.datepublication = datepublication; }
    public Departement getDepartement() { return departement; }
    public void setDepartement(Departement departement) { this.departement = departement; }
    public Profil getProfil() { return profil; }
    public void setProfil(Profil profil) { this.profil = profil; }
    public TypeAnnonce getTypeannonce() { return typeannonce; }
    public void setTypeannonce(TypeAnnonce typeannonce) { this.typeannonce = typeannonce; }
}