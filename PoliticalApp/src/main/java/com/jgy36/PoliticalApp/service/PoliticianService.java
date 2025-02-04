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

    public Politician updatePolitician(Long id, Politician updatedPolitician) {
        Optional<Politician> existingPoliticianOpt = politicianRepository.findById(id);
        if (existingPoliticianOpt.isEmpty()) {
            throw new IllegalArgumentException("Politician with ID " + id + " not found.");
        }

        Politician existingPolitician = existingPoliticianOpt.get();
        existingPolitician.setName(updatedPolitician.getName());
        existingPolitician.setParty(updatedPolitician.getParty());
        existingPolitician.setState(updatedPolitician.getState());
        existingPolitician.setPosition(updatedPolitician.getPosition());
        existingPolitician.setYearsServed(updatedPolitician.getYearsServed());
        existingPolitician.setTermLength(updatedPolitician.getTermLength());

        return politicianRepository.save(existingPolitician);
    }

}
