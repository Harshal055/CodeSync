import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Participants from "./Participants";
import Chat from "./Chat";
import History from "./History";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import useVoiceChat from "../../Hooks/useVoiceChat";

const ChatParticipants = ({
  parentRef,
  clients,
  chatTabIndex,
  justOpened,
  hostId,
  remoteHostId,
  micOn,
  unseenCount,
  setUnseenCount,
  messages,
  sendMessage,
  currentUserId,
  kickUser,
  toggleRoomLock,
  roomDetails,
  fileId,
  currentCode,
  onRestore,
  roomId
}) => {
  const [activeComponent, setActiveComponent] = useState(chatTabIndex || 0);
  const { isMicOn, toggleMic } = useVoiceChat(roomId, currentUserId);

  const components = [
    <div className="mx-2 mt-2 bg-transparent">
      <div className="h-full rounded-lg">
        <Participants
          clients={clients}
          hostId={hostId}
          remoteHostId={remoteHostId}
          micOn={isMicOn}
          currentUserId={currentUserId}
          kickUser={kickUser}
          toggleRoomLock={toggleRoomLock}
          roomDetails={roomDetails}
        />
      </div>
    </div>,
    <div className="mx-2 mt-2 bg-transparent h-[calc(100vh-220px)] overflow-hidden">
      <div className="h-full rounded-lg">
        <Chat
          unseenCount={unseenCount}
          setUnseenCount={setUnseenCount}
          isActive={activeComponent}
          chatTabIndex={chatTabIndex}
          messages={messages}
          sendMessage={sendMessage}
        />
      </div>
    </div>,
    <div className="mx-2 mt-2 bg-transparent h-[calc(100vh-220px)] overflow-hidden">
      <div className="h-full rounded-lg">
        <History
          roomId={roomId || roomDetails?.id}
          fileId={fileId}
          currentCode={currentCode}
          onRestore={onRestore}
        />
      </div>
    </div>
  ];

  const tabs = [`Participants (${clients.length})`, "Chat", "History"];

  const handleTabClick = (index) => {
    setActiveComponent(index);
  };

  useEffect(() => {
    if (typeof chatTabIndex === "number" && chatTabIndex !== activeComponent) {
      setActiveComponent(chatTabIndex);
    }
  }, [chatTabIndex]);

  useEffect(() => {
    localStorage.setItem("chatTabIndex", activeComponent);
  }, [activeComponent]);

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex items-center gap-2 mx-4 mt-4 mb-2">
        <div className="relative flex-1 flex justify-around bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-1 shadow-inner">
          <motion.div
            className="absolute left-0 top-0 h-full bg-blue-600/20 border border-blue-500/30 rounded-xl z-0 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            animate={{
              left: `${(activeComponent / tabs.length) * 100}%`,
              width: `${100 / tabs.length}%`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`relative w-full py-2.5 font-semibold text-xs tracking-wide z-10 transition-colors duration-200
                ${activeComponent === index
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={toggleMic}
          className={`p-2.5 rounded-xl border transition-all duration-300 ${isMicOn
            ? "bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]"
            : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
            }`}
          title={isMicOn ? "Mute" : "Unmute"}
        >
          {isMicOn ? <FaMicrophone size={16} /> : <FaMicrophoneSlash size={16} />}
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex w-full h-full"
          animate={{ x: `-${activeComponent * 100}%` }}
          transition={{
            x: justOpened
              ? { duration: 0 }
              : { type: "spring", stiffness: 300, damping: 30 },
          }}
        >
          {components.map((component, index) => (
            <motion.div
              key={index}
              className="w-full h-full flex-shrink-0"
              initial={{ opacity: 0 }}
              animate={{
                opacity: activeComponent === index ? 1 : 0.5,
              }}
              transition={{
                opacity: { duration: 0.3 },
              }}
            >
              {component}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ChatParticipants;
