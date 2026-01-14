import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import {
  MdOutlinePublishedWithChanges,
  MdDownload,
  MdFullscreen,
  MdFullscreenExit,
} from "react-icons/md";
import { FaPlay, FaCode } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import Editor from "@monaco-editor/react";
import { UserContext } from "./UserContext";
import { updateCursorPosition, subscribeToCursors } from "../../firebaseService";
import debounce from "lodash.debounce";

export const EditorContainer = ({
  file,
  closeFile,
  folderId,
  onFullScreen,
  isFullScreen,
  setOutputText,
  setIsWaitingForInput,
  roomId,
  updateCode,
  subscribeToCode,
  onRunCode,
  isReadOnly
}) => {
  const { folderFeatures, user } = useContext(UserContext);
  const codeRef = useRef(file?.code || "");
  const [isSaved, setIsSaved] = useState(true);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationRef = useRef([]);

  const debouncedCursorUpdate = useMemo(
    () => debounce((data) => {
      if (!roomId || !user) return;
      updateCursorPosition(roomId, user.uid || user.id, data);
    }, 50),
    [roomId, user]
  );

  useEffect(() => {
    codeRef.current = file?.code || "";
  }, [file]);

  const onChangeCode = (newCode) => {
    if (!file?.id) return;
    codeRef.current = newCode;
    setIsSaved(false);

    if (updateCode) {
      updateCode(file.id, newCode);
    }
  };

  useEffect(() => {
    if (!file?.id || !subscribeToCode) return;

    const unsubscribe = subscribeToCode(file.id, (code) => {
      // ... (existing logic)
      if (editorRef.current) {
        const current = editorRef.current.getValue();
        if (current !== code) {
          // Save cursor state
          const pos = editorRef.current.getPosition();
          editorRef.current.setValue(code);
          // Restore cursor
          editorRef.current.setPosition(pos);
          codeRef.current = code;
        }
      }
    });

    return () => unsubscribe();
  }, [file?.id, subscribeToCode]);

  // Cursors Subscription
  useEffect(() => {
    if (!roomId || !editorRef.current || !monacoRef.current) return;

    const unsubscribe = subscribeToCursors(roomId, (cursors) => {
      if (!editorRef.current || !monacoRef.current) return;
      const monaco = monacoRef.current;
      const currentUser = user?.uid || user?.id;

      const newDecorations = cursors
        .filter(c => c.userId !== currentUser && c.fileId === file?.id) // Filter by file!
        .map(c => {
          return {
            range: new monaco.Range(c.lineNumber, c.column, c.lineNumber, c.column),
            options: {
              className: 'remote-cursor', // Global CSS class
              hoverMessage: { value: `User: ${c.userName}` },
              beforeContentClassName: 'remote-cursor-label' // Optional
            }
          };
        });

      decorationRef.current = editorRef.current.deltaDecorations(decorationRef.current, newDecorations);
    });
    return () => unsubscribe();
  }, [roomId, file?.id, user]); // Depend on file.id

  const exportCode = () => {
    const codeValue = codeRef.current?.trim();

    if (!codeValue) {
      alert("Please Type Some Code in the Editor Before Exporting");
      return;
    }

    const codeBlob = new Blob([codeValue], {
      type: file?.type || "text/plain",
    });

    const downloadUrl = URL.createObjectURL(codeBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = file?.title;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);
  };

  const onSaveCode = () => {
    if (!file?.id || !roomId) return;
    folderFeatures.saveCode(file.id, folderId, codeRef.current);
    setIsSaved(true);
  };

  // Auto-save code
  useEffect(() => {
    if (!file) return;

    const timeout = setTimeout(() => {
      folderFeatures.saveCode(file.id, folderId, codeRef.current);
      setIsSaved(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [file?.id, folderId, folderFeatures]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      if (!file?.id) return;
      debouncedCursorUpdate({
        fileId: file.id,
        lineNumber: position.lineNumber,
        column: position.column,
        userName: user?.firstName || "Anonymous",
        color: "#FFA500" // Default Orange
      });
    });
  };

  function handleEditorWillMount(monaco) {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e1e00", // Transparent background for glass effect
        "editor.lineHighlightBackground": "#ffffff10",
        "editorLineNumber.foreground": "#555555",
        "editorLineNumber.activeForeground": "#ffffff",
        "scrollbarSlider.background": "#ffffff20",
        "scrollbarSlider.hoverBackground": "#ffffff30",
        "scrollbarSlider.activeBackground": "#ffffff40",
      },
    });
  }

  const getIcon = (iconName) => {
    const srcMap = {
      SiJavascript: "/src/assets/javascript.svg",
      FaJava: "/src/assets/java.svg",
      TbBrandCpp: "/src/assets/cpp.svg",
      SiPython: "/src/assets/python.svg",
      FaFile: "/src/assets/document.svg",
    };

    const src = srcMap[iconName] || "/src/assets/document.svg";
    return <img src={src} className="w-4 h-4 object-contain" alt="icon" />;
  };

  if (!file) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-400 select-none">
        <div className="p-6 rounded-full bg-white/5 mb-6 border border-white/5 shadow-2xl backdrop-blur-sm animate-pulse-slow">
          <FaCode className="text-blue-500/80 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" size={64} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Ready to Create?</h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md text-center">
          Select a file from the explorer or create a new one to start your coding session.
        </p>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
              <span className="font-mono text-xs text-gray-300">CTRL</span>
            </div>
            <span className="text-xs text-gray-500">Run</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
              <span className="font-mono text-xs text-gray-300">CTRL+S</span>
            </div>
            <span className="text-xs text-gray-500">Save</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <header className="h-11 flex justify-between items-center bg-[#141414]/50 border-b border-white/5 px-2 select-none backdrop-blur-md">

        {/* File Tab */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-t-lg border-t border-x border-blue-500/20 relative top-1 transition-all">
          {getIcon(file?.icon)}
          <span className="text-sm text-blue-100 font-medium max-w-[120px] truncate">{file?.title}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isSaved ? "bg-transparent scale-0" : "bg-blue-400 scale-100 shadow-[0_0_5px_rgba(96,165,250,0.8)]"}`}
          ></span>
          <button
            onClick={closeFile}
            className="ml-1 text-blue-300/50 hover:text-white hover:bg-white/10 rounded-full p-0.5 transition-colors"
          >
            <MdClear size={14} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => !isReadOnly && onRunCode && onRunCode(codeRef.current, file.language)}
            disabled={isReadOnly}
            className={`group flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/40 hover:to-emerald-600/40 border border-green-500/30 text-green-400 hover:text-green-300 px-4 py-1.5 rounded-lg transition-all shadow-lg hover:shadow-green-500/20 ${isReadOnly ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            <FaPlay size={10} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold tracking-wide">RUN</span>
          </button>

          <div className="w-px h-5 bg-white/10 mx-2"></div>

          <button
            onClick={!isReadOnly ? onSaveCode : undefined}
            disabled={isReadOnly}
            className={`p-2 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors ${isReadOnly ? 'opacity-30 cursor-not-allowed' : ''}`}
            title={isReadOnly ? "Read Only" : "Save"}
          >
            <MdOutlinePublishedWithChanges size={20} />
          </button>

          <button
            onClick={exportCode}
            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-white/5 rounded-lg transition-colors"
            title="Download"
          >
            <MdDownload size={20} />
          </button>

          <button
            onClick={onFullScreen}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullScreen ? <MdFullscreenExit size={22} /> : <MdFullscreen size={22} />}
          </button>
        </div>
      </header>

      <section className="flex-1 relative bg-transparent">
        <Editor
          key={file?.id}
          height="100%"
          language={file?.language}
          theme="custom-dark"
          beforeMount={handleEditorWillMount}
          value={codeRef.current}
          onChange={onChangeCode}
          onMount={handleEditorMount}
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 14,
            lineHeight: 24,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            cursorBlinking: "smooth",
            smoothScrolling: true,
            readOnly: isReadOnly,
          }}
        />
      </section>
    </div>
  );
};
