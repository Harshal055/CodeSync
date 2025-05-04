import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";



export default function Navbar() {
  const navigate = useNavigate();
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(" ");
  const dropdownRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  // Added state for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

  useEffect(() => {
    const storedUser = localStorage.getItem("user"); // Get the string value first
    if (storedUser) { // Check if it exists and is not null/undefined
      try {
        const userData = JSON.parse(storedUser); // Parse only if it exists
        // Also check if userData itself and the name property exist after parsing
        // Check for firstName instead of name, as that's what Login.jsx stores
        if (userData && userData.firstName) { 
            setIsLoggedIn(true);
            // Combine firstName and lastName for display
            const fullName = `${userData.firstName} ${userData.lastName || ''}`.trim();
            setUserName(fullName);
        } else {
           console.error("Parsed user data is invalid or missing firstName:", userData);
           localStorage.removeItem("user"); // Clean up invalid data
        }
      } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
          localStorage.removeItem("user"); // Clean up invalid data if parsing fails
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setScrollPosition(currentScrollPos);
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    // Corrected handleClickOutside to use the correct state setter
    const handleClickOutside = (event) => {
      // Check if the click is outside the dropdown trigger AND the dropdown menu
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        dropdownMenuRef.current && 
        !dropdownMenuRef.current.contains(event.target) 
      ) {
        setIsDropdownOpen(false); // Close the dropdown
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Changed from "mousedown" to "click" for better compatibility, especially on mobile
    document.addEventListener("click", handleClickOutside); 

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
    // Added isDropdownOpen to dependency array if needed, but likely not necessary for this logic
  }, [prevScrollPos]); 

  
 

  const handleMouseLeave = (e) => {
    const dropdownElement = dropdownRef.current; // This ref is on the user name span
    const menuElement = dropdownMenuRef.current; // This ref is not assigned to any visible element yet
    const relatedTarget = e.relatedTarget;

    // This logic might prematurely close the dropdown if the mouse briefly leaves
    // the trigger (username) but moves onto the menu (if it existed).
    // Consider using mouse enter/leave on a container wrapping both trigger and menu.
    if (!dropdownElement?.contains(relatedTarget) && !menuElement?.contains(relatedTarget)) {
      setIsDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    setIsDropdownOpen(false); // Close dropdown on logout
    navigate("/login");
  };

  const handleNavigation = (path) => {
    
    navigate(path); 

  };

  // Toggle dropdown visibility when username is clicked
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navbarStyle = {
    // Corrected background color application - remove blur() function call
    // Apply rgba for transparency that works with backdrop-filter
    backgroundColor: `rgba(17, 24, 39, ${Math.min(scrollPosition / 300, 0.85)})`, // Example: Dark background with opacity
    backdropFilter: scrollPosition > 10 ? "blur(8px)" : "none", // Apply blur only after some scroll
    WebkitBackdropFilter: scrollPosition > 10 ? "blur(8px)" : "none", // For Safari
    transition: "transform 0.3s ease-in-out, background-color 0.3s ease-in-out", // Smoother transitions
    transform: visible ? 'translateY(0)' : 'translateY(-1000%)',
    position: 'fixed', // Ensure it's fixed
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 50,
  };

  return (
    <nav style={navbarStyle}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/')} // Navigate home on logo click
          >
            <img
              src="/src/assets/logo.png" // Make sure this path is correct relative to the public folder or handled by your build process
              alt="Code Sync Logo"
              className="h-10 w-auto object-contain" // Use w-auto for better scaling
            />
            <span className="text-white font-bold text-xl">Code Sync</span>
          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex items-center space-x-6 lg:space-x-9"> {/* Hide on small screens, adjust spacing */}
            <li>
              <button
                onClick={() => handleNavigation("/explore")}
                className="text-white hover:text-gray-300 drop-shadow-lg transition-colors"
              >
                Explore
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/feature")} // Assuming /feature is the correct route
                className="text-white hover:text-gray-300 drop-shadow-lg transition-colors"
              >
                Features {/* Simplified text */}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/Problems")}
                className="text-white hover:text-gray-300 drop-shadow-lg transition-colors"
              >
                Problems
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/contact")}
                className="text-white hover:text-gray-300 drop-shadow-lg transition-colors"
              >
                Contact
              </button>
            </li>
          </ul>

          {/* Login/User Area */}
          <div className="flex items-center relative"> {/* Added relative positioning for dropdown */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* User Name - Acts as dropdown trigger */}
                <span
                  ref={dropdownRef} // Assign ref to the trigger element
                  onClick={toggleDropdown} // Toggle dropdown on click
                  className="text-white hover:text-gray-300 drop-shadow-lg transition-colors cursor-pointer"
                >
                  {userName}
                </span>

                {/* Simple Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    ref={dropdownMenuRef} // Assign ref to the dropdown menu itself
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-60"
                    // onMouseLeave={handleMouseLeave} // Optional: Close on mouse leave from the menu
                  >
                    <button
                      onClick={() => { navigate("/UserProfile"); setIsDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </button> 
                    <button
                      onClick={handleLogout} // Logout function already closes dropdown
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}

                
               
              </div>
            ) : (
              <button
                type="button"
                className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl text-sm"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}
           
          </div>
        </div>
      </div>
    </nav>
  );
}
