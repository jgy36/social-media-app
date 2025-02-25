package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.service.PoliticianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/politicians")
public class PoliticianController {

    private final PoliticianService politicianService;

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
}
