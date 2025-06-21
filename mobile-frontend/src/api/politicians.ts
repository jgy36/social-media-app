// src/api/politicians.ts
import axios from 'axios';
import { BASE_URL } from './apiClient';
import { Politician } from '@/types/politician';

/**
 * Get all politicians
 */
export const getAllPoliticians = async (): Promise<Politician[]> => {
  try {
    // Use regular axios without auth for public endpoints
    const response = await axios.get<Politician[]>(`${BASE_URL}/politicians`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all politicians:', error);
    return [];
  }
};

/**
 * Get cabinet members
 */
export const getCabinetMembers = async (): Promise<Politician[]> => {
  try {
    const response = await axios.get<Politician[]>(`${BASE_URL}/politicians/cabinet`);
    
    // Ensure consistent party naming for styling
    const formattedCabinet = response.data.map((politician) => {
      let standardizedParty = politician.party;

      if (politician.party) {
        const partyLower = politician.party.toLowerCase();
        if (partyLower.includes('republican')) {
          standardizedParty = 'Republican Party';
        } else if (partyLower.includes('democrat')) {
          standardizedParty = 'Democratic Party';
        } else if (partyLower.includes('independent')) {
          standardizedParty = 'Independent';
        }
      }

      return {
        ...politician,
        party: standardizedParty || 'Unknown',
      };
    });

    return formattedCabinet;
  } catch (error) {
    console.error('Error fetching cabinet members:', error);
    return [];
  }
};

/**
 * Get a single politician by ID
 */
export const getPoliticianById = async (id: string): Promise<Politician | null> => {
  try {
    const response = await axios.get<Politician>(`${BASE_URL}/politicians/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching politician with ID ${id}:`, error);
    return null;
  }
};

/**
 * Get politicians by county
 */
export const getPoliticiansByCounty = async (county: string, state: string): Promise<Politician[]> => {
  try {
    // Format the county name to match the database format
    const formattedCounty = county.toLowerCase().endsWith(' county')
      ? county
      : `${county} County`;

    const endpoint = `/politicians/county/${encodeURIComponent(formattedCounty)}/${encodeURIComponent(state)}`;
    
    const response = await axios.get<Politician[]>(`${BASE_URL}${endpoint}`);
    
    // Special case for Anchorage, Alaska which has a different format
    if ((!response.data || response.data.length === 0) && county === 'Anchorage' && state === 'Alaska') {
      const anchorageEndpoint = `/politicians/county/${encodeURIComponent('Anchorage, Municipality of')}/${encodeURIComponent(state)}`;
      
      const specialResponse = await axios.get<Politician[]>(`${BASE_URL}${anchorageEndpoint}`);
      return specialResponse.data || [];
    }

    return response.data || [];
  } catch (error) {
    console.error(`Error fetching politicians for ${county}, ${state}:`, error);
    return [];
  }
};

/**
 * Get politicians by state
 */
export const getPoliticiansByState = async (state: string): Promise<Politician[]> => {
  try {
    const endpoint = `/politicians/state/${encodeURIComponent(state)}`;
    
    const response = await axios.get<Politician[]>(`${BASE_URL}${endpoint}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching politicians for state ${state}:`, error);
    return [];
  }
};

/**
 * Get all relevant politicians for a county (both county and state level)
 */
export const getAllRelevantPoliticians = async (
  county: string,
  state: string
): Promise<Politician[]> => {
  try {
    // Get county-specific politicians
    const countyPoliticians = await getPoliticiansByCounty(county, state);
    
    // Get state-level politicians
    const statePoliticians = await getPoliticiansByState(state);
    
    // Combine both lists with county politicians first
    return [...countyPoliticians, ...statePoliticians];
  } catch (error) {
    console.error(`Error fetching relevant politicians for ${county}, ${state}:`, error);
    return [];
  }
};