import React, { useContext, useEffect, useRef, useState } from "react";
import {
  MdOutlinePublishedWithChanges,
  MdDownload,
  MdFullscreen,
  MdFullscreenExit,
} from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import Editor from "@monaco-editor/react";
import { UserContext } from "./UserContext";
import socket from "./socket";


export const EditorContainer = ({
  file,
  closeFile,
  folderId,
  onFullScreen,
  isFullScreen,
  ws,
  setOutputText,
  setIsWaitingForInput,
  roomId,
  
}) => {
  const { folderFeatures } = useContext(UserContext);
  const codeRef = useRef(file?.code || "");
  const [isSaved, setIsSaved] = useState(true);
  const editorRef = useRef(null); // Stores Monaco editor instance
  const pendingCodeRef = useRef(null);
  const lastSentCode = useRef("");
  let debounceTimer;

  useEffect(() => {
    codeRef.current = file?.code || "";
  }, [file]);

  const onChangeCode = (newCode) => {
    if (!file?.id) return; // Safety check only
  
    codeRef.current = newCode;
    setIsSaved(false);
    console.log("✏️ Emitting codeChange:", roomId, file?.id, newCode);
  
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (editorRef.current) {
        const position = editorRef.current.getPosition();
        socket.emit("codeChange", {
          roomId,
          fileId: file.id,
          code: newCode,
          cursor: position, // 👈
        });
        lastSentCode.current = newCode;
      }
    }, 600); // Maybe reduce to 800ms now
  };  

  useEffect(() => {
    if (!socket) return;
  
    const handleIncomingCode = ({ roomId: incomingRoomId, fileId, code, cursor }) => {
      if (incomingRoomId !== roomId) return;
    
      const fileToUpdate = folderFeatures.getFileById(fileId);
      if (fileToUpdate) {
        fileToUpdate.code = code;
        localStorage.setItem("folderData", JSON.stringify(folderFeatures.folders));
      }
    
      if (file?.id === fileId && editorRef.current) {
        const editor = editorRef.current;
        const currentCode = editor.getValue();
    
        if (code === lastSentCode.current) {
          console.log("⚡ Skipping update because it's our own sent code.");
          return;
        }
    
        if (currentCode !== code) {
          editor.setValue(code);
    
          if (cursor) {
            editor.setPosition(cursor); // 🔥 NEW: Apply sender's cursor
          }
          editor.focus();
          codeRef.current = code;
        }
      }
    };
    
  
    socket.on("codeUpdate", handleIncomingCode);
    socket.on("savedCode", handleIncomingCode);
  
    return () => {
      socket.off("codeUpdate", handleIncomingCode);
      socket.off("savedCode", handleIncomingCode);
    };
  }, [roomId, file?.id]);
  

  {/*useEffect(() => {
    if (roomId && file?.id && editorRef.current) {
      const currentCode = editorRef.current.getValue();
      console.log("📤 Syncing code on mount:", currentCode);
      socket.emit("codeChange", { roomId, fileId: file.id, code: currentCode });
    }
  }, [file?.id]);*/}

  const exportCode = () => {
    const codeValue = codeRef.current?.trim();

    if (!codeValue) {
      alert("Please Type Some Code in the Editor Before Exporting");
      return; // Stop execution if no code is written
    }

    // Create a blob from the code
    const codeBlob = new Blob([codeValue], {
      type: file?.type || "text/plain",
    });

    // Create a URL for the blob
    const downloadUrl = URL.createObjectURL(codeBlob);

    // Create a temporary download link
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = file?.title;

    // Append link to body, trigger click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the created URL
    URL.revokeObjectURL(downloadUrl);
  };

  const onSaveCode = () => {
    if (!file?.id || !roomId) return;
  
    folderFeatures.saveCode(file.id, folderId, codeRef.current);
    setIsSaved(true);
  
    // 🔥 Broadcast to all clients
    socket.emit("saveCode", {
      roomId,
      fileId: file.id,
      code: codeRef.current,
    });
  };

  useEffect(() => {
    if (!socket) return;
  
    socket.on("savedCode", ({ fileId, code }) => {
      console.log("💾 Received Saved Code:", fileId);
  
      const fileToUpdate = folderFeatures.getFileById(fileId);
      if (fileToUpdate) {
        fileToUpdate.code = code; // ✅ Update file code
        localStorage.setItem("folderData", JSON.stringify(folderFeatures.folders)); // ✅ Update localStorage
      }
  
      if (file?.id === fileId && editorRef.current) {
        const currentCode = editorRef.current.getValue();
        if (currentCode !== code) {
          editorRef.current.setValue(code);
          codeRef.current = code;
        }
  
        setIsSaved(true); // ✅ ADD THIS LINE → set editor as "Saved"
      }
    });
  
    return () => socket.off("savedCode");
  }, [roomId, file?.id]);
  

  // Auto-save code with debounce effect
  useEffect(() => {
    if (!file) return;

    let didFileChange = true; // Track if the file has changed (like renaming)

    const timeout = setTimeout(() => {
      if (!didFileChange) {
        folderFeatures.saveCode(file?.id, folderId, codeRef.current);
        setIsSaved(true);
      }
      didFileChange = false; // Reset after skipping initial save on file change
    }, 1000);

    return () => {
      didFileChange = false;
      clearTimeout(timeout);
    };
  }, [file?.id, folderId, folderFeatures]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  
    if (pendingCodeRef.current) {
      editor.setValue(pendingCodeRef.current);
      pendingCodeRef.current = null;
    }
  
    
  };  

  useEffect(() => {
    if (roomId && file?.id) {
      const codeToSet = codeRef.current;
  
      if (editorRef.current) {
        editorRef.current.setValue(codeToSet);
      } else {
        pendingCodeRef.current = codeToSet;
      }
  
      // ✅ Emit codeChange so others also get the latest
      socket.emit("codeChange", {
        roomId,
        fileId: file.id,
        code: codeToSet,
      });
  
      // ✅ ADD THIS LINE → Important!
      socket.emit("fileSelected", { roomId, fileId: file.id }); // 👈 this triggers server to notify other clients
    }
  }, [file?.id]);    
    
  {/*const onRunCode = () => {
    if (!editorRef.current) {
      console.error("Editor instance is not available!");
      return;
    }

    const code = editorRef.current.getValue(); // Get live code from the editor
    const language = file?.language;

    runCode({ code, language });
    console.log("Running Code:", code, "Language:", language);
  };*/}

  {/*const runCode = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected");
      return;
    }
  
    const sourceCode = editorRef.current.getValue(); // Get code from Monaco Editor
    if (!sourceCode) {
      console.warn("No code provided!");
      return;
    }
  
    setOutputText(""); // Clear previous output
    setIsWaitingForInput(false);
  
    ws.send(
      JSON.stringify({
        language: file?.language, // Ensure this is set properly
        code: sourceCode,
      })
    );
  };*/}

  const runCode = () => {
    const code = editorRef.current.getValue();
    if (!code || !file?.language) return;
  
    setOutputText("");
    setIsWaitingForInput(false);
  
    socket.emit("clearOutput", { roomId }); // 🔥 NEW
    socket.emit("runCode", {
      roomId,
      code,
      language: file.language,
    });
  };  
  

  function handleEditorWillMount(monaco) {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark", // Base theme (can be "vs", "vs-dark", or "hc-black")
      inherit: true, // Inherit base theme properties
      rules: [], // Syntax highlighting rules (optional)
      colors: {
        "editor.background": "#121212", // Set background color
        "editor.lineHighlightBackground": "#33333350", // Current line highlight
        "editorLineNumber.foreground": "#888888", // Default line numbers
        "editorLineNumber.activeForeground": "#ffffff", // Active line number
      },
    });
  }

  const getIcon = {
    SiJavascript: <img src="/src/assets/javascript.svg" className="w-5" />,
    FaJava: <img src="/src/assets/java.svg" className="w-5" />,
    TbBrandCpp: <img src="/src/assets/cpp.svg" className="h-3 ml-0.5" />,
    SiPython: <img src="/src/assets/python.svg" className="w-5" />,
    FaFile: <img src="/src/assets/document.svg" className="w-5" />,
  };

  if (!file) {
    return (
      <div className="flex flex-col h-full">
        <header className="h-10 flex items-center justify-between font-medium border-b border-[#333333] px-2 py-1.5">
          <span className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-sm ">
            <span>Welcome to </span>
            <img src="/src/assets/logo.png" className="w-6" alt="Logo" />
            <span className="text-slate-200 font-semibold">Code</span>
            <span className="text-[#f8b101] font-bold">Sync</span>{" "}
          </span>
          <span onClick={onFullScreen}>
            {isFullScreen ? (
              <MdFullscreenExit
                size={25}
                className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
              />
            ) : (
              <MdFullscreen
                size={25}
                className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
              />
            )}
          </span>
        </header>
        <div className="h-full flex items-center justify-center text-gray-400">
          No File Open..!
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="h-10 flex justify-between font-medium rounded-t-md border-b border-[#333333] px-2 py-1.5">
        <span className="flex items-center justify-center bg-[#282828] gap-1 px-1.5 py-1 rounded-sm ">
          {getIcon[file?.icon]}
          <h1>{file?.title}</h1>
          <span
            className={`w-2 h-2 mx-0.5 rounded-full ${
              isSaved ? "w-0 h-0 mx-0" : "bg-gray-600"
            }`}
          ></span>
          <MdClear
            size={19}
            className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
            onClick={closeFile}
          />
        </span>
        <span className="flex items-center gap-3 pr-1\1">
          <FaPlay
            size={16}
            onClick={runCode}
            className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
          />
          <MdOutlinePublishedWithChanges
            size={20}
            onClick={onSaveCode}
            className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
          />
          <MdDownload
            size={22}
            onClick={exportCode}
            className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
          />
          <span onClick={onFullScreen} className="ml-[-5px]">
            {isFullScreen ? (
              <MdFullscreenExit
                size={25}
                className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
              />
            ) : (
              <MdFullscreen
                size={25}
                className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
              />
            )}
          </span>
        </span>
      </header>

      <section className="flex-1 py-2 px-1 rounded-b-md">
        <Editor
          key={file?.id}
          height={"100%"}
          language={file?.language}
          theme="custom-dark"
          beforeMount={handleEditorWillMount}
          value={codeRef.current}
          onChange={onChangeCode}
          onMount={handleEditorMount} // Attach the onMount event
        />
      </section>
    </div>
  );
};
