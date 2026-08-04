package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "contrat")
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_employe", nullable = false)
    private Employe employe;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "nombre_mois")
    private Integer nombreMois;

    @ManyToOne
    @JoinColumn(name = "id_type_contrat")
    private TypesContrat typeContrat;

    public Contrat() {}

    public Contrat(Employe employe, LocalDate dateDebut, Integer nombreMois, TypesContrat typeContrat) {
        this.employe = employe;
        this.dateDebut = dateDebut;
        this.nombreMois = nombreMois;
        this.typeContrat = typeContrat;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employe getEmploye() {
        return employe;
    }

    public void setEmploye(Employe employe) {
        this.employe = employe;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public Integer getNombreMois() {
        return nombreMois;
    }

    public void setNombreMois(Integer nombreMois) {
        this.nombreMois = nombreMois;
    }

    public TypesContrat getTypeContrat() {
        return typeContrat;
    }

    public void setTypeContrat(TypesContrat typeContrat) {
        this.typeContrat = typeContrat;
    }
}
