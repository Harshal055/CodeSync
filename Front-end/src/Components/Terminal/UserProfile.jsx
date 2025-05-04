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
    // Only try to load from localStorage if context doesn't already have userData
    if (!userData) {
      const storedUserDataString = localStorage.getItem("user");
      if (storedUserDataString) {
        try {
          const storedUserData = JSON.parse(storedUserDataString);
          // Check if the parsed data looks valid before setting it
          if (storedUserData && storedUserData.email) {
            setUserData(storedUserData); // Update the context
          }
        } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
        }
      }
    }
  }, [userData, setUserData]); // Re-run if userData or setUserData changes

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
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
    });
    handleCloseForm();
  };

  const getInitials = () => {
    const { firstName, lastName, email } = userData || {}; // Add default empty object
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
      console.warn("Tried to edit a folder, but folder is invalid:", folder);
      return;
    }
  
    modalFeatures.openModal(modalConstants.UPDATE_FOLDER_TITLE);
    modalFeatures.setModalPayLoad(folder.id);
    modalFeatures.setFolderFileNameLoad(folder.title);
  };
  

  const onEditFileTitle = (file, folder) => {
    modalFeatures.openModal(modalConstants.UPDATE_FILE_TITLE)
    modalFeatures.setModalPayLoad({fileId : file.id, id: folder.id})
    modalFeatures.setFolderFileNameLoad(file.title)
  };

  const getIcon = {
    SiJavascript: <img src="/src/assets/javascript.svg" className="w-9" />,
    FaJava: <img src="/src/assets/java.svg" className="w-9" />,
    TbBrandCpp: <img src="/src/assets/cpp.svg" className="h-6"/>,
    SiPython: <img src="/src/assets/python.svg" className="w-9" />,
    FaFile: <img src="/src/assets/document.svg" className="w-9" />,
  };

  const navigateToEditor = (folder) => {
    navigate(`/Editor/folder/${folder.id}`)
  };

  return (
    <div className="h-screen bg-black">
      <Modal />
      <nav className="p-2">
        <Link to="/Home" className="inline-block">
          <IoChevronBackCircleSharp className="text-3xl text-white cursor-pointer" />
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-5 px-5 pt-6">
        <div className="bg-[#121212] h-[350px] lg:h-[869px] rounded-md py-9 lg:px-9">
          <div className="flex justify-between bg-gradient-to-r from-blue-500 to-purple-500 h-32 lg:w-[370px] lg:rounded-lg">
            <div className="relative left-8 top-12 lg:left-6">
              {image ? (
                <img
                  src={image}
                  className="w-32 h-32 rounded-full object-cover border"
                />
              ) : getInitials() ? (
                <div className="w-32 h-32 flex items-center justify-center text-slate-200 text-4xl font-bold border rounded-full bg-[#121212]">
                  {getInitials()}
                </div>
              ) : (
                <FaUserCircle className="w-32 h-32 text-slate-200 bg-black rounded-full" />
              )}
              <label className="absolute bottom-0 right-0 cursor-pointer text-slate-200 bg-blue-500 p-2 rounded-full hover:bg-blue-600">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {image ? <FaCamera /> : <FaPlus />}
              </label>
            </div>
            <div className="relative top-24 right-2">
              {image && (
                <button
                  onClick={handleImageDelete}
                  className="text-xs text-slate-200 flex items-center gap-1.5 px-2 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded-md transition ease-in-out delay-150 duration-300"
                >
                  <FaTrashAlt />
                  <span>Delete Photo</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-slate-200 relative top-16 left-10 lg:left-7 space-y-2">
              {/* Add checks for userData before accessing properties */}
              <div className="text-2xl font-bold">{userData?.firstName} {userData?.lastName}</div>
              <div>{userData?.email}</div>
            </div>
            <div className="relative right-2.5 top-2">
              <button
                onClick={handleEditClick}
                className="text-slate-200 flex items-center gap-1.5 px-2 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded-md transition ease-in-out delay-150 duration-300"
              >
                <FaEdit />
                <span>Edit</span>
              </button>
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

        <div className="bg-[#121212] text-slate-200 rounded-md pt-10 pb-6 lg:w-[76%] space-y-8">
          <div className="flex justify-between items-center border-b pb-4 ml-11 mr-16">
            <div className="text-[28px] font-extrabold">
              <span className="font-medium">My</span> Works
            </div>

            <div className="flex items-center">
              <div className="flex md:hidden items-center mr-[-7px] gap-4">
                <button onClick={openCreateFolderModal}>
                  <span className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]">
                    <TbDeviceDesktopPlus size={28} />
                  </span>
                </button>
                <button onClick={openCreateNewFolderModal}>
                  <span className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]">
                    <FaFolderPlus size={26} />
                  </span>
                </button>
              </div>

              <div className="space-x-2.5">
                <button onClick={openCreateFolderModal}>
                  <span className="hidden md:flex items-center bg-[#2a2a2a] hover:bg-[#333333] px-2 py-1.5 mt-1 gap-1.5 font-semibold rounded-md transition ease-in-out delay-150 duration-300">
                    <IoAddOutline size={21} />
                    <span>New Work</span>
                  </span>
                </button>
                <button onClick={openCreateNewFolderModal}>
                  <span className="hidden md:flex items-center bg-[#2a2a2a] hover:bg-[#333333] px-2 py-1.5 mt-1 gap-1.5 font-semibold rounded-md transition ease-in-out delay-150 duration-300">
                    <IoAddOutline size={21} />
                    <span>New Folder</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="folder-section h-[340px] lg:h-[700px] ml-11 mr-5 pr-9">
            {folders?.map((folder) => (
              <div key={folder?.id || "default-id"} id={folder?.id || "default-id"} >
                <div className="flex justify-between text-slate-200 border-b mb-8 py-4">
                  <div onClick={() => navigateToEditor(folder)} className="cursor-pointer flex items-center gap-2 font-semibold text-xl overflow-hidden ">
                    <span>
                      <img src="/src/assets/folder.svg" className="w-7" />
                    </span>
                    <span className="w-32 sm:w-64 md:w-96 lg:w-48 xl:w-full truncate">
                      {folder?.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]">
                      <MdDeleteOutline size={26} onClick={() => folderFeatures.deleteFolder(folder.id)}/>
                    </span>
                    <span className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]">
                      <RiEdit2Fill size={26} onClick={() => onEditFolderTitle(folder)} />
                    </span>
                    <button onClick={() => openCreateNewFileModal(folder)}>
                      <span className="block md:hidden cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]">
                        <FaFileMedical size={22} />
                      </span>
                      <span className="hidden md:flex items-center gap-1.5 font-medium bg-[#2a2a2a] hover:bg-[#333333] px-2 py-1 rounded-md transition ease-in-out delay-150 duration-300">
                        <IoAddOutline size={21} />
                        <span>New File</span>
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between px-6 lg:px-8">
                  {folder?.file?.map((file) => (
                    <div
                      key={file?.id}
                      className="cursor-pointer bg-[#181818] hover:bg-[#282828] w-full md:w-[45%] px-5 py-3 mb-9 text-slate-200 text-lg font-medium flex items-center justify-between rounded-md transition ease-in-out delay-150 hover:scale-110 outline:gary-500 hover:outline-gray-600 hover:outline-[4px] duration-300"
                      style={{ boxShadow: "1px 1px 6px -1px white" }}
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <div className="text-slate-200">
                          {getIcon[file?.icon]}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="truncate">{file?.title}</span>
                          <span className="truncate">
                            Language : {file?.language}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]">
                          <MdDeleteOutline size={25} onClick={() => folderFeatures.deleteFile(folder.id, file.id)}/>
                        </span>
                        <span className="cursor-pointer text-[#b3b3b3] hover:text-[#f2f2f2]">
                          <RiEdit2Fill size={25} onClick={() => onEditFileTitle(file, folder)}/>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
