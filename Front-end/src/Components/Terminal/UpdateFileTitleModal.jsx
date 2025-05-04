import { useContext, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ModalContext } from "./ModalContext";
import { UserContext } from "./UserContext";

export const UpdateFileTitleModal = () => {
  const modalFeatures = useContext(ModalContext);
  const { folderFeatures } = useContext(UserContext);
  const { fileId, id: folderId } = modalFeatures.modalPayLoad;
  const nameFile = modalFeatures.folderFileNameLoad

  const closeModal = () => {
    modalFeatures.closeModal();
  };

  const onSubmitModal = (e) => {
    e.preventDefault();
    const fileName = e.target.fileName.value;
    folderFeatures.editFileTitle(fileName, folderId, fileId);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <form
        onSubmit={onSubmitModal}
        className="relative h-auto p-[40px] bg-white rounded-lg flex flex-col gap-[20px]"
        style={{ boxShadow: "4px 4px 4px gray" }}
      >
        <span
          onClick={closeModal}
          className="cursor-pointer absolute top-4 right-[16px]"
        >
          <FaTimes />
        </span>
        <h1 className="mb-1 text-[28px] font-bold">Edit File Name</h1>
        <div className="flex justify-between items-center gap-5">
          <p className="text-[19px] font-semibold">Enter File Name</p>
          <input
            name="fileName"
            required
            className="h-9 px-2 py-1 rounded-sm outline outline-1 outline-gray-400"
            style={{ boxShadow: "2px 2px 6px 1px" }}
            defaultValue={nameFile}
          />
        </div>
        <div className="flex justify-end font-medium">
          <button
            type="submit"
            className="mt-2 p-2 bg-gray-400 rounded-sm outline outline-0 hover:bg-gray-300 duration-300"
            style={{ boxShadow: "2px 2px 6px 1px" }}
          >
            Edit File
          </button>
        </div>
      </form>
    </div>
  );
};
