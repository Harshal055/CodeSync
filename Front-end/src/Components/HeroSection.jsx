import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LetterGlitch from './LetterGlitch';


const HeroSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem('user');
    if (isLoggedIn) {
      navigate('/LanguagePage');
    } else {
      navigate('/login');
    }
  };


  return (
    <div className="relative min-h-screen bg-dark">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br  x` to-black/90 z-1" />

      {/* Main Content */}
      <div className={`relative z-10 flex flex-col md:flex-row items-center justify-between 
        min-h-screen px-6 md:px-20 max-w-7xl mx-auto
        ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        
        {/* Left Content */}
        <div className="md:w-1/2 text-left mb-8 md:mb-0">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent blur-xl opacity-20" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white relative">
            # Live Coding Environment:
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl">
            Real-Time Collaboration and Development
            </p>
          </div>
        </div>

        {/* Right Button */}
        <div className="md:w-1/3 flex justify-center items-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 
              rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <button
              onClick={handleGetStarted}
              className="relative bg-primary hover:bg-primary-dark text-white font-bold 
                py-4 px-10 rounded-full transform hover:scale-105 
                transition-all duration-300 shadow-lg hover:shadow-xl
                hover:shadow-primary/50"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;