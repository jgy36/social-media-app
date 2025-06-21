// pages/oauth-connect-success.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

const OAuthConnectSuccessPage = () => {
  const router = useRouter();
  const { provider } = router.query;
  
  useEffect(() => {
    // Try to communicate with parent window and close
    if (window.opener && provider) {
      try {
        // Attempt to postMessage to parent
        window.opener.postMessage({
          type: 'oauth-connect-success', 
          provider
        }, window.location.origin);
        
        // Close the popup after a short delay
        setTimeout(() => window.close(), 1000);
      } catch (err) {
        console.error('Error communicating with parent window:', err);
      }
    }
  }, [provider]);
  
  const handleClose = () => {
    // If window.close doesn't work (due to browser security)
    // Navigate back to settings
    if (window.opener) {
      window.close();
    } else {
      router.push('/settings?tab=account');
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Account Connected!</h1>
        <p className="mb-6">
          Your {provider} account has been connected successfully.
        </p>
        <Button onClick={handleClose}>
          Close Window
        </Button>
      </div>
    </div>
  );
};

export default OAuthConnectSuccessPage;