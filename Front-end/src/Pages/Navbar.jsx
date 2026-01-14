import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Components/Terminal/UserContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { userData, setUserData, user } = useContext(UserContext); // Use Context
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const dropdownRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Derived from Context
  const isLoggedIn = !!user; // Use firebase user object for source of truth
  const displayName = userData?.firstName
    ? `${userData.firstName} ${userData.lastName || ''}`
    : user?.displayName || user?.email?.split('@')[0] || "User";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setScrollPosition(currentScrollPos);
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [prevScrollPos]);

  const handleLogout = () => {
    localStorage.removeItem("user"); // Legacy
    // Call context logout if available, otherwise just clear local
    // Assuming context has logout:
    // logout(); 
    // But passing it in is better.
    setUserData(null);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfileClick = () => {
    navigate("/UserProfile");
  };

  const navbarStyle = {
    backgroundColor: `rgba(17, 24, 39, ${Math.min(scrollPosition / 300, 0.85)})`,
    backdropFilter: scrollPosition > 10 ? "blur(8px)" : "none",
    WebkitBackdropFilter: scrollPosition > 10 ? "blur(8px)" : "none",
    transition: "transform 0.3s ease-in-out, background-color 0.3s ease-in-out",
    transform: visible ? 'translateY(0)' : 'translateY(-100%)',
    position: 'fixed',
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
            onClick={() => navigate('/')}
          >
            <img
              src="/src/assets/logo.png"
              alt="Code Sync Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-white font-bold text-xl">Code Sync</span>
          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex items-center space-x-6 lg:space-x-9">
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
                onClick={() => handleNavigation("/feature")}
                className="text-white hover:text-gray-300 drop-shadow-lg transition-colors"
              >
                Features
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
          <div className="flex items-center relative">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* User Name */}
                <div className="relative">
                  <span
                    ref={dropdownRef}
                    onClick={toggleDropdown}
                    className="text-white hover:text-gray-300 drop-shadow-lg transition-colors cursor-pointer font-semibold flex items-center gap-2"
                  >
                    {displayName} <span className="text-xs">▼</span>
                  </span>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      ref={dropdownMenuRef}
                      className="absolute right-0 top-full mt-2 w-48 bg-[#1f2937] border border-gray-700 rounded-md shadow-xl py-1 z-50"
                    >
                      <button
                        onClick={() => { navigate("/RoomCreate"); setIsDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => { navigate("/UserProfile"); setIsDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      >
                        Profile
                      </button>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
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
