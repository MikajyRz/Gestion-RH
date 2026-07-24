package com.gestion.rh.model;

import jakarta.persistence.*;

@Entity
@Table(name = "profildiplome")
public class ProfilDiplome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "idprofil", nullable = false)
    private Profil profil;

    @ManyToOne
    @JoinColumn(name = "iddiplome", nullable = false)
    private Diplome diplome;

    public ProfilDiplome() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Profil getProfil() {
        return profil;
    }

    public void setProfil(Profil profil) {
        this.profil = profil;
    }

    public Diplome getDiplome() {
        return diplome;
    }

    public void setDiplome(Diplome diplome) {
        this.diplome = diplome;
    }
}
