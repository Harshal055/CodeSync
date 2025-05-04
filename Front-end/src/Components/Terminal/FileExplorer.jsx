import React, { useContext, useEffect } from "react";
import RenderFolder from "./RenderFolder";
import { UserContext } from "./UserContext";
import { OpenCreateFolder } from "./OpenCreateFolder";
import { InputFolderModal } from "./InputFolderModal";


const FileExplorer = ({
  roomId,
  folderId,
  newFolderId,
  setNewFolderId,
  selectedFolder,
  setSelectedFolder,
  isCreating,
  setIsCreating,
  selectedFile,
  setSelectedFile,
  Host,
  hostId, 
  setRemoteHostId,
}) => {
  const { folderFeatures } = useContext(UserContext);

  // Get the newly created folder details
  const newFolder = newFolderId
    ? folderFeatures.getFolderById(newFolderId)
    : null;

  const existingFolder = folderId
    ? folderFeatures.getFolderById(folderId)
    : null;

  let folder = null;
  if (selectedFolder) {
    folder = folderFeatures.getFolderById(selectedFolder);
    if (!folder || !folder.id)
      return (
        <>
          <h5 className="truncate text-slate-200 font-semibold mx-4 mt-4 mb-2.5">
            FILE EXPLORER
          </h5>
          <hr className="border-[#333333] m-3" />
          <p className="text-center text-gray-500">No Folder Selected.</p>
        </>
      );
  }

  console.log(folderFeatures.getFolderById(folderId));
  console.log("selectedFolder:", selectedFolder);
  console.log("newFolderId:", newFolderId);
  console.log("folder from context:", folder);

  return (
    <div className="truncate">
      <h5 className="truncate text-slate-200 font-semibold mx-4 mt-4 mb-2.5">
        FILE EXPLORER
      </h5>

      {isCreating ? (
        <InputFolderModal setIsCreating={setIsCreating} />
      ) : roomId && !folder && !newFolder ? (
        Host ? (
          <OpenCreateFolder
            setNewFolderId={setNewFolderId}
            setSelectedFolder={setSelectedFolder}
            setIsCreating={setIsCreating}
            roomId={roomId}
            hostId={hostId}
            setRemoteHostId={setRemoteHostId}
          />
        ) : (
          <>
            <hr className="border-[#333333] mx-3" />
            <p className="text-center text-gray-500 mt-3">No Folder Selected</p>
          </>
        )
      ) : newFolder ? (
        // If a folder is created, show it instead of OpenCreateFolder
        <>
          <hr className="border-[#333333] mx-3" />
          <div className="mt-3">
            <RenderFolder
              key={newFolder.id}
              folderId={newFolder.id}
              selectedFile={selectedFile}  // 🔥 pass this
              setSelectedFile={setSelectedFile}
              roomId={roomId}
              hostId={hostId}
            />
          </div>
        </>
      ) : folder ? (
        <>
          <hr className="border-[#333333] mx-3" />
          <div className="mt-2">
            <RenderFolder
              folderId={folder.id}
              selectedFile={selectedFile}  // 🔥 pass this
              setSelectedFile={setSelectedFile}
              roomId={roomId}
              hostId={hostId}
            />
          </div>
        </>
      ) : existingFolder ? (
        // If opening via folderId, show the existing folder
        <>
          <hr className="border-[#333333] mx-3" />
          <div className="mt-3">
            <RenderFolder
              folderId={existingFolder.id}
              selectedFile={selectedFile}  // 🔥 pass this
              setSelectedFile={setSelectedFile}
              roomId={roomId}
              hostId={hostId}
            />
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No Folder Selected.</p>
      )}
    </div>
  );
};

export default FileExplorer;
