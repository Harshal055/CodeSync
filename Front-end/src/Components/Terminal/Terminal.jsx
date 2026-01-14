import { useContext } from "react";
import { UserContext } from "./UserContext";
import "./terminal.css";
import { FaTerminal } from "react-icons/fa";

const Terminal = ({
  folderId,
  file,
  outputText,
  setOutputText,
  roomId,
}) => {

  const { folderFeatures } = useContext(UserContext);
  const folder = folderFeatures.getFolderById(folderId);

  const folderPath = folder ? `${folder.title}` : "~";
  const fileName = file ? file.title : "";

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden font-mono text-sm">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5 select-none text-xs backdrop-blur-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <FaTerminal size={10} />
          <span className="font-semibold tracking-wide">TERMINAL</span>
        </div>
        <div className="flex gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col relative w-full">
        {/* Breadcrumbs / Prompt */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2 text-xs font-medium">
          <span className="text-green-400">user@codesync</span>
          <span className="text-gray-500">:</span>
          <span className="text-blue-400">~/{folderPath}</span>
          {fileName && (
            <>
              <span className="text-gray-600">/</span>
              <span className="text-yellow-400">{fileName}</span>
            </>
          )}
          <span className="text-gray-400 ml-1">$</span>
        </div>

        <textarea
          value={outputText}
          readOnly
          spellCheck={false} // Disable spellcheck for code
          className="flex-1 w-full bg-transparent resize-none outline-none text-gray-300 custom-scroll leading-relaxed font-mono text-xs md:text-sm p-1"
          style={{ fontFamily: "Menlo, Monaco, 'Courier New', monospace" }} // Ensure safe monospace font
        />
      </div>
    </div>
  );
};

export default Terminal;
