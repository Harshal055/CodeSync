import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    arrayUnion,
    arrayRemove,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    where
} from "firebase/firestore";
import {
    ref,
    set,
    get,
    onValue,
    push,
    onDisconnect,
    remove,
    update
} from "firebase/database";
import { db, rtdb, auth } from "./firebaseConfig";

// --- Room Management ---

export const getRoomDetails = async (roomId) => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    return roomSnap.exists() ? roomSnap.data() : null;
};


export const joinRoom = async (roomId, user) => {
    if (!user || !roomId) return { success: false, error: "Invalid data" };

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    let role = "editor"; // Default role

    if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        if (roomData.isLocked && roomData.ownerId !== user.uid) {
            return { success: false, error: "Room is locked by the owner." };
        }

        // Check Max Users (from RTDB for real-time accuracy)
        const participantsRef = ref(rtdb, `rooms/${roomId}/participants`);
        const snapshot = await get(participantsRef);
        if (snapshot.exists()) {
            const count = snapshot.size; // .size works on DataSnapshot? No, checking numChildren()
            if (snapshot.numChildren() >= (roomData.maxUsers || 50)) {
                return { success: false, error: "Room is full." };
            }
        }

    } else {
        // Create room if it doesn't exist (automatically becomes owner)
        role = "owner";
        await setDoc(roomRef, {
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            isLocked: false,
            maxUsers: 50, // Default limit
            type: "public"
        });
    }

    const userId = user.uid || user.socketId;
    const userRef = doc(db, "rooms", roomId, "participants", userId);

    // Check if user already has a role (re-joining)
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        role = userSnap.data().role || role;
    }

    // Add/Update user in participants subcollection (Firestore)
    await setDoc(userRef, {
        name: user.name,
        micOn: user.micOn || false,
        joinedAt: serverTimestamp(),
        role: role
    }, { merge: true });

    // Presence system (RTDB)
    const presenceRef = ref(rtdb, `rooms/${roomId}/participants/${userId}`);
    await set(presenceRef, {
        name: user.name,
        online: true,
        userId: user.uid,
        role: role
    });
    onDisconnect(presenceRef).remove();
    return { success: true, role };
};

export const updateUserRole = async (roomId, userId, newRole) => {
    // Update Firestore
    const userRef = doc(db, "rooms", roomId, "participants", userId);
    await updateDoc(userRef, { role: newRole });

    // Update RTDB
    const presenceRef = ref(rtdb, `rooms/${roomId}/participants/${userId}`);
    await update(presenceRef, { role: newRole });
};

export const kickUser = async (roomId, userId) => {
    const presenceRef = ref(rtdb, `rooms/${roomId}/participants/${userId}`);
    await remove(presenceRef);
};

export const toggleRoomLock = async (roomId, isLocked) => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { isLocked });
};

export const leaveRoom = async (roomId, userId) => {
    if (!roomId || !userId) return;

    // Remove from Firestore (optional, maybe keep record?)
    // Let's keep record but mark offline (managed by RTDB mostly).
    // Actually, joinRoom sets online: true in RTDB.
    // We can remove from RTDB.
    const presenceRef = ref(rtdb, `rooms/${roomId}/participants/${userId}`);
    await remove(presenceRef);
};

export const subscribeToParticipants = (roomId, callback) => {
    // Use RTDB for real-time presence (faster/cheaper for online status)
    const presenceRef = ref(rtdb, `rooms/${roomId}/participants`);
    return onValue(presenceRef, (snapshot) => {
        const data = snapshot.val();
        const participants = data ? Object.keys(data).map(key => ({ ...data[key], socketId: key })) : [];
        callback(participants);
    });
};

// --- Code Sync (RTDB for low latency) ---

export const updateCode = (roomId, fileId, code) => {
    const codeRef = ref(rtdb, `rooms/${roomId}/files/${fileId}/code`);
    set(codeRef, code); // Overwrite code
};

export const subscribeToCode = (roomId, fileId, callback) => {
    const codeRef = ref(rtdb, `rooms/${roomId}/files/${fileId}/code`);
    return onValue(codeRef, (snapshot) => {
        const code = snapshot.val();
        if (code !== null) callback(code);
    });
};

export const updateFileSelection = (roomId, userId, fileId) => {
    // Track who is editing what
    const userSelectionRef = ref(rtdb, `rooms/${roomId}/participants/${userId}/currentFile`);
    set(userSelectionRef, fileId);
};

// --- Chat (Firestore) ---

export const sendChatMessage = async (roomId, user, message) => {
    const chatRef = collection(db, "rooms", roomId, "messages");
    await addDoc(chatRef, {
        userName: user.name,
        userId: user.uid,
        message,
        time: new Date().toISOString(),
        createdAt: serverTimestamp()
    });
};

export const subscribeToChat = (roomId, callback) => {
    const chatRef = collection(db, "rooms", roomId, "messages");
    const q = query(chatRef, orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(messages);
    });
};

// --- Folder/File Structure (Firestore) --- (Simplified for now)
// We might keep the folder structure in a single document if it's small, or subcollections.
// For now, let's assume folders are stored in `rooms/{roomId}/folders`
export const saveFolderStructure = async (roomId, folders) => {
    const roomRef = doc(db, "rooms", roomId);
    await setDoc(roomRef, { folders }, { merge: true });
};

export const subscribeToFolders = (roomId, callback) => {
    const roomRef = doc(db, "rooms", roomId);
    return onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data().folders || []);
        }
    });
};

// --- Terminal (Piston API) ---
export const runCodePiston = async (language, code, stdin = "") => {
    const versionMap = {
        "javascript": { language: "javascript", version: "18.15.0" }, // Node
        "python": { language: "python", version: "3.10.0" },
        "java": { language: "java", version: "15.0.2" },
        "cpp": { language: "c++", version: "10.2.0" },
        "typescript": { language: "typescript", version: "5.0.3" },
    };

    const langConfig = versionMap[language] || versionMap["javascript"];

    try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: langConfig.language,
                version: langConfig.version,
                files: [{ content: code }],
                stdin: stdin
            })
        });
        const data = await response.json();
        return data.run; // { stdout, stderr, code, signal }
    } catch (error) {
        return { stderr: "Failed to execute code: " + error.message };
    }
};
// --- Version Control (Firestore) ---

export const saveFileVersion = async (roomId, fileId, code, user, type = "auto", label = "") => {
    if (!roomId || !fileId) return;
    const versionsRef = collection(db, "rooms", roomId, "fileVersions", fileId, "versions");
    await addDoc(versionsRef, {
        code,
        timestamp: serverTimestamp(),
        authorName: user.name || "Unknown",
        authorId: user.uid,
        type, // 'auto' or 'manual'
        label
    });
};

export const subscribeToFileVersions = (roomId, fileId, callback) => {
    if (!roomId || !fileId) return () => { };
    const versionsRef = collection(db, "rooms", roomId, "fileVersions", fileId, "versions");
    const q = query(versionsRef, orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
        const versions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() // Convert Firestore timestamp to JS Date
        }));
        callback(versions);
    });
};

// --- Cursors (RTDB) ---

export const updateCursorPosition = (roomId, userId, cursorData) => {
    // cursorData: { fileId, lineNumber, column, userName, color }
    const cursorRef = ref(rtdb, `rooms/${roomId}/cursors/${userId}`);
    set(cursorRef, cursorData);
    onDisconnect(cursorRef).remove();
};

export const subscribeToCursors = (roomId, callback) => {
    const cursorsRef = ref(rtdb, `rooms/${roomId}/cursors`);
    return onValue(cursorsRef, (snapshot) => {
        const data = snapshot.val();
        const cursors = data ? Object.keys(data).map(key => ({ userId: key, ...data[key] })) : [];
        callback(cursors);
    });
};

// --- Whiteboard (RTDB) ---

export const updateWhiteboard = (roomId, pathData) => {
    // pathData: { points: [{x,y},...], color, width }
    const pathsRef = ref(rtdb, `rooms/${roomId}/whiteboard`);
    push(pathsRef, pathData);
};

export const subscribeToWhiteboard = (roomId, callback) => {
    const pathsRef = ref(rtdb, `rooms/${roomId}/whiteboard`);
    return onValue(pathsRef, (snapshot) => {
        const data = snapshot.val();
        const paths = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        callback(paths);
    });
};

export const clearWhiteboard = (roomId) => {
    const pathsRef = ref(rtdb, `rooms/${roomId}/whiteboard`);
    remove(pathsRef);
};

export const toggleMicStatus = async (roomId, userId, micOn) => {
    // Update RTDB (Critical for real-time)
    const presenceRef = ref(rtdb, `rooms/${roomId}/participants/${userId}`);
    await update(presenceRef, { micOn });
};
