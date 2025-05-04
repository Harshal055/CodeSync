import React, { useState } from 'react';
import Navbar from './Navbar'; // Assuming Navbar is in the Pages directory
import Footer from '../Components/Footer'; // Assuming Footer is in the Components directory
import { FaSearch, FaFilter, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom'; // No longer needed for direct external links

// Placeholder data for problems
const problemsData = [
  { id: 'p1', title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Table'], status: 'Solved' },
  { id: 'p2', title: 'Add Two Numbers', difficulty: 'Medium', tags: ['Linked List', 'Math'], status: 'Unsolved' },
  { id: 'p3', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tags: ['Hash Table', 'String', 'Sliding Window'], status: 'Solved' },
  { id: 'p4', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', tags: ['Array', 'Binary Search', 'Divide and Conquer'], status: 'Unsolved' },
  { id: 'p5', title: 'Reverse Integer', difficulty: 'Easy', tags: ['Math'], status: 'Unsolved' },
  { id: 'p6', title: 'Container With Most Water', difficulty: 'Medium', tags: ['Array', 'Two Pointers'], status: 'Solved' },
  { id: 'p7', title: 'Valid Parentheses', difficulty: 'Easy', tags: ['String', 'Stack'], status: 'Unsolved' },
  { id: 'p8', title: 'Merge k Sorted Lists', difficulty: 'Hard', tags: ['Linked List', 'Heap', 'Divide and Conquer'], status: 'Unsolved' },
];

const DifficultyBadge = ({ difficulty }) => {
  let colorClass = '';
  switch (difficulty.toLowerCase()) {
    case 'easy': colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'; break;
    case 'medium': colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'; break;
    case 'hard': colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'; break;
    default: colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{difficulty}</span>;
};

const Problems = () => {
  // const navigate = useNavigate(); // No longer needed
  const [searchTerm, setSearchTerm] = useState('');
  // Add state for filters (difficulty, tags, status) if needed later

  const filteredProblems = problemsData.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to generate LeetCode slug from title
  const generateLeetCodeSlug = (title) => {
    return title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
                .replace(/\s+/g, '-'); // Replace spaces with hyphens
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Coding Problems
        </h1>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-center items-center">
          <div className="relative flex-grow w-full md:w-auto max-w-xl">
            <input
              type="search"
              placeholder="Search problems by title or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            <FaFilter /> Filters
          </button> */}
        </div>

        {/* Problems List/Table */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProblems.map((problem) => (
              <li key={problem.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out flex justify-between items-center">
                {/* Wrap the title and tags in an anchor tag */}
                <a
                  href={`https://leetcode.com/problems/${generateLeetCodeSlug(problem.title)}/`}
                  target="_blank" // Open in a new tab
                  rel="noopener noreferrer" // Security best practice for target="_blank"
                  className="flex-grow mr-4 cursor-pointer group"> {/* Added group class */}
                  <p className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{problem.title}</p> {/* Added group-hover */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {problem.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </a> {/* Close the <a> tag here */}
                <div className="flex items-center gap-4 flex-shrink-0"> {/* Prevent shrinking */}
                  <DifficultyBadge difficulty={problem.difficulty} />
                  {problem.status === 'Solved' ?
                    <FaCheckCircle className="text-green-500" title="Solved" /> :
                    <FaTimesCircle className="text-gray-400 dark:text-gray-500" title="Unsolved" />
                  }
                </div>
              </li>
            ))}
          </ul>
          {filteredProblems.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No problems found matching your search.</p>
          )}
        </div>
      </main>

     
    </div>
  );
};

export default Problems;