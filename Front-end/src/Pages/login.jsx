import React, { useState, useContext } from "react"; // Import useContext
import axios from "axios"; // For making API requests
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../Components/Terminal/UserContext"; // Import UserContext
import API_BASE_URL from "../lib/api";

// Define API_BASE_URL (ensure your .env file has VITE_API_BASE_URL=http://localhost:8081)
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { setUserData } = useContext(UserContext); // Get setUserData from context

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!API_BASE_URL) {
      setError("API URL is not configured. Please check environment variables.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { // Use API_BASE_URL
        email,
        password,
      });

          // Inside the handleSubmit function in login.jsx
    if (response.data.success) {
      alert("Login successful!");
      // Prepare the user data object for context and localStorage
      const userToStore = {
        // Assuming backend sends firstName, lastName, email
        // Adjust keys based on your actual backend response
        firstName: response.data.firstName || response.data.userName.split(' ')[0] || '', // Example: Extract first name
        lastName: response.data.lastName || response.data.userName.split(' ').slice(1).join(' ') || '', // Example: Extract last name
        email: response.data.userEmail,
        // Add any other relevant user data from the response
      };
      // Store the structured user object
      localStorage.setItem('user', JSON.stringify(userToStore)); // Keep storing in localStorage for persistence
      setUserData(userToStore); // *** Update the UserContext state ***
      navigate(response.data.redirectUrl || '/Home'); // Redirect (use /Home as default if redirectUrl isn't sent)
    }
else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (err) { // Improved error handling
      console.log(err);
      
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex min-h-screen">
        {/* Left Side */}
        <div className="flex-1 bg-blue-700 text-white flex flex-col justify-center items-center p-8">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-5xl font-bold mb-4 pt-50">
            Hello<br /> from <br/>Code Sync<span role="img" aria-label="waving hand">👋</span>
          </h1>
          <p className="text-lg mb-8">
            
          </p>
          <p className="mt-auto text-sm">© 2024 codesync. All rights reserved.</p>
        </div>

        {/* Right Side */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold mb-6">Code Sync</h2>
            <h3 className="text-2xl font-semibold mb-4">Welcome Back!</h3>
            <p className="text-sm mb-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-500">  {/* Use Link for navigation */}
                Create a new account now
              </Link>
              
              , it's FREE! Takes less than a minute.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full p-3 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full p-3 bg-black text-white rounded"
              >
                Login Now
              </button>
            
            </form>
            <p className="text-sm mt-4">
              Forget password?{" "}
              <a href="#" className="text-blue-500">
                Click here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;