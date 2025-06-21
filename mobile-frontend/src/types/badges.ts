// src/types/badges.ts
export interface Badge {
  id: string;
  name: string;
  category: string;
}

export interface UserBadges {
  badges: string[]; // Array of badge IDs
}

// Store all available badges
export const availableBadges: Badge[] = [
  // Political Ideologies
  { id: 'conservative', name: 'Conservative', category: 'Political Ideologies' },
  { id: 'liberal', name: 'Liberal', category: 'Political Ideologies' },
  { id: 'progressive', name: 'Progressive', category: 'Political Ideologies' },
  { id: 'libertarian', name: 'Libertarian', category: 'Political Ideologies' },
  { id: 'moderate', name: 'Moderate', category: 'Political Ideologies' },
  { id: 'centrist', name: 'Centrist', category: 'Political Ideologies' },
  { id: 'socialist', name: 'Socialist', category: 'Political Ideologies' },
  { id: 'democratic-socialist', name: 'Democratic Socialist', category: 'Political Ideologies' },
  { id: 'classical-liberal', name: 'Classical Liberal', category: 'Political Ideologies' },
  { id: 'populist', name: 'Populist', category: 'Political Ideologies' },
  { id: 'nationalist', name: 'Nationalist', category: 'Political Ideologies' },
  { id: 'globalist', name: 'Globalist', category: 'Political Ideologies' },
  { id: 'anarchist', name: 'Anarchist', category: 'Political Ideologies' },
  { id: 'constitutionalist', name: 'Constitutionalist', category: 'Political Ideologies' },
  { id: 'federalist', name: 'Federalist', category: 'Political Ideologies' },

  // Economic Positions
  { id: 'free-market', name: 'Free Market', category: 'Economic Positions' },
  { id: 'capitalism', name: 'Capitalism', category: 'Economic Positions' },
  { id: 'regulated-markets', name: 'Regulated Markets', category: 'Economic Positions' },
  { id: 'social-safety-net', name: 'Social Safety Net', category: 'Economic Positions' },
  { id: 'universal-basic-income', name: 'Universal Basic Income', category: 'Economic Positions' },
  { id: 'low-taxes', name: 'Low Taxes', category: 'Economic Positions' },
  { id: 'progressive-taxation', name: 'Progressive Taxation', category: 'Economic Positions' },
  { id: 'balanced-budget', name: 'Balanced Budget', category: 'Economic Positions' },
  { id: 'deficit-spending', name: 'Deficit Spending', category: 'Economic Positions' },
  { id: 'anti-corporate', name: 'Anti-Corporate', category: 'Economic Positions' },
  { id: 'pro-business', name: 'Pro-Business', category: 'Economic Positions' },
  { id: 'pro-labor', name: 'Pro-Labor', category: 'Economic Positions' },
  { id: 'pro-union', name: 'Pro-Union', category: 'Economic Positions' },
  { id: 'trade-protectionist', name: 'Trade Protectionist', category: 'Economic Positions' },
  { id: 'free-trade', name: 'Free Trade', category: 'Economic Positions' },

  // Individual Rights
  { id: 'civil-liberties', name: 'Civil Liberties', category: 'Individual Rights' },
  { id: 'free-speech-advocate', name: 'Free Speech Advocate', category: 'Individual Rights' },
  { id: 'privacy-rights', name: 'Privacy Rights', category: 'Individual Rights' },
  { id: 'freedom-of-religion', name: 'Freedom of Religion', category: 'Individual Rights' },
  { id: 'lgbtq-rights', name: 'LGBTQ+ Rights', category: 'Individual Rights' },
  { id: 'womens-rights', name: 'Women\'s Rights', category: 'Individual Rights' },
  { id: 'disability-rights', name: 'Disability Rights', category: 'Individual Rights' },
  { id: 'voting-rights', name: 'Voting Rights', category: 'Individual Rights' },
  { id: 'digital-rights', name: 'Digital Rights', category: 'Individual Rights' },
  { id: 'workers-rights', name: 'Workers\' Rights', category: 'Individual Rights' },
  { id: 'consumer-rights', name: 'Consumer Rights', category: 'Individual Rights' },

  // Gun Policy
  { id: 'gun-rights', name: 'Gun Rights', category: 'Gun Policy' },
  { id: 'second-amendment', name: 'Second Amendment', category: 'Gun Policy' },
  { id: 'gun-control', name: 'Gun Control', category: 'Gun Policy' },
  { id: 'background-checks', name: 'Background Checks', category: 'Gun Policy' },
  { id: 'gun-safety', name: 'Gun Safety', category: 'Gun Policy' },

  // Healthcare
  { id: 'universal-healthcare', name: 'Universal Healthcare', category: 'Healthcare' },
  { id: 'private-healthcare', name: 'Private Healthcare', category: 'Healthcare' },
  { id: 'medicare-for-all', name: 'Medicare For All', category: 'Healthcare' },
  { id: 'healthcare-reform', name: 'Healthcare Reform', category: 'Healthcare' },
  { id: 'mental-health-advocate', name: 'Mental Health Advocate', category: 'Healthcare' },
  { id: 'pro-vaccine', name: 'Pro-Vaccine', category: 'Healthcare' },
  { id: 'medical-freedom', name: 'Medical Freedom', category: 'Healthcare' },

  // Immigration
  { id: 'border-security', name: 'Border Security', category: 'Immigration' },
  { id: 'path-to-citizenship', name: 'Path to Citizenship', category: 'Immigration' },
  { id: 'daca-supporter', name: 'DACA Supporter', category: 'Immigration' },
  { id: 'merit-based-immigration', name: 'Merit-based Immigration', category: 'Immigration' },
  { id: 'open-borders', name: 'Open Borders', category: 'Immigration' },
  { id: 'immigration-reform', name: 'Immigration Reform', category: 'Immigration' },
  { id: 'refugee-advocate', name: 'Refugee Advocate', category: 'Immigration' },

  // Abortion/Reproductive Rights
  { id: 'pro-choice', name: 'Pro-Choice', category: 'Abortion/Reproductive Rights' },
  { id: 'pro-life', name: 'Pro-Life', category: 'Abortion/Reproductive Rights' },
  { id: 'reproductive-rights', name: 'Reproductive Rights', category: 'Abortion/Reproductive Rights' },
  { id: 'family-planning', name: 'Family Planning', category: 'Abortion/Reproductive Rights' },

  // Environmental Issues
  { id: 'environmentalist', name: 'Environmentalist', category: 'Environmental Issues' },
  { id: 'climate-action', name: 'Climate Action', category: 'Environmental Issues' },
  { id: 'green-energy', name: 'Green Energy', category: 'Environmental Issues' },
  { id: 'conservation', name: 'Conservation', category: 'Environmental Issues' },
  { id: 'sustainability', name: 'Sustainability', category: 'Environmental Issues' },
  { id: 'nuclear-energy', name: 'Nuclear Energy', category: 'Environmental Issues' },
  { id: 'fossil-fuels', name: 'Fossil Fuels', category: 'Environmental Issues' },
  { id: 'public-lands-advocate', name: 'Public Lands Advocate', category: 'Environmental Issues' },

  // Foreign Policy
  { id: 'non-interventionist', name: 'Non-Interventionist', category: 'Foreign Policy' },
  { id: 'multilateralist', name: 'Multilateralist', category: 'Foreign Policy' },
  { id: 'america-first', name: 'America First', category: 'Foreign Policy' },
  { id: 'strong-national-defense', name: 'Strong National Defense', category: 'Foreign Policy' },
  { id: 'diplomatic-solutions', name: 'Diplomatic Solutions', category: 'Foreign Policy' },
  { id: 'peacekeeping', name: 'Peacekeeping', category: 'Foreign Policy' },
  { id: 'anti-war', name: 'Anti-War', category: 'Foreign Policy' },
  { id: 'military-support', name: 'Military Support', category: 'Foreign Policy' },

  // Criminal Justice
  { id: 'criminal-justice-reform', name: 'Criminal Justice Reform', category: 'Criminal Justice' },
  { id: 'police-reform', name: 'Police Reform', category: 'Criminal Justice' },
  { id: 'abolish-police', name: 'Abolish Police', category: 'Criminal Justice' },
  { id: 'tough-on-crime', name: 'Tough On Crime', category: 'Criminal Justice' },
  { id: 'death-penalty-opponent', name: 'Death Penalty Opponent', category: 'Criminal Justice' },
  { id: 'prison-reform', name: 'Prison Reform', category: 'Criminal Justice' },
  { id: 'victims-rights', name: 'Victim\'s Rights', category: 'Criminal Justice' },
  { id: 'rehabilitative-justice', name: 'Rehabilitative Justice', category: 'Criminal Justice' },
  { id: 'legalize-marijuana', name: 'Legalize Marijuana', category: 'Criminal Justice' },
  { id: 'drug-policy-reform', name: 'Drug Policy Reform', category: 'Criminal Justice' },

  // Education
  { id: 'public-education', name: 'Public Education', category: 'Education' },
  { id: 'school-choice', name: 'School Choice', category: 'Education' },
  { id: 'student-loan-forgiveness', name: 'Student Loan Forgiveness', category: 'Education' },
  { id: 'free-college', name: 'Free College', category: 'Education' },
  { id: 'educational-equity', name: 'Educational Equity', category: 'Education' },
  { id: 'stem-education', name: 'STEM Education', category: 'Education' },
  { id: 'arts-education', name: 'Arts Education', category: 'Education' },
  { id: 'homeschooling', name: 'Homeschooling', category: 'Education' },
  { id: 'teacher-support', name: 'Teacher Support', category: 'Education' },

  // Political Reform
  { id: 'campaign-finance-reform', name: 'Campaign Finance Reform', category: 'Political Reform' },
  { id: 'term-limits', name: 'Term Limits', category: 'Political Reform' },
  { id: 'anti-gerrymandering', name: 'Anti-Gerrymandering', category: 'Political Reform' },
  { id: 'electoral-college-reform', name: 'Electoral College Reform', category: 'Political Reform' },
  { id: 'ranked-choice-voting', name: 'Ranked Choice Voting', category: 'Political Reform' },
  { id: 'transparency-in-government', name: 'Transparency in Government', category: 'Political Reform' },
  { id: 'anti-corruption', name: 'Anti-Corruption', category: 'Political Reform' },

  // Misc Policy Areas
  { id: 'rural-development', name: 'Rural Development', category: 'Misc Policy Areas' },
  { id: 'urban-development', name: 'Urban Development', category: 'Misc Policy Areas' },
  { id: 'housing-justice', name: 'Housing Justice', category: 'Misc Policy Areas' },
  { id: 'indigenous-rights', name: 'Indigenous Rights', category: 'Misc Policy Areas' },
  { id: 'veterans-affairs', name: 'Veteran\'s Affairs', category: 'Misc Policy Areas' },
  { id: 'space-exploration', name: 'Space Exploration', category: 'Misc Policy Areas' },
  { id: 'science-technology', name: 'Science & Technology', category: 'Misc Policy Areas' },
  { id: 'agricultural-policy', name: 'Agricultural Policy', category: 'Misc Policy Areas' },
  { id: 'tax-reform', name: 'Tax Reform', category: 'Misc Policy Areas' },
  { id: 'transportation', name: 'Transportation', category: 'Misc Policy Areas' },
  { id: 'infrastructure-investment', name: 'Infrastructure Investment', category: 'Misc Policy Areas' },

  // Values & Ethics
  { id: 'faith-based-values', name: 'Faith-based Values', category: 'Values & Ethics' },
  { id: 'secular-government', name: 'Secular Government', category: 'Values & Ethics' },
  { id: 'traditional-values', name: 'Traditional Values', category: 'Values & Ethics' },
  { id: 'progressive-values', name: 'Progressive Values', category: 'Values & Ethics' },
  { id: 'family-values', name: 'Family Values', category: 'Values & Ethics' },
  { id: 'personal-liberty', name: 'Personal Liberty', category: 'Values & Ethics' },
  { id: 'social-responsibility', name: 'Social Responsibility', category: 'Values & Ethics' },
  { id: 'community-oriented', name: 'Community-Oriented', category: 'Values & Ethics' },
  { id: 'evidence-based-policy', name: 'Evidence-Based Policy', category: 'Values & Ethics' },
];

// Helper to get all unique categories
export const getCategories = (): string[] => {
  const categories = new Set<string>();
  availableBadges.forEach(badge => categories.add(badge.category));
  return Array.from(categories);
};

// Helper to get badges by category
export const getBadgesByCategory = (category: string): Badge[] => {
  return availableBadges.filter(badge => badge.category === category);
};

// Helper to get a badge by ID
export const getBadgeById = (id: string): Badge | undefined => {
  return availableBadges.find(badge => badge.id === id);
};