// pages/community/create.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import Navbar from '@/components/navbar/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Check, Info } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Form validation helper
type ValidationErrors = {
  id?: string;
  name?: string;
  description?: string;
  rules?: string;
};

const CreateCommunityPage = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;
  
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [color, setColor] = useState('#3b82f6'); // Default blue color
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Redirect to login if not authenticated
  if (typeof window !== 'undefined' && !isAuthenticated) {
    router.push('/login?redirect=' + encodeURIComponent('/community/create'));
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!id.trim()) {
      newErrors.id = 'Community ID is required';
    } else if (id.length < 3) {
      newErrors.id = 'Community ID must be at least 3 characters';
    } else if (id.length > 30) {
      newErrors.id = 'Community ID must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      newErrors.id = 'Only letters, numbers, underscores and hyphens are allowed';
    }
    
    if (!name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    } else if (name.length > 50) {
      newErrors.name = 'Community name must be less than 50 characters';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Create community object
      const newCommunity = {
        id,
        name,
        description,
        rules: rules.split('\n').filter(rule => rule.trim().length > 0),
        color
      };
      
      // Send to backend
      const response = await axios.post(
        `${API_BASE_URL}/communities`, 
        newCommunity,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Show success alert
      setShowSuccessAlert(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push(`/community/${response.data.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating community:', error);
      
      // Handle API errors
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          setErrors(prev => ({
            ...prev,
            id: 'Community ID already exists. Please choose another one.'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: `Error: ${error.response?.data?.error || 'Failed to create community'}`
          }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'An unexpected error occurred. Please try again.'
        }));
      }
      
      setIsCreating(false);
    }
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
        
        {errors.general && (
          <Alert className="mb-6 bg-destructive/20 text-destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errors.general}</AlertDescription>
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
              {/* Community ID */}
              <div className="space-y-2">
                <Label htmlFor="id" className="text-base">
                  Community ID
                </Label>
                <div className="relative">
                  <Input
                    id="id"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    placeholder="e.g. political-discussion"
                    maxLength={30}
                    className={errors.id ? "border-destructive" : ""}
                    disabled={isCreating}
                  />
                  {!errors.id && id && (
                    <div className="absolute right-3 top-3 text-sm text-muted-foreground">
                      {30 - id.length} characters left
                    </div>
                  )}
                </div>
                {errors.id && (
                  <p className="text-sm text-destructive">{errors.id}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This will be used in your community URL: /community/{id || 'example'}
                </p>
              </div>
              
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
                    placeholder="e.g. Political Discussion"
                    maxLength={50}
                    className={errors.name ? "border-destructive" : ""}
                    disabled={isCreating}
                  />
                  {!errors.name && name && (
                    <div className="absolute right-3 top-3 text-sm text-muted-foreground">
                      {50 - name.length} characters left
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Display name for your community
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
              
              {/* Community Color */}
              <div className="space-y-2">
                <Label htmlFor="color" className="text-base">
                  Community Color
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-20 h-10 p-1"
                    disabled={isCreating}
                  />
                  <div 
                    className="w-full h-10 rounded-md"
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose a theme color for your community
                </p>
              </div>
              
              <div className="rounded-md border border-border p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    By creating a community, you agree to moderate it according to platform guidelines.
                    You&apos;ll automatically become its first member and moderator.
                  </p>
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