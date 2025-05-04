import React from 'react'; 
import Avatar from 'react-avatar';
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const Client = ({ userName, displayName, micOn }) => {
  return (
    <div className="flex items-center justify-between text-[#b3b3b3] text-base font-semibold w-full p-2.5 hover:bg-[#282828] border border-transparent hover:border-[#3c3c3c] rounded-xl">
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <Avatar name={userName} size={50} round="14px" />
        <span className="truncate w-full">
          {displayName || userName}
        </span>
      </div>
      <div className="flex-shrink-0 ml-2">
        {micOn ? (
          <FaMicrophone size={20} className="text-green-400" />
        ) : (
          <FaMicrophoneSlash size={23} className="text-red-400" />
        )}
      </div>
    </div>
  );
};

export default Client;
