const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const http = require("http");
const { Server } = require("socket.io");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app
const io = new Server(server, {         // Attach Socket.IO to the HTTP server
  cors: {
    origin: "http://localhost:5173", // Allow frontend origin
    methods: ["GET", "POST"],
  },
});

// Enable CORS for all routes (replace "*" with your frontend URL in production)
app.use(cors({
  origin: 'http://localhost:5173', // Allow your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Make sure POST is allowed
  credentials: true // If needed
}));

app.use(express.json());
// --- Database Setup ---
// Connect to MongoDB 
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: {type:String, unique:true,required: true},
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// --- Authentication Routes ---
// Signup
app.post("/signup", async (req, res) => { // Make the function async
  const { name, email, password } = req.body;
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds); // Await the hash result
    const newUser = new User({ name, email: email.toLowerCase(), passwordHash });
    await newUser.save(); // Also good practice to await the save operation
    res.json({ success: true, message: "Signup successful!" });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.name) {
      res.status(400).json({ success: false, message: "User name already in use." });
    } else if (error.code === 11000 && error.keyPattern.email) {
      res.status(400).json({ success: false, message: "Email already in use." });
    } else {
      res.status(500).json({ success: false, message: "An error occurred." });
    }
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect password." });

    res.json({
      success: true,
      userName: user.name,
      userEmail: user.email,
      redirectUrl: "/*"
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed. Please try again later." });
  }
});

// --- Proxy Route ---
// Proxy to Handle External API Requests
app.get("/api/dashboard/totalusers", async (req, res) => {
  try {
    const response = await fetch("https://sc.ecombullet.com/api/dashboard/totalusers");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to fetch data from external API" });
  }
});

// --- Real-time Collaboration Setup (Socket.IO) ---

// Directories for temporary files and logs
const tempDir = path.join(__dirname, "temp");
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// Log file paths
const promptsLog = path.join(logsDir, "prompts.log");
const inputsLog = path.join(logsDir, "inputs.log");
const outputsLog = path.join(logsDir, "outputs.log");

// Helper function to append data to a file
const logToFile = (filePath, data) =>
  fs.appendFileSync(filePath, data + "\n", "utf8");

// In-memory storage for room data and chat history
const rooms = new Map(); // roomId -> { hostId, hostSocketId, users: Map<socketId, {name, hostId, micOn}>, codeByFileId: Map, folders: [], files: Map, currentFolder, currentFileId }
const chatHistory = new Map(); // roomId -> array of messages

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  let currentRoom = null;
  let currentUser = null;
  let subprocess = null;
  let isWaitingForInput = false;
  // let outputBuffer = ""; // Not needed with current logic

  // --- Room Management ---
  socket.on(
    "join",
    ({ roomId, userName, fileId, folder, file, hostId, micOn }) => {
      console.log(
        `Joining Room: ${roomId}, User: ${userName}, File: ${fileId}`
      );

      // Leave previous room if any
      if (currentRoom && currentRoom !== roomId) {
        socket.leave(currentRoom);
        const prevRoom = rooms.get(currentRoom);
        if (prevRoom) {
          prevRoom.users.delete(socket.id);
          // Notify remaining users in the old room
          io.to(currentRoom).emit(
            "userJoined",
            Array.from(prevRoom.users.values())
          );
        }
      }

      currentRoom = roomId;
      currentUser = userName;
      socket.join(roomId);

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          hostId, // Persistent host identity
          hostSocketId: socket.id, // Track the initial host's socket
          users: new Map(),
          codeByFileId: new Map(),
          folders: [],
          files: new Map(),
          currentFolder: null,
          currentFileId: null,
        });
      }

      const room = rooms.get(roomId);
      room.users.set(socket.id, { name: userName, hostId, micOn });

      // Sync folder/file state for the new user
      // Send existing folder/file data if available in the room state
      if (room.folders.length > 0) {
         const filesArray = Array.from(room.files.values()).map(f => {
            const parentFolder = room.folders.find(fold => fold.file?.some(fileInFolder => fileInFolder.id === f.id));
            return { ...f, folderId: parentFolder?.id || null };
        });

        socket.emit("folderData", {
          folders: room.folders,
          files: filesArray,
          hostId: room.hostId,
          currentFileId: room.currentFileId,
        });

        // Send current code for the selected file
        if (room.currentFileId) {
          const currentCode = room.codeByFileId.get(room.currentFileId) || "";
          socket.emit("codeUpdate", { roomId, fileId: room.currentFileId, code: currentCode });
        }
      }
      // If the joining user is bringing initial folder data (likely the host)
      else if (folder) {
        room.currentFolder = folder;
        room.folders = [folder];
        room.currentFileId = fileId;

        if (folder?.file?.length) {
          folder.file.forEach((f) => {
            room.files.set(f.id, f);
            room.codeByFileId.set(f.id, f.code || ""); // Store initial code
          });
        }
         // Also store the specific file if provided separately
        if (file && fileId) {
            room.files.set(fileId, file);
            if(file.code && !room.codeByFileId.has(fileId)){
                 room.codeByFileId.set(fileId, file.code);
            }
        }

        // Broadcast the initial folder structure
        const filesArray = Array.from(room.files.values()).map(f => ({ ...f, folderId: folder.id })); // Assume single folder initially
        io.to(roomId).emit("folderData", {
          folders: room.folders,
          files: filesArray,
          hostId: room.hostId,
          currentFileId: room.currentFileId,
        });
      }

      // Send chat history
      if (chatHistory.has(roomId)) {
        socket.emit("chatHistory", chatHistory.get(roomId));
      }

      // Notify everyone in the room about the updated user list
      const clients = Array.from(room.users).map(([id, userObj]) => ({
        socketId: id,
        name: userObj.name,
        hostId: userObj.hostId,
        micOn: userObj.micOn,
      }));
      io.to(roomId).emit("userJoined", clients);
    }
  );

  socket.on("folderSelected", ({ roomId, folderId }) => {
    const room = rooms.get(roomId);
    if (room) {
      // Find the folder details (assuming it exists in room.folders)
      const selectedFolderData = room.folders.find(f => f.id === folderId);
      if (!selectedFolderData) return; // Folder not found

      room.currentFolder = selectedFolderData; // Store the folder object
      // Determine the first file or keep the current one if it belongs to the new folder
      let fileToSelect = room.currentFileId ? room.files.get(room.currentFileId) : null;
      if (!fileToSelect || !selectedFolderData.file?.some(f => f.id === fileToSelect.id)) {
          room.currentFileId = selectedFolderData.file?.[0]?.id || null;
      }

      io.to(roomId).emit("folderChanged", { folderId }); // Notify clients

      // Optionally re-broadcast full data if needed, or just the change
       const filesArray = Array.from(room.files.values()).map(f => {
            const parentFolder = room.folders.find(fold => fold.file?.some(fileInFolder => fileInFolder.id === f.id));
            return { ...f, folderId: parentFolder?.id || null };
        });
      io.to(roomId).emit("folderData", {
          folders: room.folders,
          files: filesArray,
          hostId: room.hostId,
          currentFileId: room.currentFileId
      });
    }
  });

  socket.on("fileSelected", ({ roomId, fileId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.currentFileId = fileId;
      io.to(roomId).emit("fileChanged", { fileId });

      // Send the current code for the newly selected file
      const code = room.codeByFileId.get(fileId) || "";
      io.to(roomId).emit("codeUpdate", { roomId, fileId, code });
    }
  });

  // Handle host broadcasting folder data (e.g., after opening a folder)
  socket.on("broadcastFolderData", ({ roomId, folders, files, hostId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Security check: Only the host can broadcast
    if (hostId !== room.hostId) {
      console.warn("⛔ Non-host tried to broadcast folder data");
      return;
    }

    const validFolders = folders.filter((f) => f?.id && f?.title);
    if (!validFolders.length) return;

    const mainFolder = validFolders[0]; // Assuming only one folder is broadcasted at a time

    // Update room state
    room.folders = validFolders;
    room.currentFolder = mainFolder;
    room.files.clear(); // Clear previous files
    room.codeByFileId.clear(); // Clear previous code

    files.forEach(file => {
        if (file?.id) {
            room.files.set(file.id, file);
            room.codeByFileId.set(file.id, file.code || "");
        }
    });

    // Determine initial file selection (e.g., first file)
    room.currentFileId = files?.[0]?.id || null;

    // Broadcast the updated state to all clients in the room
    const filesArray = Array.from(room.files.values()).map(f => ({ ...f, folderId: mainFolder.id }));
    io.to(roomId).emit("folderData", {
      folders: room.folders,
      files: filesArray,
      hostId: room.hostId,
      currentFileId: room.currentFileId,
    });
  });

  // --- Code Editing ---
  socket.on("codeChange", ({ roomId, fileId, code, cursor }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Ensure the change is for the currently active file in the room
    if (fileId !== room.currentFileId) {
      console.warn(`⚠️ Code change rejected for non-active file ${fileId} (active: ${room.currentFileId})`);
      return;
    }

    room.codeByFileId.set(fileId, code);
    // Broadcast to other clients in the room
    socket.to(roomId).emit("codeUpdate", { roomId, fileId, code, cursor });
  });

  socket.on("saveCode", ({ roomId, fileId, code }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    console.log(`💾 Save Code Broadcast: file ${fileId}`);
    room.codeByFileId.set(fileId, code);
    // Broadcast the saved state to all clients
    io.to(roomId).emit("savedCode", { fileId, code });
  });

  // --- Terminal Execution ---
  socket.on("clearOutput", ({ roomId }) => {
    io.to(roomId).emit("clearOutput"); // Broadcast clear command
  });

  socket.on("runCode", async ({ roomId, code, language }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Kill previous process if running
    if (subprocess) {
      try {
        subprocess.kill("SIGKILL");
      } catch (e) { console.error("Error killing subprocess:", e); }
      subprocess = null;
      isWaitingForInput = false;
    }

    const extensions = { javascript: "js", typescript: "ts", python: "py", java: "java", csharp: "cs", php: "php", cpp: "cpp" };
    const fileExt = extensions[language];

    if (!fileExt) {
      io.to(roomId).emit("codeOutput", { output: "Unsupported language.", waitingForInput: false });
      return;
    }

    let fileName = `temp_code_${socket.id}.${fileExt}`; // Unique filename per socket
    let filePath = path.join(tempDir, fileName);

    try {
      fs.writeFileSync(filePath, code, "utf8");

      let command, args;
      let compileProcess = null;
      let exePath = filePath; // Default for interpreted languages

      // --- Compilation Step (if necessary) ---
      if (language === "java") {
        const classNameMatch = code.match(/public\s+class\s+(\w+)/);
        const className = classNameMatch ? classNameMatch[1] : "Main";
        fileName = `${className}.java`; // Rename for Java convention
        filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, code); // Overwrite with correct filename
        compileProcess = spawn("javac", ["-d", tempDir, filePath]);
        exePath = className; // Class name to run
        command = "java";
        args = ["-cp", tempDir, exePath];
      } else if (language === "cpp") {
        exePath = path.join(tempDir, `temp_code_${socket.id}.exe`);
        compileProcess = spawn("g++", [filePath, "-o", exePath]);
        command = exePath;
        args = [];
      } else if (language === "csharp") {
        exePath = path.join(tempDir, `temp_code_${socket.id}.exe`);
        compileProcess = spawn("csc", [`/out:${exePath}`, filePath]);
        command = exePath;
        args = [];
      } else { // Interpreted languages
          command = {
              javascript: "node",
              typescript: "npx", // Assuming ts-node is available
              python: "python",
              php: "php"
          }[language];
          args = language === "typescript" ? ["ts-node", filePath] : language === "python" ? ["-u", filePath] : [filePath];
      }

      // Wait for compilation if needed
      if (compileProcess) {
        await new Promise((resolve, reject) => {
          let compileError = "";
          compileProcess.stderr.on('data', (data) => compileError += data.toString());
          compileProcess.on("close", (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`${language.toUpperCase()} compilation failed:\n${compileError}`));
            }
          });
        });
      }

      // --- Execution Step ---
      subprocess = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });

      subprocess.stdout.on("data", (data) => {
        const output = data.toString();
        // Basic check for input prompt (ends with : or ?) - might need refinement
        const isPrompt = /[:?]\s*$/.test(output);
        isWaitingForInput = isPrompt;
        logToFile(isPrompt ? promptsLog : outputsLog, output);
        io.to(roomId).emit("codeOutput", { output, waitingForInput: isPrompt });
      });

      subprocess.stderr.on("data", (err) => {
        io.to(roomId).emit("codeOutput", { output: "Error: " + err.toString(), waitingForInput: false });
      });

      subprocess.on("close", (code) => {
        isWaitingForInput = false;
        subprocess = null;
        io.to(roomId).emit("codeOutput", { output: `\nExecution finished with code ${code}.`, waitingForInput: false });

        // Cleanup temporary files
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if ((language === 'cpp' || language === 'csharp') && fs.existsSync(exePath)) fs.unlinkSync(exePath);
        if (language === 'java') {
            const classFilePath = path.join(tempDir, `${exePath}.class`);
            if(fs.existsSync(classFilePath)) fs.unlinkSync(classFilePath);
        }
      });

       subprocess.on("error", (err) => {
            console.error("Spawn error:", err);
            io.to(roomId).emit("codeOutput", { output: `Failed to start process: ${err.message}`, waitingForInput: false });
            isWaitingForInput = false;
            subprocess = null;
        });

    } catch (error) {
      console.error("Execution Error:", error);
      io.to(roomId).emit("codeOutput", { output: error.message || "An error occurred during execution.", waitingForInput: false });
      // Cleanup in case of error before spawn
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });

  socket.on("codeInput", ({ roomId, input }) => {
    if (subprocess && isWaitingForInput) {
      logToFile(inputsLog, input.trim());
      subprocess.stdin.write(input + "\n");
      // isWaitingForInput = false; // Assume process will output next prompt or finish
    } else {
        console.warn("Received codeInput but no process is waiting or running.");
    }
  });

  // Sync user input in terminal across clients
  socket.on("syncInput", ({ roomId, input }) => {
    socket.to(roomId).emit("syncInput", { input, sender: socket.id });
  });

  // Echo confirmed input to other clients
  socket.on("inputEcho", ({ roomId, input, sender }) => {
    socket.to(roomId).emit("inputEcho", { input, sender });
  });

  // --- Chat ---
  socket.on("chatMessage", ({ roomId, userName, message, time }) => {
    const msg = { userName, message, time };
    if (!chatHistory.has(roomId)) chatHistory.set(roomId, []);
    chatHistory.get(roomId).push(msg);
    io.to(roomId).emit("chatMessage", msg); // Broadcast to all in room
  });

  socket.on("chatFile", (data) => {
    io.to(data.roomId).emit("chatFile", data); // Broadcast file data
  });

  // --- Voice Chat Signaling (WebRTC) ---
  socket.on("toggleMic", ({ roomId, micOn }) => {
    const room = rooms.get(roomId);
    if (room && room.users.has(socket.id)) {
      room.users.get(socket.id).micOn = micOn;
      // Broadcast the mic status update to others in the room
      io.to(roomId).emit("micStatusUpdate", { socketId: socket.id, micOn });
    }
  });

  socket.on("webrtc-offer", ({ to, sdp }) => {
    io.to(to).emit("webrtc-offer", { from: socket.id, sdp });
  });

  socket.on("webrtc-answer", ({ to, sdp }) => {
    io.to(to).emit("webrtc-answer", { from: socket.id, sdp });
  });

  socket.on("webrtc-ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("webrtc-ice-candidate", { from: socket.id, candidate });
  });

  // --- Disconnect and Cleanup ---
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      room.users.delete(socket.id);

      // Notify remaining users
      const updatedClients = Array.from(room.users).map(([id, userObj]) => ({
        socketId: id, name: userObj.name, hostId: userObj.hostId, micOn: userObj.micOn,
      }));
      io.to(currentRoom).emit("userJoined", updatedClients);

      // Clean up room if empty
      if (room.users.size === 0) {
        console.log(`Room ${currentRoom} is empty, deleting.`);
        rooms.delete(currentRoom);
        chatHistory.delete(currentRoom); // Clear chat history for the room
      }
    }
    // Kill any running subprocess for the disconnected user
    if (subprocess) {
       try { subprocess.kill("SIGKILL"); } catch(e) {}
    }
  });

  socket.on("endMeeting", ({ roomId }) => {
    console.log("📢 Meeting ended by host in room:", roomId);
    const room = rooms.get(roomId);
    if (room) {
      // Notify all clients in the room that the meeting has ended
      io.to(roomId).emit("endMeeting");

      // Optional: Force disconnect sockets in the room
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
      if (socketsInRoom) {
          socketsInRoom.forEach(socketId => {
              const clientSocket = io.sockets.sockets.get(socketId);
              if (clientSocket) {
                  clientSocket.disconnect(true); // Force disconnect
              }
          });
      }

      // Clean up server state for the room
      rooms.delete(roomId);
      chatHistory.delete(roomId);
    }
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 8081;
// Use server.listen (the http server instance) instead of app.listen
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});