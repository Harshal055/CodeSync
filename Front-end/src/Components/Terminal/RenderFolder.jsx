import React, { useContext, useEffect, useState } from "react";
import { defaultCodes, UserContext } from "./UserContext";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { FcFolder } from "react-icons/fc";
import { VscNewFile } from "react-icons/vsc";
import { MdDeleteOutline } from "react-icons/md";
import { TbBrandCpp } from "react-icons/tb";
import { RiEdit2Fill } from "react-icons/ri";
import { useRef } from "react";
import { v4 as uuidV4 } from "uuid";
import socket from "./socket";

const RenderFolder = ({ folderId, selectedFile, setSelectedFile, roomId }) => {
  const { folderFeatures } = useContext(UserContext);
  const folder = folderFeatures.getFolderById(folderId);
  const [editing, setEditing] = useState(null);
  const [newFile, setNewFile] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [activeFile, setActiveFile] = useState(
    () => JSON.parse(localStorage.getItem("selectedFile")) || null
  );
  const inputRef = useRef(null);
  console.log("Folder files:", folder?.file); // should now always be populated

  // Detects clicks outside of the input feild
  useEffect(() => {
    const handleClickOuside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setEditing(null);
        setNewFile("");
        setNewFileName("");
        setNewFolderName("");
      }
    };

    document.addEventListener("mousedown", handleClickOuside);
    return () => document.removeEventListener("mousedown", handleClickOuside);
  }, []);

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

    setNewFile(""); // Reset the state
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
    setNewFileName(""); // Reset the input
  };

  const getIcon = {
    SiJavascript: <img src="/src/assets/javascript.svg" className="w-5" />,
    FaJava: <img src="/src/assets/java.svg" className="w-5" />,
    TbBrandCpp: <img src="/src/assets/cpp.svg" className="h-3 ml-0.5" />,
    SiPython: <img src="/src/assets/python.svg" className="w-5" />,
    FaFile: <img src="/src/assets/document.svg" className="w-5" />,
  };

  return (
    <div className="text-slate-200">
      <div className="flex justify-between items-center ml-2.5 mr-3.5">
        <strong
          onClick={() => {
            if (editing !== folderId) setIsOpen(!isOpen);
          }}
          className="flex items-center cursor-pointer w-full"
        >
          {isOpen ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
          <FcFolder className="ml-0.5 mr-2 text-xl" />
          {editing === folderId ? (
            <input
              ref={inputRef}
              value={newFolderName}
              className="flex-1 font-medium border-b border-[#333333] hover:border-[#666666] focus:border-[#666666] bg-transparent outline-none"
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => handleInputEnter(e, folderId)}
            />
          ) : (
            <span className="font-medium">{folder.title}</span>
          )}
        </strong>
        <div className="flex gap-1.5">
          {editing !== folderId && (
            <>
              <RiEdit2Fill
                onClick={() => {
                  setEditing(folderId);
                  setNewFolderName(folder.title);
                }}
                className="text-xl cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
              />
              <VscNewFile
                onClick={() => setEditing("newFile")}
                className="cursor-pointer text-lg text-[#b3b3b3] hover:text-[#f2f2f2]"
              />
            </>
          )}
        </div>
      </div>

      {editing === "newFile" && (
        <div className="flex gap-2 ml-9 mr-3.5 mt-2">
          <img src="/src/assets/document.svg" className="w-5" />
          <input
            ref={inputRef}
            value={newFile}
            className="w-full text-sm border-b border-[#333333] hover:border-[#666666] focus:border-[#666666] bg-transparent outline-none"
            onChange={(e) => setNewFile(e.target.value)}
            onKeyDown={(e) => handleInputEnter(e, folderId)}
            placeholder="Enter file name..."
          />
        </div>
      )}

      {isOpen && (
        <div className="mt-2 font-normal text-sm text-slate-200">
          {(folder.file || []).map((file) => (
            <div
              key={file.id}
              onClick={() => {
                setSelectedFile(file.id);
                localStorage.setItem("selectedFile", JSON.stringify(file.id));
                setActiveFile(file.id);
              }}
              className={`flex w-full py-1 justify-between items-center pl-9 pr-3 cursor-pointer ${
                selectedFile === file.id
                  ? "bg-[#282828] border border-transparent border-1 border-[#3c3c3c]"
                  : "hover:bg-[#282828] border border-transparent border-1 hover:border-[#3c3c3c]"
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-lg text-gray-400">
                  {getIcon[file.icon]}
                </span>
                {editing === file.id ? (
                  <input
                    ref={inputRef}
                    value={newFileName}
                    className="flex-1 text-sm border-b border-[#333333] hover:border-[#666666] focus:border-[#666666] bg-transparent outline-none"
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => handleInputEnter(e, folderId, file.id)}
                  />
                ) : (
                  <span>{file.title}</span>
                )}
              </div>
              <div className="flex gap-1.5">
                {editing !== file.id && (
                  <>
                    <RiEdit2Fill
                      onClick={() => {
                        setEditing(file.id);
                        setNewFileName(file.title);
                      }}
                      className="text-xl cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
                    />
                    <MdDeleteOutline
                      onClick={() => {
                        folderFeatures.deleteFile(folderId, file.id);
                      }}
                      className="text-xl cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]"
                    />
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
