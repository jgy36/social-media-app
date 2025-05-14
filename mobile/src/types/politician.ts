// src/types/politician.ts
export interface Politician {
  id: number;
  name: string;
  party: string;
  state: string;
  county: string | null;
  yearsServed: number;
  position: string;
  termLength: number;
  photoUrl: string | null;
  // Additional fields to match web version
  age?: number;
  website?: string;
  email?: string;
  phone?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  bio?: string;
}