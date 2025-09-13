import { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "./UserContext";
import "./terminal.css";
import socket from "./socket";

const Terminal = ({
  folderId,
  file,
  outputText,
  setOutputText,
  ws,
  setWs,
  isWaitingForInput,
  setIsWaitingForInput,
  userInput,
  setUserInput,
  roomId,
}) => {
  {
    /* Socket connection is provided via the shared socket.io client import (see ./socket).
       The old raw WebSocket client (ws://localhost:5000) was removed to avoid hard-coded URLs.
    */
  }
  useEffect(() => {
    socket.on("codeOutput", ({ output, waitingForInput }) => {
      setOutputText((prev) => {
        return prev + (prev ? "\n" : "") + output;
      });
  
      // ✅ When waiting for input, reset the userInput
      if (waitingForInput) {
        setUserInput(""); // 👈 this line is the fix
      }
  
      setIsWaitingForInput(waitingForInput ?? false);
    });
  
    return () => socket.off("codeOutput");
  }, []);
  

  useEffect(() => {
    socket.on("syncInput", ({ input, sender }) => {
      if (sender !== socket.id) {
        setUserInput(input);
      }
    });

    return () => socket.off("syncInput");
  }, []);

  useEffect(() => {
    socket.on("inputEcho", ({ input, sender }) => {
      if (sender === socket.id) return;
  
      setOutputText((prev) => prev + "\n" + input);
    });
  
    return () => socket.off("inputEcho");
  }, []);
  
  useEffect(() => {
    socket.on("clearOutput", () => {
      setOutputText(""); // ✅ Clear all clients' terminal
    });
  
    return () => socket.off("clearOutput");
  }, []);  

  const { folderFeatures } = useContext(UserContext);
  const folder = folderFeatures.getFolderById(folderId);

  const folderPath = folder ? `${folder.title}` : "";
  const filePath = file ? (
    <span className="text-blue-400">\{file.title}</span>
  ) : (
    ""
  );
  const symbol = folder || file ? ">" : "";

  const fullPath = (
    <div className="text-green-400 font-mono">
      {folderPath}
      {filePath}
      {symbol}
    </div>
  );

  {
    /*const handleUserInput = (e) => {
    if (e.key === "Enter" && userInput.trim() !== "") {
      e.preventDefault();
      console.log("✏️ Sending Input:", userInput);
      ws.send(JSON.stringify({ input: userInput.trim() }));

      setOutputText((prev) => {
        let lines = prev.split("\n");

        if (isWaitingForInput && lines.length > 0) {
          lines[lines.length - 1] += " " + userInput.trim();
        } else {
          lines.push(userInput.trim());
        }

        return lines.join("\n");
      });

      setUserInput("");
      setIsWaitingForInput(false);
    }
  };

  const handleUserInput = (e) => {
    if (e.key === "Enter" && userInput.trim()) {
      e.preventDefault();

      if (userInput.trim()) {
        socket.emit("codeInput", {
          roomId,
          input: userInput.trim(),
        });

        // Only append locally — not broadcasted
        setOutputText((prev) => prev + "\n" + userInput.trim());

        setUserInput("");
        setIsWaitingForInput(false);
      }
    }
  }; */
  }

  return (
    <div className="h-full flex flex-col pl-2 pt-.5 pb-2 pr-1 mb-4">
      {fullPath}

      <textarea
        value={
          isWaitingForInput
            ? (() => {
                const lines = outputText.split("\n");
                const last = lines.pop();
                return [...lines, last + userInput].join("\n");
              })()
            : outputText
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" && userInput.trim()) {
            e.preventDefault();
        
            const input = userInput.trim();
        
            // 1. Emit to backend (it will handle prompt and next line)
            socket.emit("codeInput", {
              roomId,
              input,
            });
        
            // 2. Echo *only input*, not prompt, locally
            setOutputText((prev) => prev + "\n" + input);
        
            // 3. Broadcast to others to echo just the input, not full prompt again
            socket.emit("inputEcho", {
              roomId,
              input,
              sender: socket.id,
            });
        
            setUserInput("");
            setIsWaitingForInput(false);
          }
        }}
          
        onChange={(e) => {
          if (!isWaitingForInput) return;

          const fullText = e.target.value;
          const lines = fullText.split("\n");
          const typedLine = lines[lines.length - 1];
          const promptLine = outputText.split("\n").pop() || "";

          const input = typedLine.slice(promptLine.length);
          setUserInput(input);

          socket.emit("syncInput", {
            roomId,
            input,
            sender: socket.id,
          });
        }}
        className="scroll-hover custom-scroll transition-all duration-300 ease-in-out flex-1 w-full resize-none bg-[#121212] outline-none text-stone-200 font-mono overflow-auto"
        style={{ minHeight: "100%" }}
      />
    </div>
  );
};

export default Terminal;
