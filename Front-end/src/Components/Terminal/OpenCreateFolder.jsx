import React, { useContext } from "react";
import { modalConstants, ModalContext } from "./ModalContext";
import { io } from "socket.io-client";
import { UserContext } from "./UserContext";
import API_BASE_URL from '../../lib/api';
const socket = io(API_BASE_URL);

export const OpenCreateFolder = ({
  setNewFolderId,
  setSelectedFolder,
  setIsCreating,
  roomId,
  hostId,
  setRemoteHostId,
}) => {
  const modalFeatures = useContext(ModalContext);
  const { folderFeatures} = useContext(UserContext);

  const handleCreateFolder = () => {
    setIsCreating(true);
    modalFeatures.setModalPayLoad({ setNewFolderId });
  };

  const openFolder = () => {
    modalFeatures.openModal(modalConstants.OPEN_FOLDER);
  
    modalFeatures.setModalPayLoad({
      setSelectedFolder: (folderId) => {
        const folder = folderFeatures.getFolderById(folderId);
        if (!folder) return;
  
        const files = folder.files || [];
  
        // Broadcast to room
        socket.emit("folderSelected", { roomId, folderId });
  
        socket.emit("broadcastFolderData", {
          roomId,
          folders: [folder],
          files: files.map((f) => ({ ...f, folderId: folder.id })),
          hostId,
        });
  
        setRemoteHostId(hostId); // let other components know who's host
        setSelectedFolder(folderId);
        sessionStorage.setItem("selectedFolder", folderId);
  
        if (files.length) {
          const firstFile = files[0];
          sessionStorage.setItem(
            `selectedFile_${folderId}`,
            JSON.stringify(firstFile.id)
          );
          socket.emit("fileSelected", { roomId, fileId: firstFile.id });
        } else {
          sessionStorage.removeItem(`selectedFile_${folderId}`);
        }
      },
    });
  };

  return (
    <>
      <div className="flex flex-col mt-[-12px] p-3">
        <hr className="border-[#333333]" />
        <h6 className="text-white flex flex-wrap justify-center mt-3 mb-3">
          <span>You can open your </span>
          <span>existing folder...!</span>
        </h6>
        <div className="flex justify-center">
          <button
            onClick={openFolder}
            className="text-slate-200 text-[16px] w-36 font-serif border border-[#333333] hover:border-zinc-400 rounded-lg p-1 px-5 mb-6"
          >
            Open Folder
          </button>
        </div>
        <hr className="border-[#333333]" />
        <h6 className="text-slate-200 flex flex-wrap justify-center text-center mt-3 mb-3">
          <span>You can create a </span>
          <span>new folder...!</span>
        </h6>
        <div className="flex justify-center">
          <button
            onClick={handleCreateFolder}
            className="text-slate-200 text-[16px] w-36 font-serif border border-[#333333] hover:border-zinc-400 rounded-lg p-1 px-5 mb-6"
          >
            Create Folder
          </button>
        </div>
        <hr className="border-[#333333]" />
      </div>
    </>
  );
};
