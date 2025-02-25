package com.jgy36.PoliticalApp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jgy36.PoliticalApp.entity.AppointedOfficial;
import com.jgy36.PoliticalApp.repository.AppointedOfficialRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
public class AppointedOfficialService {

    private final AppointedOfficialRepository appointedOfficialRepository;
    private final ObjectMapper objectMapper;

    public AppointedOfficialService(AppointedOfficialRepository appointedOfficialRepository, ObjectMapper objectMapper) {
        this.appointedOfficialRepository = appointedOfficialRepository;
        this.objectMapper = objectMapper;
    }

    public void importAppointedOfficials() {
        try {
            File file = new ClassPathResource("data/appointed_officials.json").getFile();
            List<AppointedOfficial> officials = Arrays.asList(objectMapper.readValue(file, AppointedOfficial[].class));

            for (AppointedOfficial official : officials) {
                if (!appointedOfficialRepository.existsByName(official.getName())) {
                    appointedOfficialRepository.save(official);
                }
            }
            System.out.println("✅ Successfully imported appointed officials.");
        } catch (IOException e) {
            System.err.println("❌ Error reading appointed_officials.json: " + e.getMessage());
        }
    }
}
