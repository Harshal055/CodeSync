import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const handleNameChange = (e) => {
    setName(e.target.value);
    setError("");
  };

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

    try { const response = await axios.post(`${API_BASE_URL}/signup`,
      {
        name,
        email,
        password,
      });

      if (response.data.success) {
        alert("Signup successful!");
        navigate(response.data.redirectUrl || "/login"); // Redirect after successful signup, potentially to login
      } else {
        setError(response.data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
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
          <p className="text-lg mb-8"></p> {/* You can add more descriptive text here */}
          <p className="mt-auto text-sm">© 2024 codesync. All rights reserved.</p>
        </div>

        {/* Right Side */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold mb-6">Code Sync</h2>
            <h3 className="text-2xl font-semibold mb-4">Create a Free Account</h3> {/* Changed title */}
            <p className="text-sm mb-6">
              Already have an account?{" "}
              <a href="/login" className="text-blue-500">Login</a> {/* Link to login */}
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
            <div> {/* Added name input field */}
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full p-3 border border-gray-300 rounded"
                  required
                />
              </div>
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
                Sign Up
              </button>
             {/* Removed Google login button for signup */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
