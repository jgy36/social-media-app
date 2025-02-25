package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Politician;
import com.jgy36.PoliticalApp.repository.PoliticianRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class CivicApiService {

    private final PoliticianRepository politicianRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String API_URL = "https://www.googleapis.com/civicinfo/v2/representatives";
    @Value("${API_KEY}")
    private String apiKey;

    public CivicApiService(PoliticianRepository politicianRepository) {
        this.politicianRepository = politicianRepository;
    }

    public void fetchAndSavePoliticians(String address) {
        String url = UriComponentsBuilder.fromHttpUrl(API_URL)
                .queryParam("address", address)
                .queryParam("key", apiKey)
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response != null && response.containsKey("officials") && response.containsKey("offices")) {
            List<Map<String, Object>> officials = (List<Map<String, Object>>) response.get("officials");
            List<Map<String, Object>> offices = (List<Map<String, Object>>) response.get("offices");

            for (int i = 0; i < officials.size(); i++) {
                Map<String, Object> official = officials.get(i);
                String name = (String) official.get("name");
                String party = (String) official.getOrDefault("party", "Unknown");
                String photoUrl = (String) official.getOrDefault("photoUrl", "");
                String state = address.split(",")[1].trim();

                String position = "Unknown";
                for (Map<String, Object> office : offices) {
                    List<Integer> indices = (List<Integer>) office.get("officialIndices");
                    if (indices.contains(i)) {
                        position = (String) office.get("name");
                        break;
                    }
                }

                // Check if the politician already exists
                if (!politicianRepository.existsByName(name)) {
                    Politician politician = new Politician();
                    politician.setName(name);
                    politician.setParty(party);
                    politician.setState(state);
                    politician.setPosition(position);
                    politician.setPhotoUrl(photoUrl);
                    politician.setYearsServed(0);
                    politician.setTermLength(0);

                    politicianRepository.save(politician);
                }
            }
        }
    }
}
