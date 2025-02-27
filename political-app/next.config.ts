// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // Wikipedia domains
      'upload.wikimedia.org',
      'commons.wikimedia.org',
      
      // Placeholder services
      'via.placeholder.com',
      
      // Government domains
      'www.cookcountyil.gov',
      'www.cook-county.org',
      'cookcountyil.gov',
      
      // Add other domains as needed when you encounter them
      // Common political photo sources
      'www.house.gov',
      'www.senate.gov',
      'www.whitehouse.gov',
      'www.state.gov',
      'www.nga.org', // National Governors Association
      'www.congress.gov',
    ],
    // Optional: Add a safety fallback if you're using many dynamic domains
    // This can be removed if you only use a specific set of domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.gov',
      },
      {
        protocol: 'https',
        hostname: '**.gov.us',
      },
      {
        protocol: 'https',
        hostname: '**.state.**.us',
      },
    ],
  },
};

module.exports = nextConfig;