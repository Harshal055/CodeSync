import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import { UserContext } from './UserContext';
import toast from 'react-hot-toast';
import { FaUserCircle, FaKeyboard, FaPlus } from 'react-icons/fa';

const RoomCreate = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const { userData } = useContext(UserContext);

  useEffect(() => {
    if (userData?.firstName) {
      setUserName(`${userData.firstName} ${userData.lastName || ''}`.trim());
    }
  }, [userData]);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success('Generated new Room ID');
  };

  const joinRoom = () => {
    if (!roomId) {
      toast.error('ROOM ID is required');
      return;
    }
    if (!userName) {
      toast.error('USERNAME is required');
      return;
    }

    // Save/Cache username for session
    localStorage.setItem('userName', userName);

    navigate(`/Editor/${roomId}`, {
      state: {
        userName,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden text-white font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />

      {/* Main Card */}
      <div className="z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-purple-500/10 hover:border-white/20">

        {/* Header */}
        <div className="text-center mb-10">
          <img src="/src/assets/logo.png" alt="Logo" className="w-16 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Code Sync
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-light tracking-wide">
            Real-time Collaboration Environment
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
              <FaKeyboard />
            </div>
            <input
              type="text"
              placeholder="Paste Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleInputEnter}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-gray-200 placeholder-gray-500"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
              <FaUserCircle />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyUp={handleInputEnter}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-gray-200 placeholder-gray-500"
            />
          </div>

          <button
            onClick={joinRoom}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            Start Coding
          </button>
        </div>

        {/* Footer actions */}
        <div className="mt-8 text-center space-y-4">
          <div className="text-gray-400 text-sm">
            Don't have a room ID?{' '}
            <button
              onClick={createNewRoom}
              className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all"
            >
              Create New Room
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-center gap-6">
            <Link to="/UserProfile" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
              <FaUserCircle /> User Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCreate;