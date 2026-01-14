import { useState, useEffect, useContext } from "react";
import { UserContext } from "../Components/Terminal/UserContext";
import {
    joinRoom,
    leaveRoom,
    subscribeToParticipants,
    subscribeToFolders,
    subscribeToCode,
    updateCode,
    sendChatMessage,
    subscribeToChat,
    saveFolderStructure,
    updateFileSelection,
    kickUser,
    toggleRoomLock,
    getRoomDetails
} from "../firebaseService";
import toast from "react-hot-toast";

const useFirebaseRoom = (roomId, userId, userName) => {
    const [clients, setClients] = useState([]);
    const [messages, setMessages] = useState([]);
    const [remoteFolders, setRemoteFolders] = useState([]);
    const [currentCode, setCurrentCode] = useState("");
    const [roomDetails, setRoomDetails] = useState(null);
    const { folderFeatures } = useContext(UserContext);

    // Join Room & Subscribe to Participants
    useEffect(() => {
        if (!roomId || !userId) return;

        // Join
        joinRoom(roomId, { uid: userId, name: userName, micOn: false }).then((res) => {
            if (res && !res.success) {
                toast.error(res.error);
                // Optionally redirect or handle error
                window.location.href = "/";
            }
        });

        // Get initial room details (owner, etc.) - Consider subscribing if lock status changes dynamically
        getRoomDetails(roomId).then(details => setRoomDetails(details));

        const unsubscribeParticipants = subscribeToParticipants(roomId, (data) => {
            setClients(data);

            // Auto-kick check
            // If we have data (room exists) and user is NOT in it, and we thought we were joined...
            // Actually, `data` might be empty initially. 
            // Better logic: if we were in the list, and now we are not.
            // Simplified: If the user is kicked, their presence is removed. 
            // The client needs to handle "am I still allowed here?"

            // For now, if the user was kicked, the `joinRoom` set up `onDisconnect`, so it removed them on close.
            // If another user removes them, this listener fires.
            // If I am not in `data` but I should be...
            const amIInRoom = data.some(c => c.socketId === userId);
            if (data.length > 0 && !amIInRoom) {
                // Potentially kicked
                // But wait, `joinRoom` is async. We might not be in the list YET.
                // Let's rely on a specific "kicked" signal or just robust access checks.
            }
        });

        const unsubscribeFolders = subscribeToFolders(roomId, (folders) => {
            setRemoteFolders(folders);
            // Sync to local context if needed
            if (folders.length > 0) {
                folderFeatures.syncFromRemote(folders, [], true);
            }
        });

        const unsubscribeChat = subscribeToChat(roomId, (msgs) => {
            setMessages(msgs);
        });

        // Cleanup
        return () => {
            leaveRoom(roomId, userId);
            // unsubscribeParticipants(); // handled by firebase/off usually, but here we return unsubscribe functions
            unsubscribeParticipants();
            unsubscribeFolders();
            unsubscribeChat();
        };
    }, [roomId, userId]);

    return {
        clients,
        messages,
        remoteFolders,
        roomDetails,
        sendChatMessage: (msg) => sendChatMessage(roomId, { uid: userId, name: userName }, msg),
        updateCode: (fileId, code) => updateCode(roomId, fileId, code),
        saveFolders: (folders) => saveFolderStructure(roomId, folders),
        subscribeToCode: (fileId, cb) => subscribeToCode(roomId, fileId, cb),
        kickUser: (targetUserId) => kickUser(roomId, targetUserId),
        toggleRoomLock: (isLocked) => toggleRoomLock(roomId, isLocked)
    };
};

export default useFirebaseRoom;
