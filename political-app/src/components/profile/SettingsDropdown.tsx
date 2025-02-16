import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/userSlice";
import { AppDispatch } from "@/redux/store";
import {
  Sun,
  Moon,
  LogOut,
  Settings,
  Shield,
  User,
  ChevronDown,
} from "lucide-react";

const SettingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // ✅ Check dark mode preference on page load
  useEffect(() => {
    const isDarkMode = localStorage.getItem("theme") === "dark";
    if (isDarkMode) {
      document.body.classList.add("dark"); // ✅ Apply dark mode to <body>
      setDarkMode(true);
    }
  }, []);

  // ✅ Toggle Dark Mode and Save Preference
  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <div className="relative">
      {/* ⚙️ Gear Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 dark:text-white hover:text-gray-900"
      >
        <Settings size={24} />
        <ChevronDown size={18} />
      </button>

      {/* 🔽 Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50">
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li>
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="mr-2" size={16} />
                Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/account")}
                className="flex items-center px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Shield className="mr-2" size={16} />
                Account
              </button>
            </li>
            <li>
              <button
                onClick={toggleDarkMode}
                className="flex items-center px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? (
                  <Sun className="mr-2" size={16} />
                ) : (
                  <Moon className="mr-2" size={16} />
                )}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 w-full text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-red-400"
              >
                <LogOut className="mr-2" size={16} />
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
