package com.jgy36.PoliticalApp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jgy36.PoliticalApp.entity.Politician;
import com.jgy36.PoliticalApp.repository.PoliticianRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class CabinetService {

    private static final Logger logger = LoggerFactory.getLogger(CabinetService.class);


    @Autowired
    private PoliticianRepository politicianRepository;

    @PostConstruct
    public void init() {
        try {
            loadCabinetMembers();
        } catch (Exception e) {
            // Log the error but don't prevent application startup
            System.err.println("Error loading cabinet members: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public void updateMissingPhotoUrls() {
        List<Politician> politicians = politicianRepository.findAll();
        for (Politician politician : politicians) {
            if (politician.getPhotoUrl() == null || politician.getPhotoUrl().equals("N/A")) {
                String fallbackUrl = "/images/fallback/" +
                        politician.getName()
                                .toLowerCase()
                                .replace(" ", "_")
                                .replaceAll("[^a-z0-9_]", "") +
                        ".jpg";
                politician.setPhotoUrl(fallbackUrl);
            }
        }
        politicianRepository.saveAll(politicians);
    }

    /**
     * Loads cabinet members from JSON file and saves them to the database
     */
    public void loadCabinetMembers() throws IOException {
        try {
            ObjectMapper mapper = new ObjectMapper();

            // Try to load the file
            Resource resource = new ClassPathResource("cabinet_members.json");

            if (!resource.exists()) {
                System.err.println("Warning: cabinet_members.json not found in classpath");
                System.err.println("Expected location: src/main/resources/cabinet_members.json");
                return;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                // Read cabinet members from JSON
                List<CabinetMemberDTO> cabinetMembers = mapper.readValue(inputStream,
                        new TypeReference<List<CabinetMemberDTO>>() {
                        });

                // Convert to Politician entities and save
                List<Politician> politicians = new ArrayList<>();
                for (CabinetMemberDTO member : cabinetMembers) {
                    // Check if the cabinet member already exists in the database
                    if (!politicianRepository.existsByNameAndPosition(member.getName(), member.getPosition())) {
                        Politician politician = new Politician();
                        politician.setName(member.getName());
                        politician.setPosition(member.getPosition());
                        politician.setParty(member.getParty());
                        politician.setState("Federal");  // Cabinet members are federal officials
                        politician.setCounty(null);  // No county for cabinet members
                        politician.setYearsServed(0);  // Default to 0, update if needed
                        politician.setTermLength(4);   // Most cabinet positions are 4-year terms
                        politician.setPhotoUrl(member.getPhotoUrl().equals("N/A") ? null : member.getPhotoUrl());

                        politicians.add(politician);
                    }
                }

                if (!politicians.isEmpty()) {
                    politicianRepository.saveAll(politicians);
                    System.out.println("Added " + politicians.size() + " cabinet members to the database");
                } else {
                    System.out.println("No new cabinet members to add");
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading cabinet_members.json: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Get all cabinet members
     */
    public List<Politician> getAllCabinetMembers() {
        try {
            List<Politician> cabinetMembers = politicianRepository.findByStateAndCountyIsNull("Federal");
            System.out.println("Found " + cabinetMembers.size() + " cabinet members in the database");
            return cabinetMembers;
        } catch (Exception e) {
            System.err.println("Error fetching cabinet members: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * DTO to match the JSON structure of cabinet_members.json
     */
    private static class CabinetMemberDTO {
        private String name;
        private String position;
        private String party;
        private String phone;
        private String email;
        private String website;
        private String photoUrl;

        // Getters and setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPosition() {
            return position;
        }

        public void setPosition(String position) {
            this.position = position;
        }

        public String getParty() {
            return party;
        }

        public void setParty(String party) {
            this.party = party;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getWebsite() {
            return website;
        }

        public void setWebsite(String website) {
            this.website = website;
        }

        public String getPhotoUrl() {
            return photoUrl;
        }

        public void setPhotoUrl(String photoUrl) {
            this.photoUrl = photoUrl;
        }
    }
}
