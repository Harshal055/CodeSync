import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  FaBars,
  FaFolderOpen,
  FaPen,
  FaUser,
  FaChalkboard,
} from "react-icons/fa";
import Whiteboard from "./Whiteboard";
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
import Terminal from "./Terminal";
import toast from "react-hot-toast";
import useFirebaseRoom from "../../Hooks/useFirebaseRoom";
import { runCodePiston } from "../../firebaseService";

const Editor = () => {
  const { roomId, folderId } = useParams();
  const { user, folderFeatures } = useContext(UserContext);
  const location = useLocation();

  const [userName, setUserName] = useState(() => {
    return user?.displayName || localStorage.getItem("userName") || "Guest";
  });

  // Use custom hook for Firebase logic
  const {
    clients,
    messages,
    remoteFolders,
    sendChatMessage,
    updateCode,
    subscribeToCode,
    saveFolders,
    kickUser,
    toggleRoomLock,
    roomDetails
  } = useFirebaseRoom(roomId, user?.uid || "guest", userName);

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

  // Sync remote folders to local context
  useEffect(() => {
    if (remoteFolders.length > 0) {
      folderFeatures.syncFromRemote(remoteFolders, [], true);
      if (!selectedFolder) {
        setSelectedFolder(remoteFolders[0]?.id);
      }
    }
  }, [remoteFolders]);

  useEffect(() => {
    if (newFolderId) {
      setSelectedFolder(newFolderId);
      sessionStorage.setItem("selectedFolder", newFolderId);
      setSelectedFile(null);
      sessionStorage.removeItem(`selectedFile_${selectedFolder}`);
      setNewFolderId(null);
    } else if (selectedFolder) {
      sessionStorage.setItem("selectedFolder", selectedFolder);
    }
  }, [selectedFolder, newFolderId]);

  useEffect(() => {
    if (selectedFile) {
      sessionStorage.setItem(
        `selectedFile_${selectedFolder}`,
        JSON.stringify(selectedFile)
      );
    }
  }, [selectedFile, selectedFolder]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("selectedFolder");
      sessionStorage.removeItem(`selectedFile_${selectedFolder}`);
    };
  }, [selectedFolder]);

  const closeFile = () => {
    setSelectedFile(null);
    sessionStorage.removeItem(`selectedFile_${selectedFolder}`);
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
  const [activeView, setActiveView] = useState("code");

  const [outputText, setOutputText] = useState("");
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [userInput, setUserInput] = useState("");

  const fileExplorerRef = useRef(null);
  const popUpRef = useRef(null);
  const terminalRef = useRef(null);
  const constraintsRef = useRef(null);

  // --- Handlers ---

  const handleRunCode = async (code, language) => {
    setOutputText("Running...");
    const result = await runCodePiston(language, code);
    if (result.stderr) {
      setOutputText(`Error:\n${result.stderr}`);
    } else {
      setOutputText(result.stdout || "Code executed successfully (no output).");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMediumScreen(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMediumScreen && isFileExplorerOpen) {
      setIsFileExplorerOpen(true);
      setIsOpenPopup(false);
    } else if (!isMediumScreen && isFileExplorerOpen) {
      setIsFileExplorerOpen(true);
      setIsOpenPopup(true);
    }
  }, [isMediumScreen]);

  useEffect(() => {
    if (!isFileExplorerOpen && !isOpenPopup && !isTerminalOpen) {
      setIsFullScreen(true);
    } else {
      setIsFullScreen(false);
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
        if (fileExplorerRef.current) fileExplorerRef.current.collapse();
        if (popUpRef.current) popUpRef.current.collapse();
        if (terminalRef.current) terminalRef.current.collapse();

        setIsFileExplorerOpen(false);
        setIsOpenPopup(false);
        setIsOpenTerminal(false);
      } else {
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
        setJustOpenedPopup(true);

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
    setIsCreating(true);
    modalFeatures.setModalPayLoad({ setNewFolderId });
    setOpenDropDown(false);
    setSelectedFile(null);
  };

  const openFolder = () => {
    modalFeatures.openModal(modalConstants.OPEN_FOLDER);
    modalFeatures.setModalPayLoad({
      setSelectedFolder: (folderId) => {
        const folder = folderFeatures.getFolderById(folderId);
        if (!folder) return;

        // Save to Firebase
        saveFolders([folder]);

        setSelectedFolder(folderId);
        sessionStorage.setItem("selectedFolder", folderId);

        if (folder.file && folder.file.length) {
          const firstFile = folder.file[0];
          setSelectedFile(firstFile.id);
          sessionStorage.setItem(
            `selectedFile_${folderId}`,
            JSON.stringify(firstFile.id)
          );
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
    navigator.clipboard.writeText(roomId).then(() => {
      toast.success("Room ID copied!");
    });
  };

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
          {messages.length > 0 && unseenCount > 0 && ( /* Assuming logic for unseen counts */
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
      name: "Code",
      functionToCall: () => setActiveView("code"),
    },
    {
      icon: <FaChalkboard size={24} />,
      name: "Whiteboard",
      functionToCall: () => setActiveView("whiteboard"),
    },
  ];

  const currentUserClient = clients.find((client) => client.userId === (user?.uid));
  const currentUserRole = currentUserClient?.role || "editor";
  const isReadOnly = currentUserRole === "viewer";

  return (
    <>
      <Modal />
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-3 flex flex-col gap-3 font-sans overflow-hidden select-none">

        {/* Header */}
        <header className="flex items-center gap-3 text-2xl px-2 py-1">
          <img src="/src/assets/logo.png" className="w-10 drop-shadow-md" alt="Logo" />
          <div className="flex items-center tracking-wide">
            <span className="text-slate-100 font-semibold text-xl">Code</span>
            <span className="text-blue-400 font-bold text-xl ml-1">Sync</span>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden h-full transition-all duration-500 gap-3">

          {/* Sidebar */}
          <div className="w-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-4 flex flex-col items-center gap-4 shadow-xl z-20">
            {sidenav.map((route) => (
              <div
                key={route.name}
                onClick={() => route.functionToCall(route.name)}
                className={`cursor-pointer flex justify-center items-center w-10 h-10 rounded-lg transition-all duration-300 ${activeItem === route.name
                  ? "bg-blue-600 shadow-lg shadow-blue-500/30 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                title={route.name}
              >
                {route.icon}
              </div>
            ))}
          </div>

          {openDropDown && (
            <div
              id="dropdown-menu"
              className="fixed z-50 left-24 top-20 text-gray-200 bg-[#1a1a1a]/95 backdrop-blur-xl p-2 border border-white/10 rounded-xl shadow-2xl w-56"
            >
              <ul className="space-y-1">
                <li
                  onClick={onCreateFolderInput}
                  className="cursor-pointer px-4 py-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  New Folder
                </li>
                <li
                  onClick={openFolder}
                  className="cursor-pointer px-4 py-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  Open Folder
                </li>
                <li
                  onClick={OpenTerminal}
                  className="cursor-pointer px-4 py-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isTerminalOpen ? "Close Terminal" : "Open Terminal"}
                </li>
                <div className="h-px bg-white/10 my-1 mx-2"></div>
                <li
                  onClick={() => {
                    if (folderFeatures.downloadProjectZip) {
                      folderFeatures.downloadProjectZip();
                      toast.success("Downloading Project...");
                    } else {
                      toast.error("Download feature not available");
                    }
                    setOpenDropDown(false);
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  Download Project
                </li>
              </ul>
            </div>
          )}

          <PanelGroup
            direction="horizontal"
            className={`${isFileExplorerOpen ? "space-x-3" : ""}`}
          >
            {/* File Explorer Panel */}
            <Panel
              ref={fileExplorerRef}
              defaultSize={(256 / window.innerWidth) * 100}
              minSize={(200 / window.innerWidth) * 100}
              collapsible
              maxSize={(380 / window.innerWidth) * 100}
              onCollapse={() => setIsFileExplorerOpen(false)}
              onExpand={() => setIsFileExplorerOpen(true)}
              className={`transition-[width] duration-300 ease-out overflow-hidden rounded-xl bg-black/20 backdrop-blur-md border border-white/10 shadow-xl ml-1`}
            >
              <div className="h-full truncate text-slate-200 p-1">
                <FileExplorer
                  roomId={roomId}
                  folderId={folderId}
                  newFolderId={newFolderId}
                  setNewFolderId={setNewFolderId}
                  selectedFolder={selectedFolder}
                  setSelectedFolder={setSelectedFolder}
                  isCreating={isCreating}
                  setIsCreating={setIsCreating}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 hover:bg-blue-500/20 transition-colors rounded-full mx-0.5 cursor-col-resize" />

            {/* Main Editor & Terminal Panel */}
            <Panel>
              {activeView === "code" ? (
                <PanelGroup direction="vertical" id="group" className="h-full gap-3">
                  <Panel defaultSize={70} minSize={20} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    <EditorContainer
                      file={file}
                      closeFile={closeFile}
                      folderId={selectedFolder || newFolderId}
                      onFullScreen={onFullScreen}
                      isFullScreen={isFullScreen}
                      setOutputText={setOutputText}
                      setIsWaitingForInput={setIsWaitingForInput}
                      roomId={roomId}
                      updateCode={updateCode}
                      subscribeToCode={subscribeToCode}
                      onRunCode={handleRunCode}
                      isReadOnly={isReadOnly}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 hover:bg-blue-500/20 transition-colors rounded-full my-0.5 cursor-row-resize" />

                  <Panel
                    ref={terminalRef}
                    defaultSize={30}
                    minSize={20}
                    collapsible
                    onCollapse={() => setIsOpenTerminal(false)}
                    onExpand={() => setIsOpenTerminal(true)}
                    className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden"
                  >
                    <Terminal
                      folderId={selectedFolder || newFolderId}
                      file={file}
                      outputText={outputText}
                      setOutputText={setOutputText}
                      isWaitingForInput={isWaitingForInput}
                      setIsWaitingForInput={setIsWaitingForInput}
                      userInput={userInput}
                      setUserInput={setUserInput}
                      roomId={roomId}
                    />
                  </Panel>
                </PanelGroup>
              ) : (
                <div className="h-full w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden p-1">
                  <Whiteboard roomId={roomId} />
                </div>
              )}
            </Panel>

            <PanelResizeHandle className="w-2 hover:bg-blue-500/20 transition-colors rounded-full mx-0.5 cursor-col-resize" />

            {/* Chat/Participants Panel */}
            <Panel
              ref={popUpRef}
              defaultSize={(430 / window.innerWidth) * 100}
              minSize={(200 / window.innerWidth) * 100}
              maxSize={(500 / window.innerWidth) * 100}
              collapsible
              onCollapse={() => setIsOpenPopup(false)}
              onExpand={() => setIsOpenPopup(true)}
              className={`transition-[width] duration-300 ease-out overflow-hidden rounded-xl bg-black/20 backdrop-blur-md border border-white/10 shadow-xl mr-1`}
            >
              <ChatParticipants
                parentRef={constraintsRef}
                clients={clients}
                chatTabIndex={chatTabIndex}
                justOpened={justOpenedPopup}
                hostId={hostId}
                remoteHostId={remoteHostId}
                micOn={false}
                unseenCount={unseenCount}
                setUnseenCount={setUnseenCount}
                messages={messages}
                sendMessage={sendChatMessage}
                currentUserId={user?.uid}
                kickUser={kickUser}
                toggleRoomLock={toggleRoomLock}
                roomDetails={roomDetails}
                fileId={selectedFile}
                currentCode={folderFeatures.getFileById(selectedFile)?.code}
                onRestore={(code) => selectedFile && updateCode(roomId, selectedFile, code)}
                roomId={roomId}
              />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </>
  );
};

export default Editor;
