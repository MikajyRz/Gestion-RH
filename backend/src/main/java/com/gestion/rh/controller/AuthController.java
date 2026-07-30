package com.gestion.rh.controller;

import com.gestion.rh.model.Utilisateurs;
import com.gestion.rh.repository.UtilisateursRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UtilisateursRepository utilisateursRepository;

    public AuthController(UtilisateursRepository utilisateursRepository) {
        this.utilisateursRepository = utilisateursRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String motdepasse = request.get("motdepasse");

        if (email == null || email.isBlank() || motdepasse == null || motdepasse.isBlank()) {
            return ResponseEntity.badRequest().body("L'email et le mot de passe sont obligatoires.");
        }

        Optional<Utilisateurs> userOpt = utilisateursRepository.findByEmail(email.trim());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
        }

        Utilisateurs user = userOpt.get();

        // Vérification directe du mot de passe
        if (!user.getMotdepasse().equals(motdepasse)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        if (user.getEmploye() != null) {
            response.put("nom", user.getEmploye().getNom());
            response.put("prenom", user.getEmploye().getPrenom());
        }

        return ResponseEntity.ok(response);
    }
}
