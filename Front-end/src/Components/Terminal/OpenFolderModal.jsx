import React, { useContext, useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ModalContext } from "./ModalContext";
import { UserContext } from "./UserContext";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { FcFolder } from "react-icons/fc";
import { TbBrandCpp } from "react-icons/tb";

export const OpenFolderModal = () => {
  const modalFeatures = useContext(ModalContext);
  const { folderFeatures } = useContext(UserContext);
  const { folders } = folderFeatures;

  const [isOpen, setIsOpen] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen({});
        modalFeatures.closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeModal = () => {
    modalFeatures.closeModal();
  };

  const toggleFolder = (folderId) => {
    setIsOpen((prev) => ({
      ...prev,
      [folderId]: !prev[folderId], // Toggle only the clicked folder
    }));
  };

  const getIcon = {
    SiJavascript: <img src="/src/assets/javascript.svg" className="w-5" />,
    FaJava: <img src="/src/assets/java.svg" className="w-5" />,
    TbBrandCpp: <img src="/src/assets/cpp.svg" className="h-3 ml-0.5"/>,
    SiPython: <img src="/src/assets/python.svg" className="w-5" />,
    FaFile: <img src="/src/assets/document.svg" className="w-5" />,
  };

  const handleSelectFolder = (folderId) => {
    modalFeatures.modalPayLoad?.setSelectedFolder(folderId);
    modalFeatures.closeModal();
  };

  return (
    <div ref={modalRef} className="fixed top-3 left-3 z-50">
      {/* inset-0 bg-black bg-opacity-50 */}
      <div className="h-96 w-[535px] text-[#b3b3b3] bg-[#121212] border border-[#333333] rounded-md">
        <span
          onClick={closeModal}
          className="cursor-pointer absolute top-5 right-5 hover:text-[#f2f2f2]"
        >
          <FaTimes />
        </span>

        <span className=" flex items-center mx-2 mt-1 mb-3 gap-1.5 px-3 pt-2">
          <img src="/src/assets/open-folder.svg" className="w-7" />
          <h1 className="text-xl font-bold">My Works</h1>
        </span>

        <hr className="border-[#333333] mx-3" />

        <div className="mt-4 pl-5 pr-1">
          <div className="max-h-[300px] relative overflow-y-auto scrollbar-thin scrollbar-thumb-[#555] scrollbar-track-[#222] pr-2">
            <table className="w-full border-collapse">
              {/* Fixed Header */}
              <thead className="bg-[#121212] sticky top-0 z-10">
                <tr className="border-b border-[#444]">
                  <th className="text-left pb-3 px-12">Folder Name</th>
                  <th className="text-left pb-3 px-16">Files</th>
                </tr>
              </thead>

              {/* Scrollable Table Body */}
              <tbody>
                {folders?.map((folder) => (
                  <React.Fragment key={folder?.id}>
                    <tr
                      onClick={() => toggleFolder(folder?.id)}
                      onDoubleClick={() => handleSelectFolder(folder.id)}
                      className="cursor-pointer hover:bg-[#222] border-y border-[#444]"
                    >
                      <td className="py-0.5 flex items-center px-6">
                        {isOpen[folder?.id] ? (
                          <IoMdArrowDropdown className="mr-2" />
                        ) : (
                          <IoMdArrowDropright className="mr-2" />
                        )}
                        <FcFolder className="text-lg mr-2" />
                        {folder?.title}
                      </td>
                      <td className="italic px-[60px]">
                        {folder?.file?.length > 0
                          ? `${folder.file.length} files`
                          : "No files"}
                      </td>
                    </tr>

                    {isOpen[folder?.id] && (
                      <tr>
                        <td colSpan="2">
                          <table className="w-full">
                            <tbody>
                              {folder?.file?.map((file) => (
                                <tr key={file?.id}>
                                  <td className="flex items-center py-1 gap-2 w-1/2 px-12">
                                    {getIcon[file.icon]}
                                    {file.title}
                                  </td>
                                  <td className="italic text-xs px-14 py-1 w-1/2 text-gray-400">
                                    Type: {file.fileType}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
