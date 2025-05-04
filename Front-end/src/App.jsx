import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,

} from "react-router-dom";

import Login from "./Pages/login"; // Changed to uppercase
import Signup from "./Pages/signup"; // Changed to lowercase 's'

import Home from "./Pages/Home";


import Feature from "./Components/Feature";
import UserProfile from "./Components/Terminal/UserProfile";
import Editor from "./Components/Terminal/Editor";
// Import the context providers
import { UserProvider } from "./Components/Terminal/UserContext"; // Adjust path if necessary
import { ModalProvider } from "./Components/Terminal/ModalContext"; // Adjust path if necessary
import Contact from "./Components/Contact";
import Explore from "./Pages/Explore";
import Problems from "./Pages/Problems";
import RoomCreate from "./Components/Terminal/RoomCreate";

function App() {
  return (
    <Router>
      {/* Wrap the routes with the providers */}
      <UserProvider>
        <ModalProvider>
          <Routes>
            
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Explore" element={<Explore />} />
            <Route path="/feature" element={<Feature />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/*" element={<Home />} />
            <Route path="/RoomCreate" element={<RoomCreate />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/UserProfile" element={<UserProfile />} />
            <Route path="/Editor/:roomId" element={<Editor />} />
            <Route path="/Editor/folder/:folderId" element={<Editor />} />
            <Route path="/Problems" element={<Problems />} />
          </Routes>
        </ModalProvider>
      </UserProvider>
    </Router>
  );
}

export default App;