import React, { useState } from 'react';
import { VscNewFile, VscNewFolder } from "react-icons/vsc";
import { MdDeleteOutline } from "react-icons/md";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { FcFolder } from "react-icons/fc";
import { FaFile } from "react-icons/fa6";

const Folder = ({ folder, deleteFolder, isSubFolder = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subFolders, setSubFolders] = useState(folder.subFolders || []);
  const [subFiles, setSubFiles] = useState([]);
  const [subFolderName, setSubFolderName] = useState('');
  const [subFileName, setSubFileName] = useState('');
  const [activeInput, setActiveInput] = useState(null);

  const addSubFolder = () => {
    if (subFolderName.trim()) {
      setSubFolders([...subFolders, { name: subFolderName, subFolders: [] }]);
      setSubFolderName('');
      setActiveInput(null);
      setIsOpen(true);
    }
  };

  const addSubFile = () => {
    if (subFileName.trim()) {
      setSubFiles([...subFiles, { name: subFileName }]);
      setSubFileName('');
      setActiveInput(null);
      setIsOpen(true);
    }
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      if (activeInput === 'folder') addSubFolder();
      if (activeInput === 'file') addSubFile();
    }
  };

  const handleDeleteFolder = (index) => {
    setSubFolders(subFolders.filter((_, i) => i !== index));
  };

  const handleDeleteFile = (index) => {
    setSubFiles(subFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="text-white">
      <div className="ml-2 mr-3">
        <div className="flex justify-between items-center">
          <strong onClick={() => setIsOpen(!isOpen)} className="flex items-center cursor-pointer">
            {isOpen ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
            <FcFolder className="mr-1 text-lg" />
            {folder.name}
          </strong>
          <div className="flex space-x-2 text-lg">
            <VscNewFolder
              onClick={() => setActiveInput(activeInput === 'folder' ? null : 'folder')}
              className="cursor-pointer"
            />
            <VscNewFile
              onClick={() => setActiveInput(activeInput === 'file' ? null : 'file')}
              className="cursor-pointer"
            />
            {isSubFolder && <MdDeleteOutline onClick={deleteFolder} className="cursor-pointer" />}
          </div>
        </div>
      </div>

      {activeInput === 'folder' && (
        <div className="flex ml-5 mb-1 items-center">
          <FcFolder className="mr-1 text-xl" />
          <input
            type="text"
            value={subFolderName}
            onChange={(e) => setSubFolderName(e.target.value)}
            onKeyUp={handleInputEnter}
            className="text-white w-full h-5 pl-1 bg-black border border-zinc-400 hover:border-blue-300 focus:outline-none focus:ring-blue-300 focus:border-blue-300"
            autoFocus
          />
        </div>
      )}

      {activeInput === 'file' && (
        <div className="flex ml-5 mb-1 items-center">
          <FaFile className="mr-1 text-lg text-gray-400" />
          <input
            type="text"
            value={subFileName}
            onChange={(e) => setSubFileName(e.target.value)}
            onKeyUp={handleInputEnter}
            className="text-white w-full h-5 pl-1 bg-black border border-zinc-400 hover:border-blue-300 focus:outline-none focus:ring-blue-300 focus:border-blue-300"
            autoFocus
          />
        </div>
      )}

      {isOpen && (
        <div className="ml-3 font-thin text-[14px]">
          {subFolders.map((subFolder, index) => (
            <Folder
              key={index}
              folder={subFolder}
              deleteFolder={() => handleDeleteFolder(index)}
              isSubFolder ={true}
            />
          ))}
          {subFiles.map((file, index) => (
            <div key={index} className="flex justify-between items-center ml-5 cursor-pointer">
              <div className="flex">
                <FaFile className="mr-2 text-lg text-gray-400" />
                <span>{file.name}</span>
              </div>
              <MdDeleteOutline
                onClick={() => handleDeleteFile(index)}
                className="text-lg mr-3 cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Folder;
