import React, { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import { ModalContext } from "./ModalContext";
import { FcFolder } from "react-icons/fc";

export const InputFolderModal = ({ setIsCreating }) => {
  const { folderFeatures } = useContext(UserContext);
  const modalFeatures = useContext(ModalContext);

  
  const [newFolderName, setNewFolderName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOuside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        closeModal();
        setIsCreating(false);
        setNewFolderName("");
      }
    };

    document.addEventListener("mousedown", handleClickOuside);
    return () => document.removeEventListener("mousedown", handleClickOuside);
  }, []);

  const closeModal = () => {
    modalFeatures.closeModal();
  };

  const handleInputEnter = (e) => {
    if (e.key === "Enter") {
      if (newFolderName.trim()) {
        handleCreateFolder(newFolderName);
      }
    }
  };

  const handleCreateFolder = (folderName) => {
    if (folderName) {
      const newFolder = folderFeatures.createNewFolder(folderName);
      modalFeatures.modalPayLoad?.setNewFolderId(newFolder.id); // Store the newly created folder ID
    }
    setIsCreating(false);
    closeModal();
    setNewFolderName("");
  };

  return (
    <div>
      <hr className="border-[#333333] mx-3" />
      <div className="flex items-center w-full px-3 mt-3">
        <FcFolder className="ml-0.5 mr-2 text-xl" />
        <input
          ref={inputRef}
          value={newFolderName}
          placeholder="Enter Folder Name..."
          className="flex-1 font-medium border-b border-[#333333] hover:border-[#666666] focus:border-[#666666] bg-transparent outline-none"
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => handleInputEnter(e)}
        />
      </div>
    </div>
  );
};
