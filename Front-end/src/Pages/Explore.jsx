import React from 'react';
import Navbar from './Navbar'; // Assuming Navbar is in the Pages directory
import Footer from '../Components/Footer'; // Assuming Footer is in the Components directory
import { FaSearch, FaCodeBranch, FaUsers, FaStar } from 'react-icons/fa';

const Explore = () => {
  // Placeholder data for project cards
  const projects = [
    { id: 1, name: 'Awesome Project Alpha', description: 'A revolutionary tool for developers.', tags: ['React', 'Node.js', 'AI'], stars: 120, forks: 30, contributors: 5 },
    { id: 2, name: 'CodeSync Core Library', description: 'The foundational library for CodeSync features.', tags: ['JavaScript', 'Core', 'Utility'], stars: 450, forks: 85, contributors: 12 },
    { id: 3, name: 'DataVis Suite', description: 'Visualize complex datasets with ease.', tags: ['Python', 'D3.js', 'Data'], stars: 210, forks: 40, contributors: 8 },
    { id: 4, name: 'Mobile Sync App', description: 'Collaborate on the go with our native app.', tags: ['React Native', 'Mobile', 'iOS', 'Android'], stars: 300, forks: 55, contributors: 7 },
    { id: 5, name: 'Project Phoenix', description: 'Next-generation collaborative editor.', tags: ['WebSockets', 'Real-time', 'Editor'], stars: 500, forks: 110, contributors: 15 },
    { id: 6, name: 'Community Forum', description: 'Connect with other CodeSync users.', tags: ['Community', 'Forum', 'Support'], stars: 95, forks: 15, contributors: 20 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Explore Projects & Features
        </h1>

        {/* Search/Filter Bar (Optional) */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="Search projects, tags, or users..."
              className="w-full px-4 py-3 pl-10 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          {/* Add filter buttons/dropdowns here if needed */}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{project.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map(tag => (
                    <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3 mt-4">
                <span className="flex items-center"><FaStar className="mr-1 text-yellow-500" /> {project.stars}</span>
                <span className="flex items-center"><FaCodeBranch className="mr-1" /> {project.forks}</span>
                <span className="flex items-center"><FaUsers className="mr-1" /> {project.contributors}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Explore;