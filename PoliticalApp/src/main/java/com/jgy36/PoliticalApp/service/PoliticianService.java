package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Politician;
import com.jgy36.PoliticalApp.repository.PoliticianRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PoliticianService {

    private final PoliticianRepository politicianRepository;

    public PoliticianService(PoliticianRepository politicianRepository) {
        this.politicianRepository = politicianRepository;
    }

    public List<Politician> getAllPoliticians() {
        return politicianRepository.findAll();
    }

    public Optional<Politician> getPoliticianById(Long id) {
        return politicianRepository.findById(id);
    }

    public Politician addPolitician(Politician politician) {
        return politicianRepository.save(politician);
    }

    public void deletePolitician(Long id) {
        politicianRepository.deleteById(id);
    }

    public List<Politician> findByParty(String party) {
        return politicianRepository.findByParty(party);
    }

    public List<Politician> findByState(String state) {
        return politicianRepository.findByState(state);
    }

    public List<Politician> findByPosition(String position) {
        return politicianRepository.findByPosition(position);
    }
}
