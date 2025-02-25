package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.service.AppointedOfficialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointed-officials")
public class AppointedOfficialController {

    private final AppointedOfficialService appointedOfficialService;

    public AppointedOfficialController(AppointedOfficialService appointedOfficialService) {
        this.appointedOfficialService = appointedOfficialService;
    }

    @PostMapping("/import")
    public ResponseEntity<String> importAppointedOfficials() {
        appointedOfficialService.importAppointedOfficials();
        return ResponseEntity.ok("Appointed officials imported successfully.");
    }
}
