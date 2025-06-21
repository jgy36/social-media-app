// components/ImageTest.tsx - Use this to verify image loading
import React from 'react';

const BACKEND_URL = "http://localhost:8080";

const ImageTest = () => {
  const imagePath = "/images/tulsi_gabbard.jpg";
  const fullUrl = `${BACKEND_URL}${imagePath}`;
  
  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Image Loading Test</h2>
      
      <div className="mb-6">
        <h3 className="font-bold">Backend Image</h3>
        <p className="mb-2">Image URL: {fullUrl}</p>
        <img 
          src={fullUrl} 
          alt="Backend Test" 
          className="h-24 w-24 object-cover rounded-full border"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://via.placeholder.com/100";
            console.error(`Failed to load image from ${fullUrl}`);
          }}
        />
      </div>
      
      <div className="mb-6">
        <h3 className="font-bold">Direct Fetch Test</h3>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={async () => {
            try {
              const response = await fetch(fullUrl);
              const contentType = response.headers.get('content-type');
              console.log(`Response status: ${response.status}`);
              console.log(`Content-Type: ${contentType}`);
              console.log(`Response OK: ${response.ok}`);
              
              if (response.ok) {
                alert(`✅ Image accessible! Content-Type: ${contentType}`);
              } else {
                alert(`❌ Image not accessible. Status: ${response.status}`);
              }
            } catch (error) {
              console.error('Error fetching image:', error);
              alert(`❌ Error fetching image: ${error instanceof Error ? error.message : String(error)}`);
            }
          }}
        >
          Test Image URL
        </button>
      </div>
    </div>
  );
};

export default ImageTest;