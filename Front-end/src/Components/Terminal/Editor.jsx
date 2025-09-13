import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import {
  FaBars,
  FaFolderOpen,
  FaPen,
  FaUser,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";
import { FaFolder } from "react-icons/fa6";
import { AiFillMessage } from "react-icons/ai";
import FileExplorer from "./FileExplorer";
import "../../App.css";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ChatParticipants from "./ChatParticipants";
import { Modal } from "./Modal";
import { ModalContext, modalConstants } from "./ModalContext";
import { EditorContainer } from "./EditorContainer";
import { UserContext } from "./UserContext";
import { makeSubmission } from "./service";
import Terminal from "./Terminal";
import { MdClear } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import toast from "react-hot-toast";
import socket from "./socket";
import { useLocation } from "react-router-dom";
import useVoiceChat from "../../Hooks/useVoiceChat";
import VoiceChatManager from "./VoiceChatManager";

const Editor = () => {
  const { roomId, folderId } = useParams();
  const { folderFeatures } = useContext(UserContext);
  const location = useLocation();

  // Load selected folder from sessionStorage or default to folderId
  const [selectedFolder, setSelectedFolder] = useState(
    () => sessionStorage.getItem("selectedFolder") || folderId || null
  );

  const [newFolderId, setNewFolderId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(
    () =>
      JSON.parse(sessionStorage.getItem(`selectedFile_${selectedFolder}`)) ||
      null
  );

  const file = selectedFile ? folderFeatures.getFileById(selectedFile) : null;

  useEffect(() => {
    if (newFolderId) {
      setSelectedFolder(newFolderId);
      sessionStorage.setItem("selectedFolder", newFolderId);
      setSelectedFile(null); // Reset selected file when a new folder is opened
      sessionStorage.removeItem(`selectedFile_${selectedFolder}`);
      setNewFolderId(null);
    } else if (selectedFolder) {
      sessionStorage.setItem("selectedFolder", selectedFolder);
    }
  }, [selectedFolder, newFolderId]);

  // Save and retrieve the selected file
  useEffect(() => {
    if (selectedFile) {
      sessionStorage.setItem(
        `selectedFile_${selectedFolder}`,
        JSON.stringify(selectedFile)
      );
    }
  }, [selectedFile, selectedFolder]);

  // Clear sessionStorage on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("selectedFolder");
      sessionStorage.removeItem(`selectedFile_${selectedFolder}`);
    };
  }, [selectedFolder]);

  // Clear sessionStorage when the file is closed
  const closeFile = () => {
    setSelectedFile(null);
    sessionStorage.removeItem(`selectedFile_${selectedFolder}`); // Remove the selected file from sessionStorage
  };

  const modalFeatures = useContext(ModalContext);
  const [isCreating, setIsCreating] = useState(false);
  const [openDropDown, setOpenDropDown] = useState(null);
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const [chatTabIndex, setChatTabIndex] = useState(0);
  const [activeItem, setActiveItem] = useState(null);
  const [justOpenedPopup, setJustOpenedPopup] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isMediumScreen, setIsMediumScreen] = useState(
    window.innerWidth < 1024
  );
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(true);
  const [isTerminalOpen, setIsOpenTerminal] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hostId] = useState(() => {
    const existing = localStorage.getItem("hostId");
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem("hostId", newId);
    return newId;
  });

  const [remoteHostId, setRemoteHostId] = useState(null);
  const Host = hostId === remoteHostId;

  //const [input, setInput] = useState("");
  //const [output, setOutput] = useState("");

  const [outputText, setOutputText] = useState("");
  const [ws, setWs] = useState(null);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [clients, setClients] = useState([]);
  const [micOn, setMicOn] = useState(() => {
    const saved = sessionStorage.getItem("micOn");
    return saved ? JSON.parse(saved) : false; // default ON
  });

  const toggleMic = () => {
    const newMic = !micOn;
    setMicOn(newMic);
    sessionStorage.setItem("micOn", JSON.stringify(newMic));

    socket.emit("toggleMic", {
      roomId,
      micOn: newMic,
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("userJoined", (newClients) => {
      if (newClients.length > clients.length) {
        const joinedClient = newClients.find(
          (c) => !clients.some((old) => old.socketId === c.socketId)
        );

        if (joinedClient && joinedClient.name) {
          toast.success(`${joinedClient.name} joined`);
        }
      }

      setClients(newClients);
    });

    return () => {
      socket.off("userJoined");
    };
  }, []);

  const fileExplorerRef = useRef(null);
  const popUpRef = useRef(null);
  const terminalRef = useRef(null);
  const { userData } = useContext(UserContext);
  const [userName, setUserName] = useState();

  useEffect(() => {
    if (userData.firstName && userData.lastName) {
      const fullName = `${userData.firstName} ${userData.lastName}`;
      setUserName(fullName);
      localStorage.setItem("userName", fullName); // ✅ Save for chat display
    } else if (location?.state?.userName) {
      setUserName(location.state.userName);
      localStorage.setItem("userName", location.state.userName); // ✅ Fallback
    }
  }, [userData, location]);

  useEffect(() => {
    if (!roomId || !userName) return;

    const folder = folderFeatures.getFolderById(selectedFolder);
    const fileToSend = file || {};

    const isInitialJoin = folder && fileToSend?.id;

    console.log("JOINING ROOM:", roomId, userName, hostId);
    socket.emit("join", {
      roomId,
      userName,
      hostId,
      fileId: isInitialJoin ? fileToSend.id : null,
      folder: isInitialJoin ? folder : null,
      file: isInitialJoin ? fileToSend : null,
      micOn,
    });

    // ✅ ADD: re-emit fileSelected to ensure visibility
    if (fileToSend?.id) {
      socket.emit("fileSelected", {
        roomId,
        fileId: fileToSend.id,
      });
    }
  }, [roomId, userName]);

  useEffect(() => {
    const isHost = localStorage.getItem("hostId") === hostId;
    if (!isHost || !roomId || !selectedFolder) return;

    const folder = folderFeatures.getFolderById(selectedFolder);
    if (!folder) return;

    const files = folder.file || [];

    console.log("📁 Auto broadcasting folder:", folder.title);

    socket.emit("folderSelected", { roomId, folderId: folder.id });

    socket.emit("broadcastFolderData", {
      roomId,
      folders: [folder],
      files: files.map((f) => ({ ...f, folderId: folder.id })),
      hostId,
    });
  }, [selectedFolder, hostId, roomId]);

  {
    /*useEffect(() => {
    if (!selectedFolder || !roomId || !hostId) return;
  
    if (socket.id !== hostId) return;
  
    const folder = folderFeatures.getFolderById(selectedFolder);
    if (!folder || !folder.id || !folder.title) return;
  
    const files = folder.files || [];
  
    socket.emit("folderSelected", { roomId, folderId: selectedFolder });
  
    socket.emit("broadcastFolderData", {
      roomId,
      folders: [folder],
      files,
    });
  
    if (!selectedFile && files.length) {
      const firstFile = files[0];
      setSelectedFile(firstFile.id);
    }
  }, [selectedFolder, roomId, hostId]);*/
  }

  useEffect(() => {
    socket.on("folderData", ({ folders, files, hostId }) => {
      setRemoteHostId(hostId);

      if (!folders?.length) return;

      const isHost = localStorage.getItem("hostId") === hostId;
      folderFeatures.syncFromRemote(folders, files, !isHost);

      const folder = folders[0];
      if (!folder || !folder.id) return;

      setSelectedFolder(folder.id);
      sessionStorage.setItem("selectedFolder", folder.id);

      if (folder.file && folder.file.length > 0) {
        const initialFileId = currentFileId || folder.file[0].id; // 👈 Prefer current
        setSelectedFile(initialFileId);
        sessionStorage.setItem(
          `selectedFile_${folder.id}`,
          JSON.stringify(initialFileId)
        );
        socket.emit("fileSelected", { roomId, fileId: initialFileId });
      } else {
        setSelectedFile(null);
        sessionStorage.removeItem(`selectedFile_${folder.id}`);
      }
    });

    return () => socket.off("folderData");
  }, []);

  useEffect(() => {
    if (selectedFile && roomId) {
      socket.emit("fileSelected", { roomId, fileId: selectedFile });
    }
  }, [selectedFile]);

  useEffect(() => {
    socket.on("folderChanged", ({ folderId }) => {
      console.log("🗂 Folder changed remotely:", folderId);
      setSelectedFolder(folderId);
      sessionStorage.setItem("selectedFolder", folderId);
    });

    socket.on("fileChanged", ({ fileId }) => {
      console.log("📄 File changed remotely:", fileId);
      // ✅ Prevent file reset from self-triggering on refresh
      if (socket.id === socket.io.engine.id) return;

      setSelectedFile(fileId);

      const file = folderFeatures.getFileById(fileId);
      if (file) {
        socket.emit("codeChange", {
          roomId,
          fileId: fileId,
          code: file.code || "",
        });
      }

      // ✅ Only set session if it's different (avoid overwriting user's choice on refresh)
      const stored = JSON.parse(
        sessionStorage.getItem(`selectedFile_${selectedFolder}`)
      );
      if (stored !== fileId) {
        sessionStorage.setItem(
          `selectedFile_${selectedFolder}`,
          JSON.stringify(fileId)
        );
      }
    });

    return () => {
      socket.off("folderChanged");
      socket.off("fileChanged");
    };
  }, [selectedFolder]);

  useEffect(() => {
    socket.on("endMeeting", () => {
      console.log("📢 Meeting ended. Cleaning up...");

      const lastFolderId = sessionStorage.getItem("selectedFolder");
      if (lastFolderId) {
        folderFeatures.removeFolderIfRemote(lastFolderId); // ❌ removes host's folder from client
      }

      sessionStorage.clear();
      setSelectedFolder(null);
      setSelectedFile(null);

      toast("📢 Meeting has ended.");
    });

    return () => socket.off("endMeeting");
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("micStatusUpdate", ({ socketId, micOn }) => {
      setClients((prev) =>
        prev.map((client) =>
          client.socketId === socketId ? { ...client, micOn } : client
        )
      );
    });

    return () => socket.off("micStatusUpdate");
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMediumScreen(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // On page load, check if medium screen and file explorer is open
    if (isMediumScreen && isFileExplorerOpen) {
      setIsFileExplorerOpen(true);
      setIsOpenPopup(false); // Ensure popup is closed on medium screen initially
    } else if (!isMediumScreen && isFileExplorerOpen) {
      setIsFileExplorerOpen(true);
      setIsOpenPopup(true);
    }
  }, [isMediumScreen]);

  useEffect(() => {
    if (!isFileExplorerOpen && !isOpenPopup && !isTerminalOpen) {
      setIsFullScreen(true); // Set full screen if all panels are collapsed
    } else {
      setIsFullScreen(false); // Reset full screen when any panel is opened
    }
  }, [isFileExplorerOpen, isOpenPopup, isTerminalOpen]);

  useEffect(() => {
    if (isOpenPopup && popUpRef.current) {
      popUpRef.current.resize((430 / window.innerWidth) * 100);
    }
  }, [isOpenPopup]);

  const OpenFileExplorer = (name) => {
    setActiveItem(name);
    if (fileExplorerRef.current) {
      if (isFileExplorerOpen) {
        fileExplorerRef.current.collapse();
        setIsFullScreen(true);
      } else {
        fileExplorerRef.current.expand();
        if (isMediumScreen) popUpRef.current.collapse(true);
        setIsFullScreen(false);
      }
      setIsFileExplorerOpen(!isFileExplorerOpen);
    }
  };

  const OpenPopup = (name) => {
    setActiveItem(name);
    if (popUpRef.current) {
      if (isOpenPopup) {
        popUpRef.current.collapse();
        setIsFullScreen(true);
      } else {
        popUpRef.current.expand();
        if (isMediumScreen) fileExplorerRef.current.collapse(true);
        setIsFullScreen(false);
      }
      setIsOpenPopup(!isOpenPopup);
    }
  };

  const OpenTerminal = () => {
    if (terminalRef.current) {
      if (isTerminalOpen) {
        terminalRef.current.collapse();
        setIsFullScreen(true);
      } else {
        terminalRef.current.expand();
        setIsFullScreen(false);
      }
      setIsOpenTerminal(!isTerminalOpen);
    }
  };

  const onFullScreen = () => {
    setIsFullScreen((prev) => {
      const newState = !prev;

      if (newState) {
        // Collapse both panels when entering full screen
        if (fileExplorerRef.current) fileExplorerRef.current.collapse();
        if (popUpRef.current) popUpRef.current.collapse();
        if (terminalRef.current) terminalRef.current.collapse();

        setIsFileExplorerOpen(false);
        setIsOpenPopup(false);
        setIsOpenTerminal(false);
      } else {
        // Expand both panels when exiting full screen
        if (isMediumScreen) {
          if (fileExplorerRef.current) fileExplorerRef.current.expand();
          if (terminalRef.current) terminalRef.current.expand();

          setIsFileExplorerOpen(true);
          setIsOpenTerminal(true);
        } else {
          if (fileExplorerRef.current) fileExplorerRef.current.expand();
          if (popUpRef.current) popUpRef.current.expand();
          if (terminalRef.current) terminalRef.current.expand();

          setIsFileExplorerOpen(true);
          setIsOpenPopup(true);
          setIsOpenTerminal(true);
        }
      }

      return newState;
    });
  };

  const handleClick = (name) => {
    setActiveItem(name);
  };

  const toggleDropdown = (name) => {
    setActiveItem(name);
    setOpenDropDown(!openDropDown);
  };

  const closeDropdown = () => {
    setOpenDropDown(false);
  };

  const handleSidenavClick = (target) => {
    if (popUpRef.current) {
      if (isOpenPopup && activeItem === target) {
        popUpRef.current.collapse();
        setIsOpenPopup(false);
        setActiveItem(null);
      } else {
        popUpRef.current.expand();
        setIsOpenPopup(true);
        setActiveItem(target);
        if (target === "user") setChatTabIndex(0);
        else if (target === "chat") setChatTabIndex(1);
        setJustOpenedPopup(true); // ✅ tell ChatParticipants this was just opened

        if (isMediumScreen && fileExplorerRef.current) {
          fileExplorerRef.current.collapse(true);
          setIsFileExplorerOpen(false);
        }
      }
    }
  };

  useEffect(() => {
    if (isOpenPopup) {
      const timeout = setTimeout(() => setJustOpenedPopup(false), 50);
      return () => clearTimeout(timeout);
    }
  }, [isOpenPopup]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownMenu = document.getElementById("dropdown-menu");
      if (dropdownMenu && !dropdownMenu.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onCreateFolderInput = () => {
    const isHost = localStorage.getItem("hostId") === remoteHostId;
    if (!isHost) {
      toast.error("Only the host can create folder.");
      return;
    }

    setIsCreating(true);
    modalFeatures.setModalPayLoad({ setNewFolderId });
    setOpenDropDown(false);
    setSelectedFile(null); // Reset selected file when creating a new folder
  };

  const openFolder = () => {
    // ✅ Only check if hostId is known
    const isHost = localStorage.getItem("hostId") === remoteHostId;
    if (!isHost) {
      toast.error("Only the host can open folders.");
      return;
    }

    modalFeatures.openModal(modalConstants.OPEN_FOLDER);

    modalFeatures.setModalPayLoad({
      setSelectedFolder: (folderId) => {
        const folder = folderFeatures.getFolderById(folderId);
        if (!folder) return;

        const files = folder.files || [];

        // 🔥 Broadcast right away, even with no files
        socket.emit("folderSelected", { roomId, folderId });

        socket.emit("broadcastFolderData", {
          roomId,
          folders: [folder],
          files: files.map((f) => ({ ...f, folderId: folder.id })), // attach folderId
          hostId,
        });
        setRemoteHostId(hostId);

        setSelectedFolder(folderId);
        sessionStorage.setItem("selectedFolder", folderId);

        if (files.length) {
          const firstFile = files[0];
          setSelectedFile(firstFile.id);
          sessionStorage.setItem(
            `selectedFile_${folderId}`,
            JSON.stringify(firstFile.id)
          );

          // ✅ ADD THIS (you may already have it)
          socket.emit("fileSelected", { roomId, fileId: firstFile.id });
        } else {
          setSelectedFile(null);
          sessionStorage.removeItem(`selectedFile_${folderId}`);
        }
      },
    });

    setOpenDropDown(false);
  };

  const copyRoomId = () => {
    if (!roomId) return toast.error("Room ID not found!");

    navigator.clipboard
      .writeText(roomId)
      .then(() => {
        setCopySuccess("Copied!");
        toast.success("Room ID copied!");

        setTimeout(() => setCopySuccess(""), 2000);
      })
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
        toast.error("Failed to copy Room ID.");
      });
  };

  {
    /*const callback = ({ apiStatus, data, message }) => {
    if (apiStatus === 'loading') {
      setOutput("Loading...");
    } else if (apiStatus === 'error') {
      setOutput(`Error: ${message || "Something went wrong"}`);
    } else if (apiStatus === 'success') {
      if (data?.status?.id === 3) {
        setOutput(atob(data.stdout));
      } else {
        setOutput(`Execution Error: ${atob(data.stderr)}`);
      }
    } else {
      setOutput("Unexpected response from server");
    }
  };
  

  const runCode = useCallback(({code, language}) => {
    makeSubmission({code, language, input, callback})
  }, [input])*/
  }

  const sidenav = [
    {
      icon: <FaBars size={24} />,
      name: "bars",
      functionToCall: toggleDropdown,
    },
    {
      icon: isFileExplorerOpen ? (
        <FaFolderOpen size={24} />
      ) : (
        <FaFolder size={24} />
      ),
      name: "folder",
      functionToCall: OpenFileExplorer,
    },
    {
      icon: (
        <div className="relative">
          <FaUser size={24} />
          {clients.length > 1 && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1.5 rounded-full">
              {clients.length}
            </span>
          )}
        </div>
      ),
      name: "user",
      functionToCall: handleSidenavClick,
    },
    {
      icon: (
        <div className="relative">
          <AiFillMessage size={24} />
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1.5 rounded-full">
              {unseenCount}
            </span>
          )}
        </div>
      ),
      name: "chat",
      functionToCall: handleSidenavClick,
    },

    {
      icon: <FaPen size={24} />,
      name: "pen",
      functionToCall: handleClick,
    },
  ];

  useVoiceChat({
    roomId,
    clients,
    micOn,
  });

  return (
    <>
      <Modal />
      <div className="bg-black h-screen p-2 flex flex-col gap-2">
        <header className="flex items-center gap-1 text-2xl px-1">
          <img src="/src/assets/logo.png" className="w-11" alt="Logo" />
          <span className="text-slate-200 font-semibold">Code</span>
          <span className="text-[#f8b101] font-bold">Sync</span>
        </header>

        <div className="flex flex-1 overflow-hidden h-full transition-all duration-500">
          <div className="w-16 bg-[#121212] text-[#b3b3b3] rounded-md py-3 space-y-2">
            {sidenav.map((route) => (
              <div
                key={route.name}
                onClick={() => route.functionToCall(route.name)}
                className={`cursor-pointer flex justify-center p-2 rounded-md mx-1  ${
                  activeItem === route.name
                    ? "bg-[#282828] transition-all ease-in-out duration-300 delay-100 text-[#f2f2f2]"
                    : "hover:text-[#f2f2f2] hover:bg-[#333333] transition-colors duration-300"
                }`}
              >
                {route.icon}
              </div>
            ))}
          </div>

          {openDropDown && (
            <div
              id="dropdown-menu"
              className="fixed z-50 left-20 top-16 text-[#f2f2f2] bg-[#121212] p-2 border border-[#333333] rounded-md"
            >
              <ul className="space-y-2">
                <li
                  onClick={onCreateFolderInput}
                  className="cursor-pointer px-5 py-0.5 border border-transparent hover:bg-[#333333] hover:border-[#444] rounded-md"
                >
                  New Folder
                </li>
                <li
                  onClick={openFolder}
                  className="cursor-pointer px-5 py-0.5 border border-transparent hover:bg-[#333333] hover:border-[#444] rounded-md"
                >
                  Open Folder
                </li>
                <li
                  onClick={OpenTerminal}
                  className="cursor-pointer px-5 py-0.5 border border-transparent hover:bg-[#333333] hover:border-[#444] rounded-md"
                >
                  {isTerminalOpen ? "Close Terminal" : "Open Terminal"}
                </li>
              </ul>
            </div>
          )}

          <PanelGroup
            direction="horizontal"
            className={`${isFileExplorerOpen ? "ml-[5px]" : ""}`}
          >
            <Panel
              ref={fileExplorerRef}
              defaultSize={(256 / window.innerWidth) * 100}
              minSize={(200 / window.innerWidth) * 100}
              collapsible
              maxSize={(380 / window.innerWidth) * 100}
              onCollapse={() => setIsFileExplorerOpen(false)}
              onExpand={() => setIsFileExplorerOpen(true)}
              className={`w-64 transition-[width] duration-300 ease-out overflow-hidden `}
            >
              <div className="bg-[#121212] h-full truncate text-slate-200 rounded-md">
                <FileExplorer
                  roomId={roomId}
                  folderId={folderId}
                  newFolderId={newFolderId}
                  setNewFolderId={setNewFolderId}
                  selectedFolder={selectedFolder}
                  setSelectedFolder={setSelectedFolder}
                  isCreating={isCreating}
                  setIsCreating={setIsCreating}
                  selectedFile={selectedFile} // 🔥 pass this
                  setSelectedFile={setSelectedFile}
                  Host={Host}
                  hostId={hostId}
                  setRemoteHostId={setRemoteHostId}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="group relative py-3 px-0.5">
              <div className="absolute inset-[-5px]"></div>{" "}
              <div className="w-[1px] h-full bg-transparent group-hover:bg-[#f2f2f2] group-active:bg-[#b3b3b3]"></div>
            </PanelResizeHandle>

            <Panel>
              <PanelGroup direction="vertical" id="group" className="h-full">
                <Panel defaultSize={70} minSize={20}>
                  <div className="bg-[#121212] h-full text-stone-200 rounded-md">
                    <EditorContainer
                      file={file}
                      closeFile={closeFile}
                      folderId={selectedFolder || newFolderId}
                      onFullScreen={onFullScreen}
                      isFullScreen={isFullScreen}
                      ws={ws}
                      setOutputText={setOutputText}
                      setIsWaitingForInput={setIsWaitingForInput}
                      roomId={roomId}
                    />
                  </div>
                </Panel>

                <PanelResizeHandle
                  className={`group relative px-3 ${
                    isTerminalOpen ? "visible py-0.5" : "hidden "
                  }`}
                >
                  <div className="absolute inset-[-5px]"></div>{" "}
                  <div className="w-full h-[1px] bg-transparent group-hover:bg-[#f2f2f2] group-active:bg-[#b3b3b3]"></div>
                </PanelResizeHandle>

                <Panel
                  ref={terminalRef}
                  defaultSize={30}
                  minSize={10}
                  collapsible
                  maxSize={85}
                  onCollapse={() => setIsOpenTerminal(false)}
                  onExpand={() => setIsOpenTerminal(true)}
                >
                  <div className="bg-[#121212] h-full text-stone-200 rounded-md flex flex-col">
                    <div className="flex items-center justify-between border-b border-[#333333] pb-1">
                      <h6 className="text-slate-200 font-medium pl-2">
                        Terminal
                      </h6>
                      <MdClear
                        onClick={OpenTerminal}
                        size={26}
                        className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2] pr-2"
                      />
                    </div>
                    <Terminal
                      folderId={selectedFolder || newFolderId}
                      file={file}
                      outputText={outputText}
                      setOutputText={setOutputText}
                      ws={ws}
                      setWs={setWs}
                      isWaitingForInput={isWaitingForInput}
                      setIsWaitingForInput={setIsWaitingForInput}
                      userInput={userInput}
                      setUserInput={setUserInput}
                      roomId={roomId}
                    />
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle
              className={`group relative py-3 ${
                isOpenPopup ? "visible px-0.5" : "hidden "
              }`}
            >
              <div className="absolute inset-[-5px]"></div>{" "}
              <div className="w-[1px] h-full bg-transparent group-hover:bg-[#f2f2f2] group-active:bg-[#b3b3b3]"></div>
            </PanelResizeHandle>

            <Panel
              ref={popUpRef}
              defaultSize={(356 / window.innerWidth) * 100}
              minSize={isOpenPopup ? (330 / window.innerWidth) * 100 : 0}
              collapsible
              maxSize={isOpenPopup ? (430 / window.innerWidth) * 100 : 0}
              onCollapse={() => setIsOpenPopup(false)}
              onExpand={() => setIsOpenPopup(true)}
              className={`w-[35%] transition-[width] duration-500 ease-out overflow-hidden
              ${isMediumScreen && isFileExplorerOpen ? "hidden" : ""}
              `}
            >
              <div className="h-full p-2 bg-[#121212] rounded-md">
                <ChatParticipants
                  parentRef={popUpRef}
                  clients={clients}
                  chatTabIndex={chatTabIndex}
                  justOpened={justOpenedPopup}
                  hostId={hostId}
                  remoteHostId={remoteHostId}
                  micOn={micOn}
                  unseenCount={unseenCount}
                  setUnseenCount={setUnseenCount}
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>

        <VoiceChatManager clients={clients} />

        <footer className="flex items-center justify-center my-2">
          <span
            onClick={toggleMic}
            className="cursor-pointer bg-[#282828] px-3 py-2 mx-3 rounded-md text-[#b3b3b3] hover:text-[#f2f2f2]"
          >
            {micOn ? (
              <FaMicrophone size={25} />
            ) : (
              <FaMicrophoneSlash size={25} />
            )}
          </span>

          <span
            onClick={copyRoomId}
            className="cursor-pointer flex items-center gap-2 bg-[#282828] px-3 py-2 rounded-md text-[#b3b3b3] hover:text-[#f2f2f2]"
          >
            <MdContentCopy size={25} />
            <span className="font-semibold">Copy Room</span>
          </span>

          <button
            onClick={() => {
              socket.emit("endMeeting", { roomId });

              // Optional: clear locally opened folder/file
              sessionStorage.clear();
              localStorage.removeItem("hostId");

              window.location.href = "/Home"; // or navigate back to home
            }}
            className="bg-red-600 py-3 px-7 rounded-xl font-medium mx-6 text-[#f2f2f2]"
          >
            End Meeting
          </button>

          <span
            onClick={() => handleSidenavClick("user")}
            className="cursor-pointer bg-[#282828] px-3 py-2 rounded-md text-[#b3b3b3] hover:text-[#f2f2f2]"
          >
            <FaUser size={25} />
          </span>

          <span
            onClick={() => handleSidenavClick("chat")}
            className="cursor-pointer bg-[#282828] px-3 py-2 mx-3 rounded-md text-[#b3b3b3] hover:text-[#f2f2f2]"
          >
            <AiFillMessage size={25} />
          </span>
        </footer>
      </div>
    </>
  );
};

export default Editor;
