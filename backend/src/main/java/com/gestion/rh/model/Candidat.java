package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "candidat")
public class Candidat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(name = "datenaissance")
    private LocalDate datenaissance;

    @Column(length = 200)
    private String adresse;

    @Column(columnDefinition = "TEXT")
    private String cv;

    @ManyToOne
    @JoinColumn(name = "idannonce")
    private Annonce annonce;

    @ManyToOne
    @JoinColumn(name = "idstatut")
    private StatutCandidat statut;

    public Candidat() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public LocalDate getDatenaissance() {
        return datenaissance;
    }

    public void setDatenaissance(LocalDate datenaissance) {
        this.datenaissance = datenaissance;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getCv() {
        return cv;
    }

    public void setCv(String cv) {
        this.cv = cv;
    }

    public Annonce getAnnonce() {
        return annonce;
    }

    public void setAnnonce(Annonce annonce) {
        this.annonce = annonce;
    }

    public StatutCandidat getStatut() {
        return statut;
    }

    public void setStatut(StatutCandidat statut) {
        this.statut = statut;
    }
}
