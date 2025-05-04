import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import { UserContext } from './UserContext';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const RoomCreate = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const { userData } = useContext(UserContext);
  const [joined, setJoined] = useState(false);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success('Room created successfully!');
  };

  const joinRoom = () => {
    if (!roomId || !userName) {
      toast.error('ROOM ID & USERNAME are required');
      return;
    }

    navigate(`/Editor/${roomId}`, {
      state: {
        userName,
      },
    });

    if (roomId && userName) {
      setJoined(true);
    }
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  useEffect(() => {
    if (userData?.firstName && userData?.lastName) {
      setUserName(`${userData.firstName} ${userData.lastName}`);
    }
  }, [userData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-6">
      {/* Profile Button */}
      <div className="self-start mb-4">
        <Link to="/UserProfile">
          <button className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Profile
          </button>
        </Link>
      </div>

      {/* Room Box */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="text-white text-3xl font-bold mb-4">Join a Room</div>
        <p className="text-gray-400 mb-2">Enter the ROOM ID to join</p>

        {/* Input Fields */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="ROOM ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handleInputEnter}
            className="w-full px-4 py-2 rounded-md border-none outline-none bg-gray-700 text-white placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="USERNAME"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyUp={handleInputEnter}
            className="w-full px-4 py-2 rounded-md border-none outline-none bg-gray-700 text-white placeholder-gray-400"
          />
        </div>

        {/* Join Button */}
        <div className="mt-4">
          <button
            onClick={joinRoom}
            className="w-full py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition"
          >
            JOIN
          </button>
        </div>

        {/* Create Room Link */}
        <p className="text-gray-400 text-sm mt-4">
          No invite?{' '}
          <a onClick={createNewRoom} href="" className="text-green-400 hover:text-green-500">
            Create a new room
          </a>
        </p>
      </div>
    </div>
  );
};

export default RoomCreate;