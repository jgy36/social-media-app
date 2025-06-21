// src/components/profile/FollowRequests.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/apiClient';

interface FollowRequest {
  id: number;
  userId: number;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  requestedAt: string;
}

const FollowRequests = () => {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const fetchFollowRequests = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<FollowRequest[]>('/follow/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching follow requests:', error);
      setError('Failed to load follow requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      await apiClient.post(`/follow/requests/${requestId}/approve`);
      
      // Update local state by removing the approved request
      setRequests(prev => prev.filter(request => request.id !== requestId));
      
      toast({
        title: "Follow request approved",
        description: "This user can now see your posts and activity",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error approving follow request:', error);
      toast({
        title: "Error",
        description: "Failed to approve follow request",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await apiClient.post(`/follow/requests/${requestId}/reject`);
      
      // Update local state by removing the rejected request
      setRequests(prev => prev.filter(request => request.id !== requestId));
      
      toast({
        title: "Follow request rejected",
        description: "This user won't be able to see your posts",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error rejecting follow request:', error);
      toast({
        title: "Error",
        description: "Failed to reject follow request",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const navigateToProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follow Requests</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follow Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Follow Requests
          {requests.length > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 ml-2 text-xs font-semibold text-white bg-primary rounded-full">
              {requests.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No pending follow requests</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigateToProfile(request.username)}
                >
                  <Avatar>
                    <AvatarImage 
                      src={request.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.username}`} 
                      alt={request.username} 
                    />
                    <AvatarFallback>
                      {request.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.displayName || request.username}</p>
                    <p className="text-sm text-muted-foreground">@{request.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleApprove(request.id)}
                    className="flex items-center gap-1"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Approve</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReject(request.id)}
                    className="flex items-center gap-1"
                  >
                    <UserX className="h-4 w-4" />
                    <span className="hidden sm:inline">Reject</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowRequests;