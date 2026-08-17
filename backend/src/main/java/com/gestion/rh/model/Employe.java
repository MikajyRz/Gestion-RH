package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "employe")
public class Employe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "matricule", length = 50)
    private String matricule;

    @Column(name = "numero_cnaps", length = 50)
    private String numeroCnaps;

    @Column(name = "date_dembauche")
    private LocalDate dateDembauche;

    @ManyToOne
    @JoinColumn(name = "id_departement")
    private Departement departement;

    public Employe() {}

    public Employe(String nom, String prenom, String email) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
    }

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public String getNumeroCnaps() {
        return numeroCnaps;
    }

    public void setNumeroCnaps(String numeroCnaps) {
        this.numeroCnaps = numeroCnaps;
    }

    public LocalDate getDateDembauche() {
        return dateDembauche;
    }

    public void setDateDembauche(LocalDate dateDembauche) {
        this.dateDembauche = dateDembauche;
    }

    public Departement getDepartement() {
        return departement;
    }

    public void setDepartement(Departement departement) {
        this.departement = departement;
    }
}
