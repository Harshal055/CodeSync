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
      navigate('/');
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
           <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block">
  <span className="absolute inset-0 overflow-hidden rounded-full">
    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  </span>
  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
    <span onClick={handleGetStarted}
    >
      
     Get start
    </span>
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.75 8.75L14.25 12L10.75 15.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  </div>
  <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;