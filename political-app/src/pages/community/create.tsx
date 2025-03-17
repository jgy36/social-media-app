// pages/community/create.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Navbar from '@/components/navbar/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Check, Info } from 'lucide-react';

// Form validation helper
type ValidationErrors = {
  name?: string;
  description?: string;
  rules?: string;
};

const CreateCommunityPage = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Redirect to login if not authenticated
  if (typeof window !== 'undefined' && !isAuthenticated) {
    router.push('/login?redirect=' + encodeURIComponent('/community/create'));
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    } else if (name.length > 21) {
      newErrors.name = 'Community name must be less than 22 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      newErrors.name = 'Only letters, numbers, and underscores are allowed';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Community description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    if (rules.length > 1000) {
      newErrors.rules = 'Rules must be less than 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to create the community
      // For now, let's just show a success message
      
      // Create community object 
      const newCommunity = {
        id: name.toLowerCase(),
        name,
        description,
        rules: rules.split('\n').filter(rule => rule.trim().length > 0),
        members: 1,
        created: new Date().toISOString(),
        moderators: [user.username || 'Anonymous'],
      };
      
      // Show success state and redirect after a delay
      setShowSuccessAlert(true);
      
      setTimeout(() => {
        router.push(`/community/${newCommunity.id}`);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create a Community</h1>
          <p className="text-muted-foreground">
            Create a community to gather people around a shared interest or topic
          </p>
        </div>
        
        {showSuccessAlert && (
          <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300">
            <Check className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your community has been created. Redirecting you now...
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="shadow-md">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Community Details</CardTitle>
              <CardDescription>
                Fill out the information below to create your community
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Community Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Community Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. PoliticsDiscussion"
                    maxLength={21}
                    className={errors.name ? "border-destructive" : ""}
                    disabled={isCreating}
                  />
                  {!errors.name && name && (
                    <div className="absolute right-3 top-3 text-sm text-muted-foreground">
                      {21 - name.length} characters left
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Community names cannot be changed once created
                </p>
              </div>
              
              {/* Community Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is your community about?"
                  className={errors.description ? "border-destructive" : ""}
                  disabled={isCreating}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This will be displayed on your community page
                </p>
              </div>
              
              {/* Community Rules */}
              <div className="space-y-2">
                <Label htmlFor="rules" className="text-base">
                  Community Rules (Optional)
                </Label>
                <Textarea
                  id="rules"
                  value={rules}
                  onChange={e => setRules(e.target.value)}
                  placeholder="Enter one rule per line"
                  className={errors.rules ? "border-destructive" : ""}
                  disabled={isCreating}
                  rows={5}
                />
                {errors.rules && (
                  <p className="text-sm text-destructive">{errors.rules}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter one rule per line. You can edit these later.
                </p>
              </div>
              
              {/* Community Type */}
              <div className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-medium">Community Type</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose whether your community is public or private
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant={isPrivate ? "outline" : "default"}
                      className="mr-2"
                      onClick={() => setIsPrivate(false)}
                      disabled={isCreating}
                    >
                      Public
                    </Button>
                    <Button
                      type="button"
                      variant={!isPrivate ? "outline" : "default"}
                      onClick={() => setIsPrivate(true)}
                      disabled={isCreating || true} // Disabled for demo
                    >
                      Private
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 rounded-md bg-muted p-3">
                  <div className="flex">
                    <Info className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {isPrivate 
                        ? "Private communities are only visible to approved members."
                        : "Anyone can view, post, and comment in public communities."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/community')}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Create Community
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateCommunityPage;