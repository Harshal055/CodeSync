import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../Components/Terminal/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { login } = useContext(UserContext);

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
    try {
      await login(email, password);
      // Login successful, redirect handled by checking user state or just navigate
      alert("Login successful!");
      navigate("/Home");
    } catch (err) {
      console.error(err);
      setError("Login failed: " + err.message);
    }
  };

  return (
    <div>
      <div className="flex min-h-screen">
        {/* Left Side */}
        <div className="flex-1 bg-blue-700 text-white flex flex-col justify-center items-center p-8">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-5xl font-bold mb-4 pt-50">
            Hello<br /> from <br />Code Sync<span role="img" aria-label="waving hand">👋</span>
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
              <Link to="/signup" className="text-blue-500">
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