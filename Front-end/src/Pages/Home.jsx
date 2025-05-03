import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Correct imports
import Navbar from './Navbar';
import HeroSection from '../Components/HeroSection';

import Footer from '../Components/Footer';
import Feature from '../Components/Feature';
import Home1 from '../Components/Home1';

const Home = () => {
  return (
    
    <div> 
      <Navbar />
      <HeroSection />
      <Home1/>
       <Feature/>
      <Footer />
    </div>
  );
};

export default Home;
