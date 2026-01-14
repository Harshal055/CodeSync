import React, { useContext, useEffect, useState, useRef } from "react";
import { defaultCodes, UserContext } from "./UserContext";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { FcFolder } from "react-icons/fc";
import { VscNewFile } from "react-icons/vsc";
import { MdDeleteOutline } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { v4 as uuidV4 } from "uuid";

const RenderFolder = ({ folderId, selectedFile, setSelectedFile, roomId }) => {
  const { folderFeatures } = useContext(UserContext);
  const folder = folderFeatures.getFolderById(folderId);
  const [editing, setEditing] = useState(null);
  const [newFile, setNewFile] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setEditing(null);
        setNewFile("");
        setNewFileName("");
        setNewFolderName("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleInputEnter = (e, folderId, fileId) => {
    if (e.key === "Enter") {
      if (newFile.trim() && editing === "newFile") {
        onCreateNewFile(newFile);
      }
      if (newFolderName.trim() && editing === folderId) {
        onEditFolderTitle(folderId);
      }
      if (newFileName.trim() && editing === fileId) {
        onEditFileTitle(folderId, fileId);
      }
    }
  };

  const onCreateNewFile = (fileName) => {
    const { language, fileType, iconType } =
      folderFeatures.getLanguageByExtension(fileName);

    const newFileObject = {
      id: uuidV4(),
      title: fileName,
      language,
      fileType,
      icon: iconType,
      code: defaultCodes[language],
    };

    folderFeatures.createNewFile(folderId, newFileObject);
    setNewFile("");
    setEditing(null);
  };

  const onEditFolderTitle = (folderId) => {
    folderFeatures.editFolderTitle(newFolderName, folderId);
    setEditing(null);
    setNewFolderName("");
  };

  const onEditFileTitle = (folderId, fileId) => {
    folderFeatures.editFileTitle(newFileName, folderId, fileId);
    setEditing(null);
    setNewFileName("");
  };

  const getIcon = {
    SiJavascript: <img src="/src/assets/javascript.svg" className="w-5" alt="js" />,
    FaJava: <img src="/src/assets/java.svg" className="w-5" alt="java" />,
    TbBrandCpp: <img src="/src/assets/cpp.svg" className="h-4" alt="cpp" />,
    SiPython: <img src="/src/assets/python.svg" className="w-5" alt="python" />,
    FaFile: <img src="/src/assets/document.svg" className="w-5" alt="file" />,
  };

  if (!folder) return null;

  return (
    <div className="text-slate-200 select-none">
      <div className="flex justify-between items-center group py-1 px-2 hover:bg-[#2a2a2a] rounded cursor-pointer transition-colors duration-200">
        <div
          className="flex items-center flex-1 overflow-hidden"
          onClick={() => {
            if (editing !== folderId) setIsOpen(!isOpen);
          }}
        >
          <span className="mr-1 text-gray-400">
            {isOpen ? <IoMdArrowDropdown size={20} /> : <IoMdArrowDropright size={20} />}
          </span>
          <FcFolder className="mx-1 text-xl" />

          {editing === folderId ? (
            <input
              ref={inputRef}
              value={newFolderName}
              className="flex-1 bg-[#1e1e1e] border border-blue-500 rounded px-1 py-0.5 text-sm outline-none text-white min-w-0"
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => handleInputEnter(e, folderId)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="font-medium text-sm truncate" title={folder.title}>{folder.title}</span>
          )}
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {editing !== folderId && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setEditing("newFile"); setIsOpen(true); }}
                className="text-gray-400 hover:text-white"
                title="New File"
              >
                <VscNewFile size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(folderId); setNewFolderName(folder.title); }}
                className="text-gray-400 hover:text-blue-400"
                title="Rename Folder"
              >
                <RiEdit2Fill size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {editing === "newFile" && (
        <div className="flex items-center gap-2 ml-8 mt-1 pr-2">
          <img src="/src/assets/document.svg" className="w-4" alt="file" />
          <input
            ref={inputRef}
            value={newFile}
            className="w-full bg-[#1e1e1e] border border-blue-500 rounded px-1 py-0.5 text-sm outline-none text-white"
            onChange={(e) => setNewFile(e.target.value)}
            onKeyDown={(e) => handleInputEnter(e, folderId)}
            placeholder="filename.ext"
          />
        </div>
      )}

      {isOpen && (
        <div className="mt-1 flex flex-col">
          {(folder.file || []).map((file) => (
            <div
              key={file.id}
              onClick={() => {
                setSelectedFile(file.id);
                localStorage.setItem("selectedFile", JSON.stringify(file.id));
              }}
              className={`flex justify-between items-center pl-8 pr-2 py-1 cursor-pointer group transition-colors duration-150 ${selectedFile === file.id
                  ? "bg-[#37373d] text-white"
                  : "text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"
                }`}
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <span className="w-4 flex justify-center shrink-0">
                  {getIcon[file.icon] || getIcon["FaFile"]}
                </span>

                {editing === file.id ? (
                  <input
                    ref={inputRef}
                    value={newFileName}
                    className="flex-1 bg-[#1e1e1e] border border-blue-500 rounded px-1 py-0.5 text-sm outline-none text-white min-w-0"
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => handleInputEnter(e, folderId, file.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm truncate" title={file.title}>{file.title}</span>
                )}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                {editing !== file.id && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(file.id); setNewFileName(file.title); }}
                      className="text-gray-400 hover:text-blue-400"
                      title="Rename"
                    >
                      <RiEdit2Fill size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); folderFeatures.deleteFile(folderId, file.id); }}
                      className="text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <MdDeleteOutline size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RenderFolder;
