// src/components/profile/SettingsDropdown.tsx
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/userSlice";
import { AppDispatch } from "@/redux/store";
import { useTheme } from "@/hooks/useTheme";
import {
  LogOut,
  Moon,
  Sun,
  Settings,
  User,
  Shield,
  Bell,
  Eye,
  HelpCircle,
  UserCog
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SettingsDropdownProps {
  // Optional prop to use a different trigger button style
  variant?: 'icon' | 'text';
}

const SettingsDropdown = ({ variant = 'icon' }: SettingsDropdownProps) => {
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings size={20} />
            <span className="sr-only">Settings</span>
          </Button>
        ) : (
          <Button variant="outline" className="flex items-center gap-2">
            <Settings size={16} />
            <span>Settings</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/settings?tab=profile")}>
            <User className="h-4 w-4 mr-2" /> 
            Edit Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => router.push("/settings?tab=account")}>
            <UserCog className="h-4 w-4 mr-2" /> 
            Account Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => router.push("/settings?tab=privacy")}>
            <Eye className="h-4 w-4 mr-2" /> 
            Privacy
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => router.push("/settings?tab=notifications")}>
            <Bell className="h-4 w-4 mr-2" /> 
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/help")}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Support
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => router.push("/settings?tab=security")}>
            <Shield className="h-4 w-4 mr-2" />
            Security
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;