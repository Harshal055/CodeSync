import React, { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import socket from "./socket";
import { useParams } from "react-router-dom";
import { CiFileOn } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";

const Chat = ({ unseenCount, setUnseenCount, isActive, chatTabIndex }) => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem(`chatMessages_${roomId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const firstUnseenRef = useRef(null);
  const userName = localStorage.getItem("userName");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on(
      "chatFile",
      ({ userName, fileName, fileType, fileData, time, id }) => {
        setMessages((prev) => [
          ...prev,
          { userName, fileName, fileType, fileData, time, id },
        ]);
      }
    );

    return () => {
      socket.off("chatFile");
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(`chatMessages_${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);

  useEffect(() => {
    setMessages(() => {
      const stored = localStorage.getItem(`chatMessages_${roomId}`);
      return stored ? JSON.parse(stored) : [];
    });
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim() || !userName) {
      console.warn("🚫 Cannot send: missing input or userName");
      return;
    }

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    console.log("👤 Sending message:", { userName, roomId, input }); // ✅ ADD THIS

    socket.emit("chatMessage", {
      roomId,
      userName,
      message: input.trim(),
      time,
    });

    setInput("");
    setShowEmojiPicker(false);
  };

  const addEmoji = (e) => {
    setInput((prev) => prev + e.native);
  };

  const handleFileSend = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      socket.emit("chatFile", {
        roomId,
        userName,
        fileName: file.name,
        fileType: file.type,
        fileData: reader.result,
        time,
        id: Date.now(),
      });
    };
    reader.readAsDataURL(file);
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

      setUnseenCount(0); // reset unseen count when viewing chat
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

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]); // ✅ update messages
      if (chatTabIndex !== 1) {
        setUnseenCount((prev) => prev + 1);
      }
    };

    socket.on("chatMessage", handleMessage);

    return () => {
      socket.off("chatMessage", handleMessage);
    };
  }, [chatTabIndex]);

  useEffect(() => {
    if (chatTabIndex === 1) setUnseenCount(0);
  }, [chatTabIndex]);

  return (
    <div className="flex flex-col h-full min-h-[700px]">
      <div className="flex-1 overflow-y-auto p-2 mb-2.5 text-base min-h-0 scrollbar-none">
        {groupMessages().map((group, index) => {
          const isSelf = group.userName === userName;
          const totalMessages = messages.length;
          const unseenStartIndex = totalMessages - unseenCount;

          return (
            <div
              key={index}
              className={`mb-5 flex flex-col ${
                isSelf ? "items-end" : "items-start"
              }`}
            >
              {!isSelf && (
                <div className="text-sm font-thin text-gray-300 mb-1 ml-1">
                  {group.userName}
                </div>
              )}
              {group.items.map((msg, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-xl mb-1 max-w-[75%] whitespace-pre-wrap break-words ${
                    isSelf
                      ? "bg-[#282828] text-[#f2f2f2] self-end"
                      : "bg-[#333] text-[#f2f2f2] self-start"
                  }`}
                >
                  {msg.message && <div>{msg.message}</div>}
                  {msg.fileData && (
                    <>
                      {msg.fileType?.startsWith("image/") ? (
                        <img
                          src={msg.fileData}
                          alt="sent"
                          className="max-w-full max-h-[250px] rounded-lg mt-2 object-contain"
                        />
                      ) : (
                        <a
                          href={msg.fileData}
                          download={msg.fileName}
                          className="flex items-center gap-2 mt-2 p-2 rounded-lg hover:bg-[#2a2a2a] border border-gray-600 text-[#f2f2f2]"
                        >
                          <CiFileOn size={20} className="text-[#0e78f8]" />
                          <span className="truncate max-w-[200px]">
                            {msg.fileName}
                          </span>
                        </a>
                      )}
                    </>
                  )}

                  <div className="text-[10px] text-right text-gray-300 mt-1">
                    {msg.time}
                  </div>
                </div>
              ))}
              <div className="mt-1">
                <Avatar
                  name={group.userName}
                  size={34}
                  round="10px"
                  textSizeRatio={2.5}
                  style={{ fontWeight: 550 }}
                />
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative p-2 flex flex-col gap-3 pt-3 border-t border-[#333333]">
        <div className="flex gap-3">
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-xl text-gray-300 mr-1"
          >
            <BsEmojiSmile size={21} />
          </button>
          <label htmlFor="file-upload" className="cursor-pointer text-gray-300">
            <CiFileOn size={24} />
          </label>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => handleFileSend(e.target.files[0])}
          />
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-20 left-2 z-10">
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 h-10 rounded bg-[#121212] text-[#f2f2f2] outline-none resize-none placeholder-gray-300 py-2 scrollbar-none"
            placeholder="Type to write a message"
          />
          <button
            onClick={sendMessage}
            className="h-10 px-4 bg-[#0e78f8] text-black rounded-2xl font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
