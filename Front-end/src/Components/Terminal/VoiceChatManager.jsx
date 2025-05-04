// src/components/VoiceChatManager.jsx
import React from "react";

const VoiceChatManager = ({ clients }) => {
  return (
    <>
      {clients.map((client) => (
        <audio
          key={client.socketId}
          id={`audio-${client.socketId}`}
          autoPlay
          playsInline
        />
      ))}
    </>
  );
};

export default VoiceChatManager;
