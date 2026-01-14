import React, { useState, useContext, useEffect } from "react";
import UserForm from "./UserForm";
import { IoChevronBackCircleSharp, IoAddOutline } from "react-icons/io5";
import {
  FaUserCircle,
  FaPlus,
  FaCamera,
  FaTrashAlt,
  FaEdit
} from "react-icons/fa";
import { TbDeviceDesktopPlus } from "react-icons/tb";
import { FaFileMedical, FaFolderPlus } from "react-icons/fa6";
import { RiEdit2Fill } from "react-icons/ri";
import { MdDeleteOutline } from "react-icons/md";
import { UserContext } from "./UserContext";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import { Modal } from "./Modal";
import { modalConstants, ModalContext } from "./ModalContext";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { userData, setUserData, image, setImage, folders, setFolders, folderFeatures } =
    useContext(UserContext);
  const modalFeatures = useContext(ModalContext);
  const navigate = useNavigate();

  // Load user data from localStorage on mount if context is empty
  useEffect(() => {
    if (!userData) {
      const storedUserDataString = localStorage.getItem("user");
      if (storedUserDataString) {
        try {
          const storedUserData = JSON.parse(storedUserDataString);
          if (storedUserData && storedUserData.email) {
            setUserData(storedUserData);
          }
        } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
        }
      }
    }
  }, [userData, setUserData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setImage(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseForm = () => {
    setIsEditing(false);
  };

  const handleFormSubmit = (formData) => {
    setUserData({
      ...userData,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
    });
    handleCloseForm();
  };

  const getInitials = () => {
    const { firstName, lastName, email } = userData || {};
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (email) {
      return `${email[0]}${email[1]}`.toLowerCase();
    }
    return null;
  };

  const openCreateFolderModal = () => {
    modalFeatures.openModal(modalConstants.CREATE_WORK);
  };

  const openCreateNewFolderModal = () => {
    modalFeatures.openModal(modalConstants.CREATE_FOLDER);
  };

  const openCreateNewFileModal = (folder) => {
    modalFeatures.openModal(modalConstants.CREATE_FILE);
    modalFeatures.setModalPayLoad(folder.id);
  };

  const onEditFolderTitle = (folder) => {
    if (!folder || !folder.id) {
      return;
    }
    modalFeatures.openModal(modalConstants.UPDATE_FOLDER_TITLE);
    modalFeatures.setModalPayLoad(folder.id);
    modalFeatures.setFolderFileNameLoad(folder.title);
  };

  const onEditFileTitle = (file, folder) => {
    modalFeatures.openModal(modalConstants.UPDATE_FILE_TITLE)
    modalFeatures.setModalPayLoad({ fileId: file.id, id: folder.id })
    modalFeatures.setFolderFileNameLoad(file.title)
  };

  const getIcon = {
    SiJavascript: <img src="/src/assets/javascript.svg" className="w-8" alt="JS" />,
    FaJava: <img src="/src/assets/java.svg" className="w-8" alt="Java" />,
    TbBrandCpp: <img src="/src/assets/cpp.svg" className="h-6" alt="C++" />,
    SiPython: <img src="/src/assets/python.svg" className="w-8" alt="Python" />,
    FaFile: <img src="/src/assets/document.svg" className="w-8" alt="File" />,
  };

  const navigateToEditor = (folder) => {
    navigate(`/Editor/folder/${folder.id}`)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-4 lg:p-8 font-sans text-slate-200">
      <Modal />
      <nav className="mb-6 flex justify-between items-center">
        <Link to="/RoomCreate" className="inline-block hover:opacity-80 transition-opacity">
          <IoChevronBackCircleSharp className="text-4xl text-white shadow-drop-lg" />
        </Link>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          User Profile
        </h1>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">

        {/* Profile Card */}
        <div className="lg:w-1/3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
          <div className="relative group mb-6">
            <div className="rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-500 shadow-xl">
              {image ? (
                <img
                  src={image}
                  className="w-40 h-40 rounded-full object-cover border-4 border-[#121212]"
                  alt="Profile"
                />
              ) : getInitials() ? (
                <div className="w-40 h-40 flex items-center justify-center text-white text-5xl font-bold rounded-full bg-[#121212]">
                  {getInitials()}
                </div>
              ) : (
                <FaUserCircle className="w-40 h-40 text-slate-300 rounded-full bg-black" />
              )}
            </div>

            <label className="absolute bottom-2 right-2 cursor-pointer bg-blue-600 hover:bg-blue-500 p-2.5 rounded-full text-white shadow-lg transition-transform transform group-hover:scale-110">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {image ? <FaCamera size={18} /> : <FaPlus size={18} />}
            </label>
          </div>

          <div className="text-center w-full mb-6">
            <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">
              {userData?.firstName || "Welcome"} {userData?.lastName || ""}
            </h2>
            <p className="text-blue-200 text-sm font-medium">{userData?.email || "No Email Provided"}</p>
          </div>

          <div className="flex gap-3 w-full justify-center">
            <button
              onClick={handleEditClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-semibold transition-all shadow-md group"
            >
              <FaEdit className="group-hover:text-blue-400 transition-colors" /> Edit Profile
            </button>
            {image && (
              <button
                onClick={handleImageDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-semibold text-red-200 transition-all shadow-md"
              >
                <FaTrashAlt /> Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* Works Section */}
        <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 lg:p-8 shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-hide">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">My Workspace</h2>
              <p className="text-gray-400 text-sm">Manage your projects and files</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openCreateFolderModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/30"
              >
                <IoAddOutline size={20} />
                <span className="hidden sm:inline">New Work</span>
              </button>
              <button
                onClick={openCreateNewFolderModal}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-purple-500/30"
              >
                <FaFolderPlus size={18} />
                <span className="hidden sm:inline">New Folder</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {folders?.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">No folders found. Create one to get started!</p>
              </div>
            )}

            {folders?.map((folder) => (
              <div key={folder?.id || "default-id"} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all">
                {/* Folder Header */}
                <div className="flex justify-between items-center mb-4">
                  <div
                    onClick={() => navigateToEditor(folder)}
                    className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
                  >
                    <img src="/src/assets/folder.svg" className="w-10 drop-shadow-md group-hover:scale-105 transition-transform" alt="Folder" />
                    <h3 className="text-lg font-semibold text-white tracking-wide">{folder?.title}</h3>
                  </div>

                  <div className="flex gap-2">
                    <button title="Edit Folder" onClick={() => onEditFolderTitle(folder)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-blue-400">
                      <RiEdit2Fill size={18} />
                    </button>
                    <button title="Delete Folder" onClick={() => folderFeatures.deleteFolder(folder.id)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-red-400">
                      <MdDeleteOutline size={20} />
                    </button>
                    <button
                      title="Add File"
                      onClick={() => openCreateNewFileModal(folder)}
                      className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-md ml-2 transition-all border border-white/10"
                    >
                      <FaPlus size={10} /> Add File
                    </button>
                  </div>
                </div>

                {/* Files Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {folder?.file?.length === 0 && (
                    <div className="text-gray-500 text-sm italic col-span-full ml-12">No files in this folder.</div>
                  )}
                  {folder?.file?.map((file) => (
                    <div
                      key={file?.id}
                      className="group bg-[#1e1e1e]/50 hover:bg-[#2a2a2a] border border-white/5 hover:border-blue-500/30 rounded-lg p-3 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl"
                    >
                      <div
                        onClick={() => {
                          localStorage.setItem("selectedFile", JSON.stringify(file.id));
                          navigateToEditor(folder);
                        }}
                        className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer"
                      >
                        <div className="p-2 bg-black/30 rounded-md group-hover:bg-black/50 transition-colors">
                          {getIcon[file?.icon] || <FaFile className="text-gray-400" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium text-gray-200 truncate group-hover:text-blue-300 transition-colors">{file?.title}</span>
                          <span className="text-[10px] text-gray-500 bg-white/5 self-start px-1.5 rounded uppercase tracking-wider mt-0.5">{file?.language}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onEditFileTitle(file, folder) }} className="text-gray-400 hover:text-blue-400 p-1">
                          <RiEdit2Fill size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); folderFeatures.deleteFile(folder.id, file.id) }} className="text-gray-400 hover:text-red-400 p-1">
                          <MdDeleteOutline size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditing && (
        <UserForm
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          initialData={userData}
        />
      )}
    </div>
  );
};

export default UserProfile;
