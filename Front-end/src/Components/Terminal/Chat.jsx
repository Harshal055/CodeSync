import React, { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useParams } from "react-router-dom";
import { BsEmojiSmile, BsSendFill } from "react-icons/bs";

const Chat = ({ unseenCount, setUnseenCount, isActive, chatTabIndex, messages = [], sendMessage }) => {
  const { roomId } = useParams();
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const firstUnseenRef = useRef(null);
  const userName = localStorage.getItem("userName");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    if (sendMessage) {
      sendMessage(input.trim());
      setInput("");
      setShowEmojiPicker(false);
    }
  };

  const addEmoji = (e) => {
    setInput((prev) => prev + e.native);
  };

  useEffect(() => {
    if (isActive) {
      if (unseenCount > 0 && firstUnseenRef.current) {
        firstUnseenRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      setUnseenCount(0);
    }
  }, [isActive, messages]);

  const groupMessages = () => {
    const groups = [];
    let currentGroup = null;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!currentGroup || currentGroup.userName !== msg.userName) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { userName: msg.userName, items: [msg] };
      } else {
        currentGroup.items.push(msg);
      }
    }

    if (currentGroup) groups.push(currentGroup);
    return groups;
  };

  return (
    <div className="flex flex-col h-full bg-[#121212]/50 backdrop-blur-sm rounded-lg overflow-hidden border border-white/5">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {groupMessages().map((group, index) => {
          const isSelf = group.userName === userName;

          return (
            <div
              key={index}
              className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {!isSelf && (
                  <div className="mb-1 hidden sm:block">
                    <Avatar
                      name={group.userName}
                      size="28"
                      round="50%"
                      textSizeRatio={2}
                      className="shadow-sm"
                    />
                  </div>
                )}

                <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                  {!isSelf && (
                    <span className="text-xs text-gray-400 ml-1 mb-1">{group.userName}</span>
                  )}
                  {group.items.map((msg, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2 my-0.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words max-w-full ${isSelf
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
                          : "bg-[#2a2a2a] text-gray-200 rounded-tl-sm border border-white/5"
                        }`}
                    >
                      {msg.message}
                    </div>
                  ))}
                  <span className="text-[10px] text-gray-500 mt-1 mx-1">
                    {group.items[group.items.length - 1].time ? new Date(group.items[group.items.length - 1].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                {isSelf && (
                  <div className="mb-1 hidden sm:block">
                    <Avatar
                      name={userName}
                      size="28"
                      round="50%"
                      textSizeRatio={2}
                      className="shadow-md border border-white/10"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#0a0a0a]/80 border-t border-white/5 backdrop-blur-md">
        <div className="relative flex items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-full border border-white/10 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all shadow-lg">

          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-full hover:bg-white/5"
          >
            <BsEmojiSmile size={20} />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-xl border border-white/10 overflow-hidden">
              <Picker data={data} theme="dark" onEmojiSelect={addEmoji} />
            </div>
          )}

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-500 focus:outline-none px-2"
            placeholder="Type a message..."
          />

          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className={`p-2 rounded-full transition-all duration-300 ${input.trim()
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 scale-100'
                : 'bg-transparent text-gray-600 scale-90 cursor-default'
              }`}
          >
            <BsSendFill size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
