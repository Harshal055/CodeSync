import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Login from "./Pages/login"; // Changed to uppercase
import Signup from "./Pages/signup"; // Changed to lowercase 's'

import Home from "./Pages/Home";


import Feature from "./Components/Feature";


function App() {
  return (
    <Router>
      <Routes>
     
      <Route path="/feature" element={<Feature />} />
      
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/*" element={<Home />} />
        
      </Routes>
    </Router>
  );
}

export default App;