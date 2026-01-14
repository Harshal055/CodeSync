import { useState, useCallback } from 'react';
import { toggleMicStatus } from '../firebaseService';
import toast from 'react-hot-toast';

const useVoiceChat = (roomId, userId) => {
  const [isMicOn, setIsMicOn] = useState(false);

  const toggleMic = useCallback(async () => {
    if (!roomId || !userId) return;

    const newStatus = !isMicOn;
    setIsMicOn(newStatus);

    try {
      await toggleMicStatus(roomId, userId, newStatus);
      toast.success(newStatus ? "Microphone On" : "Microphone Off");
    } catch (error) {
      console.error("Failed to toggle mic:", error);
      setIsMicOn(!newStatus); // Revert on error
      toast.error("Failed to toggle microphone");
    }
  }, [roomId, userId, isMicOn]);

  return {
    isMicOn,
    toggleMic
  };
};

export default useVoiceChat;
