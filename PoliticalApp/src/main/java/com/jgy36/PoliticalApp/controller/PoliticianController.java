package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.entity.Politician;
import com.jgy36.PoliticalApp.repository.PoliticianRepository;
import com.jgy36.PoliticalApp.service.CabinetService;
import com.jgy36.PoliticalApp.service.PoliticianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/politicians")
public class PoliticianController {

    private final PoliticianService politicianService;

    @Autowired
    private PoliticianRepository politicianRepository;

    @Autowired
    private CabinetService cabinetService;

    public PoliticianController(PoliticianService politicianService) {
        this.politicianService = politicianService;
    }

    // ✅ Fetch all counties
    @PostMapping("/fetch/all-counties")
    public ResponseEntity<String> fetchAndStoreAllCounties() {
        politicianService.fetchAndStoreAllCounties();
        return ResponseEntity.ok("✅ Fetching politicians for all counties...");
    }

    // ✅ Fetch a specific county
    @PostMapping("/fetch/county")
    public ResponseEntity<String> fetchAndStorePoliticiansByCounty(@RequestParam String state, @RequestParam String county) {
        politicianService.fetchAndStorePoliticiansByCounty(state, county);
        return ResponseEntity.ok("✅ Fetching politicians for " + county + ", " + state);
    }

    // Get all politicians
    @GetMapping
    public List<Politician> getAllPoliticians() {
        return politicianRepository.findAll();
    }

    // Get politicians by county and state
    @GetMapping("/county/{county}/{state}")
    public ResponseEntity<List<Politician>> getPoliticiansByCounty(
            @PathVariable String county,
            @PathVariable String state) {

        List<Politician> politicians = politicianRepository.findByCountyAndState(county, state);
        return ResponseEntity.ok(politicians);
    }

    // Get politicians by state (state-level officials)
    @GetMapping("/state/{state}")
    public ResponseEntity<List<Politician>> getPoliticiansByState(@PathVariable String state) {
        // Find politicians with this state where county is null (state-level)
        List<Politician> politicians = politicianRepository.findByStateAndCountyIsNull(state);
        return ResponseEntity.ok(politicians);
    }

    // Get politician by ID
    @GetMapping("/{id}")
    public ResponseEntity<Politician> getPoliticianById(@PathVariable Long id) {
        return politicianRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/debug/counties")
    public ResponseEntity<List<String>> getAllCounties() {
        List<Object[]> storedCounties = politicianRepository.findAllStoredCounties();
        List<String> result = new ArrayList<>();

        for (Object[] countyState : storedCounties) {
            if (countyState[0] != null && countyState[1] != null) {
                result.add(countyState[0] + ", " + countyState[1]);
            }
        }

        return ResponseEntity.ok(result);
    }

    // Flexible county search - allows partial matching
    @GetMapping("/search")
    public ResponseEntity<List<Politician>> searchPoliticians(
            @RequestParam(required = false) String county,
            @RequestParam(required = false) String state) {

        List<Politician> results = new ArrayList<>();

        if (county != null && state != null) {
            // Try exact match first
            results = politicianRepository.findByCountyAndState(county, state);

            // If no results, try with LIKE queries (requires custom repository method)
            if (results.isEmpty()) {
                results = politicianRepository.findByCountyContainingAndState(county, state);
            }
        } else if (county != null) {
            results = politicianRepository.findByCountyContaining(county);
        } else if (state != null) {
            results = politicianRepository.findByState(state);
        }

        return ResponseEntity.ok(results);
    }

    // Get all cabinet members
    @GetMapping("/cabinet")
    public ResponseEntity<List<Politician>> getCabinetMembers() {
        List<Politician> cabinetMembers = cabinetService.getAllCabinetMembers();
        return ResponseEntity.ok(cabinetMembers);
    }

    // Manually reload cabinet members (useful for testing/updates)
    @PostMapping("/cabinet/reload")
    public ResponseEntity<String> reloadCabinetMembers() {
        try {
            cabinetService.loadCabinetMembers();
            return ResponseEntity.ok("Cabinet members reloaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error reloading cabinet members: " + e.getMessage());
        }
    }
}
