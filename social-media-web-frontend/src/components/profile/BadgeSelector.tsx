// src/components/profile/BadgeSelector.tsx
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setBadges } from '@/redux/slices/badgeSlice';
import { saveUserBadges } from '@/api/badges';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { availableBadges, getCategories, getBadgesByCategory } from '@/types/badges';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BadgeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBadges: string[];
}

const BadgeSelector: React.FC<BadgeSelectorProps> = ({ isOpen, onClose, selectedBadges: initialSelectedBadges }) => {
  const dispatch = useDispatch<AppDispatch>();
  const categories = getCategories();
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Initialize selected badges when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBadges(initialSelectedBadges || []);
      setErrorMessage(null);
    }
  }, [isOpen, initialSelectedBadges]);
  
  // Toggle badge selection
  const toggleBadge = (badgeId: string) => {
    setSelectedBadges(prev => {
      // If already selected, remove it
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      }
      
      // If we're at the max limit, show error and don't add
      if (prev.length >= 10) {
        setErrorMessage('You can select a maximum of 10 badges.');
        return prev;
      }
      
      // Clear error if there was one
      setErrorMessage(null);
      
      // Add the new badge
      return [...prev, badgeId];
    });
  };
  
  // Save selected badges
  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Save to server (mock API for now)
      const result = await saveUserBadges(selectedBadges);
      
      if (result.success) {
        // Update Redux store
        dispatch(setBadges(selectedBadges));
        onClose();
      } else {
        setErrorMessage('Failed to save badges. Please try again.');
      }
    } catch (error) {
      console.error('Error saving badges:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Your Political Position Badges</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Choose up to 10 badges that represent your political positions and values.
          </p>
        </DialogHeader>
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm">
            <span className="font-medium">{selectedBadges.length}</span> of <span className="font-medium">10</span> badges selected
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedBadges([])}
            disabled={selectedBadges.length === 0 || isSubmitting}
          >
            Clear All
          </Button>
        </div>
        
        {selectedBadges.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Selected Badges:</div>
            <div className="flex flex-wrap gap-2">
              {selectedBadges.map(badgeId => {
                const badge = availableBadges.find(b => b.id === badgeId);
                if (!badge) return null;
                
                return (
                  <Badge 
                    key={badgeId} 
                    variant="default"
                    className="cursor-pointer pr-2 flex items-center gap-1 hover:bg-primary/80"
                    onClick={() => toggleBadge(badgeId)}
                  >
                    {badge.name}
                    <span className="rounded-full bg-white/20 h-4 w-4 flex items-center justify-center ml-1 hover:bg-white/30">×</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col">
          <TabsList className="mb-4 overflow-x-auto flex-wrap justify-start h-auto p-1">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="whitespace-nowrap my-1"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="border rounded-md flex-1 overflow-hidden">
            {categories.map(category => (
              <TabsContent 
                key={category} 
                value={category} 
                className="m-0 h-full data-[state=active]:flex flex-col"
              >
                <ScrollArea className="flex-1 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {getBadgesByCategory(category).map(badge => {
                      const isSelected = selectedBadges.includes(badge.id);
                      
                      return (
                        <Badge
                          key={badge.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer h-auto py-2 justify-start ${
                            isSelected 
                              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                              : "hover:bg-secondary"
                          }`}
                          onClick={() => toggleBadge(badge.id)}
                        >
                          {isSelected && <Check className="mr-1 h-3 w-3" />}
                          <span className="truncate">{badge.name}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </div>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Badges
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeSelector;