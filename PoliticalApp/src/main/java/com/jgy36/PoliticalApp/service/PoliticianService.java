package com.jgy36.PoliticalApp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jgy36.PoliticalApp.dto.PoliticianApiResponse;
import com.jgy36.PoliticalApp.entity.Politician;
import com.jgy36.PoliticalApp.repository.PoliticianRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.InputStream;
import java.util.*;

@Service
public class PoliticianService {

    private final PoliticianRepository politicianRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String BASE_URL = "https://www.googleapis.com/civicinfo/v2/representatives";

    // List of positions to exclude (state and national politicians)
    private final Set<String> excludedPositions = new HashSet<>(Arrays.asList(
            "President of the United States",
            "Vice President of the United States",
            "U.S. Senator",
            "U.S. Representative",
            "Governor",
            "Lieutenant Governor",
            "State Attorney General",
            "State Commissioner",
            "State Treasurer",
            "State Auditor",
            "Secretary of State",
            "State Supreme Court",
            "State Public Service Commissioner"
    ));

    @Value("${google.api.key}")
    private String apiKey;

    public PoliticianService(PoliticianRepository politicianRepository, ObjectMapper objectMapper) {
        this.politicianRepository = politicianRepository;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public void fetchAndStoreAllCounties() {
        try {
            InputStream inputStream = new ClassPathResource("data/counties_list.json").getInputStream();
            List<Map<String, String>> counties = objectMapper.readValue(inputStream, new TypeReference<>() {
            });

            // Get list of counties we already have
            List<Object[]> existingCounties = politicianRepository.findAllStoredCounties();
            Set<String> processedCounties = new HashSet<>();

            for (Object[] countyData : existingCounties) {
                String county = (String) countyData[0];
                String state = (String) countyData[1];
                processedCounties.add(state + "-" + county);
            }

            System.out.println("🔍 Already processed " + processedCounties.size() + " counties");

            int processedCount = 0;
            for (Map<String, String> countyEntry : counties) {
                String county = countyEntry.get("County");
                String state = countyEntry.get("State");

                if (county != null && state != null) {
                    // Skip if we already have this county
                    if (processedCounties.contains(state + "-" + county)) {
                        System.out.println("⏩ Skipping already processed: " + county + ", " + state);
                        continue;
                    }

                    fetchAndStorePoliticiansByCounty(state, county);
                    processedCount++;
                    System.out.println("📊 Progress: Processed " + processedCount + " new counties");
                    Thread.sleep(3000); // Prevent rate-limiting
                }
            }
            System.out.println("✅ Completed processing " + processedCount + " new counties");
        } catch (Exception e) {
            System.err.println("❌ Error fetching all counties: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void fetchAndStorePoliticiansByCounty(String state, String county) {
        try {
            // Clean up county name and ensure proper formatting
            String cleanCounty = county.replaceAll("\\s+County$", "").trim();
            String address = cleanCounty + " County, " + state + ", USA";

            // Build URL without manual encoding
            String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("address", address) // Let UriComponentsBuilder handle encoding
                    .queryParam("key", apiKey)
                    .build()
                    .toUriString();

            System.out.println("🔍 Fetching county: " + address);

            // First get the raw response to inspect
            String rawResponse = restTemplate.getForObject(url, String.class);

            // Check if response contains county divisions
            boolean hasCountyDivisions = rawResponse.contains("/county:" + cleanCounty.toLowerCase());

            if (!hasCountyDivisions) {
                System.out.println("⚠️ No county divisions found in response for " + address + ". Trying alternative format...");

                // Try alternative format with state abbrev
                String stateAbbrev = getStateAbbreviation(state);
                address = cleanCounty + " County, " + stateAbbrev + ", USA";
                url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                        .queryParam("address", address)
                        .queryParam("key", apiKey)
                        .build()
                        .toUriString();

                System.out.println("🔄 Retrying with: " + address);
                rawResponse = restTemplate.getForObject(url, String.class);
                hasCountyDivisions = rawResponse.contains("/county:" + cleanCounty.toLowerCase());
            }

            if (!hasCountyDivisions) {
                System.out.println("❌ No county divisions found after retries for " + county + ", " + state);
                return;
            }

            // Parse the response
            PoliticianApiResponse response = objectMapper.readValue(rawResponse, PoliticianApiResponse.class);

            if (response == null || response.getOfficials() == null || response.getOfficials().isEmpty()) {
                System.err.println("⚠️ No officials found for " + county + ", " + state);
                return;
            }

            // Find the county division ID
            String countyDivisionPrefix = "ocd-division/country:us/state:" +
                    getStateAbbreviation(state).toLowerCase() + "/county:" + cleanCounty.toLowerCase();

            Set<Integer> countyOfficeIndices = new HashSet<>();

            // Get all office indices for the county level
            if (response.getDivisions() != null) {
                for (Map.Entry<String, PoliticianApiResponse.Division> entry : response.getDivisions().entrySet()) {
                    if (entry.getKey().startsWith(countyDivisionPrefix)) {
                        PoliticianApiResponse.Division division = entry.getValue();
                        if (division.getOfficeIndices() != null) {
                            countyOfficeIndices.addAll(division.getOfficeIndices());
                        }
                    }
                }
            }

            // If no county offices found, log and return
            if (countyOfficeIndices.isEmpty()) {
                System.out.println("⚠️ No county-level offices found for " + county + ", " + state);
                return;
            }

            System.out.println("✅ Found " + countyOfficeIndices.size() + " county-level offices for " + county + ", " + state);

            // Collect all official indices for county offices
            Set<Integer> countyOfficialIndices = new HashSet<>();
            for (Integer officeIndex : countyOfficeIndices) {
                if (officeIndex < response.getOffices().size()) {
                    PoliticianApiResponse.Office office = response.getOffices().get(officeIndex);
                    if (office.getOfficialIndices() != null) {
                        countyOfficialIndices.addAll(office.getOfficialIndices());
                    }
                }
            }

            int localPoliticiansFound = 0;

            // Save only the county-level officials
            for (Integer officialIndex : countyOfficialIndices) {
                if (officialIndex < response.getOfficials().size()) {
                    PoliticianApiResponse.Official official = response.getOfficials().get(officialIndex);

                    // Find the position for this official
                    String position = "County Official";
                    for (Integer officeIndex : countyOfficeIndices) {
                        PoliticianApiResponse.Office office = response.getOffices().get(officeIndex);
                        if (office.getOfficialIndices() != null &&
                                office.getOfficialIndices().contains(officialIndex)) {
                            position = office.getName();
                            break;
                        }
                    }

                    boolean saved = savePolitician(official, state, county, position);
                    if (saved) {
                        localPoliticiansFound++;
                    }
                }
            }

            System.out.println("📊 County summary: " + county + ", " + state +
                    " - Found and saved " + localPoliticiansFound + " county officials");

        } catch (Exception e) {
            System.err.println("❌ Error fetching " + county + ", " + state + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Helper method to get state abbreviation
    private String getStateAbbreviation(String stateName) {
        Map<String, String> stateMap = new HashMap<>();
        stateMap.put("Alabama", "AL");
        stateMap.put("Alaska", "AK");
        stateMap.put("Arizona", "AZ");
        stateMap.put("Arkansas", "AR");
        stateMap.put("California", "CA");
        stateMap.put("Colorado", "CO");
        stateMap.put("Connecticut", "CT");
        stateMap.put("Delaware", "DE");
        stateMap.put("Florida", "FL");
        stateMap.put("Georgia", "GA");
        stateMap.put("Hawaii", "HI");
        stateMap.put("Idaho", "ID");
        stateMap.put("Illinois", "IL");
        stateMap.put("Indiana", "IN");
        stateMap.put("Iowa", "IA");
        stateMap.put("Kansas", "KS");
        stateMap.put("Kentucky", "KY");
        stateMap.put("Louisiana", "LA");
        stateMap.put("Maine", "ME");
        stateMap.put("Maryland", "MD");
        stateMap.put("Massachusetts", "MA");
        stateMap.put("Michigan", "MI");
        stateMap.put("Minnesota", "MN");
        stateMap.put("Mississippi", "MS");
        stateMap.put("Missouri", "MO");
        stateMap.put("Montana", "MT");
        stateMap.put("Nebraska", "NE");
        stateMap.put("Nevada", "NV");
        stateMap.put("New Hampshire", "NH");
        stateMap.put("New Jersey", "NJ");
        stateMap.put("New Mexico", "NM");
        stateMap.put("New York", "NY");
        stateMap.put("North Carolina", "NC");
        stateMap.put("North Dakota", "ND");
        stateMap.put("Ohio", "OH");
        stateMap.put("Oklahoma", "OK");
        stateMap.put("Oregon", "OR");
        stateMap.put("Pennsylvania", "PA");
        stateMap.put("Rhode Island", "RI");
        stateMap.put("South Carolina", "SC");
        stateMap.put("South Dakota", "SD");
        stateMap.put("Tennessee", "TN");
        stateMap.put("Texas", "TX");
        stateMap.put("Utah", "UT");
        stateMap.put("Vermont", "VT");
        stateMap.put("Virginia", "VA");
        stateMap.put("Washington", "WA");
        stateMap.put("West Virginia", "WV");
        stateMap.put("Wisconsin", "WI");
        stateMap.put("Wyoming", "WY");
        stateMap.put("District of Columbia", "DC");

        return stateMap.getOrDefault(stateName, stateName); // Return the abbreviation or the original name if not found
    }

    private boolean isStateOrNationalPosition(String position) {
        if (position == null) return false;

        // Check for exact matches
        for (String excluded : excludedPositions) {
            if (position.contains(excluded)) {
                return true;
            }
        }

        // Check for state-level positions
        return position.startsWith("State ") ||
                position.contains(" of ") && position.contains("State") ||
                position.contains("Governor") ||
                position.contains("Senator") ||
                position.contains("Representative") && !position.contains("County");
    }

    private boolean savePolitician(PoliticianApiResponse.Official official, String state, String county, String position) {
        try {
            // Skip if county is null
            if (county == null || county.isEmpty()) {
                System.out.println("⚠️ Skipping politician (no county): " + official.getName());
                return false;
            }

            // Skip state/national politicians based on position
            if (isStateOrNationalPosition(position)) {
                System.out.println("⏩ Skipping state/national position: " + official.getName() + " - " + position);
                return false;
            }

            // Skip if already exists
            if (politicianRepository.existsByNameAndStateAndCounty(official.getName(), state, county)) {
                System.out.println("⚠️ Politician already exists: " + official.getName() + " in " + county + ", " + state);
                return false;
            }

            // Create and save the politician
            Politician politician = new Politician();
            politician.setName(official.getName());
            politician.setParty(official.getParty() != null ? official.getParty() : "Unknown");
            politician.setState(state);
            politician.setCounty(county);
            politician.setPosition(position);
            politician.setYearsServed(0);
            politician.setTermLength(0);
            politician.setPhotoUrl(official.getPhotoUrl());

            politicianRepository.save(politician);
            System.out.println("✅ Saved local politician: " + official.getName() + " - " + position + " in " + county + ", " + state);
            return true;

        } catch (Exception e) {
            System.err.println("❌ Error saving politician " + official.getName() + ": " + e.getMessage());
            return false;
        }
    }
}
