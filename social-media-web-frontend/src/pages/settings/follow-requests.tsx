// Create src/pages/settings/follow-requests.tsx
import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { getFollowRequests } from '@/api/followRequests';
import Navbar from '@/components/navbar/Navbar';
import FollowRequests from '@/components/profile/FollowRequest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const FollowRequestsPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequests, setHasRequests] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkFollowRequests = async () => {
      try {
        const requests = await getFollowRequests();
        setHasRequests(requests.length > 0);
      } catch (error) {
        console.error('Error checking follow requests:', error);
        toast({
          title: 'Error',
          description: 'Could not check follow requests',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkFollowRequests();
  }, [toast]);

  return (
    <>
      <Head>
        <title>Follow Requests | Political App</title>
      </Head>
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Follow Requests</h1>
        
        <FollowRequests />

        {!isLoading && !hasRequests && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>No Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                When someone requests to follow your private account, their requests will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default FollowRequestsPage;