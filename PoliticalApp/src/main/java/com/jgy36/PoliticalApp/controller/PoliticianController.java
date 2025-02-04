package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.entity.Politician;
import com.jgy36.PoliticalApp.service.PoliticianService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/politicians")
public class PoliticianController {

    private final PoliticianService politicianService;

    public PoliticianController(PoliticianService politicianService) {
        this.politicianService = politicianService;
    }

    // ✅ Public endpoint: Get all politicians
    @GetMapping
    public ResponseEntity<List<Politician>> getAllPoliticians() {
        return ResponseEntity.ok(politicianService.getAllPoliticians());
    }

    // ✅ Public endpoint: Get a politician by ID
    @GetMapping("/{id}")
    public ResponseEntity<Politician> getPoliticianById(@PathVariable Long id) {
        Optional<Politician> politician = politicianService.getPoliticianById(id);
        return politician.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Public endpoint: Search by party, state, or position
    @GetMapping("/search")
    public ResponseEntity<List<Politician>> searchPoliticians(
            @RequestParam(required = false) String party,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String position) {

        if (party != null) return ResponseEntity.ok(politicianService.findByParty(party));
        if (state != null) return ResponseEntity.ok(politicianService.findByState(state));
        if (position != null) return ResponseEntity.ok(politicianService.findByPosition(position));

        return ResponseEntity.badRequest().build();
    }

    // ✅ Admin-only: Add a new politician
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Politician> addPolitician(@RequestBody Politician politician) {
        return ResponseEntity.ok(politicianService.addPolitician(politician));
    }

    // ✅ Admin-only: Delete a politician
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deletePolitician(@PathVariable Long id) {
        politicianService.deletePolitician(id);
        return ResponseEntity.ok("Politician deleted successfully.");
    }
}
