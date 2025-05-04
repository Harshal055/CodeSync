import { useContext } from "react";
import { modalConstants, ModalContext } from "./ModalContext";
import { CreateWorkModal } from "./CreateWorkModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { UpdateFolderTitleModal } from "./UpdateFolderTitleModal";
import { UpdateFileTitleModal } from "./UpdateFileTitleModal";
import { CreateFileModal } from "./CreateFileModal";
import { OpenFolderModal } from "./OpenFolderModal";
import { InputFolderModal } from "./InputFolderModal";

export const Modal = () => {
    const modalFeatures = useContext(ModalContext);
    return <>
    {modalFeatures.activeModal === modalConstants.CREATE_WORK && <CreateWorkModal />}
    {modalFeatures.activeModal === modalConstants.CREATE_FOLDER && <CreateFolderModal />}
    {modalFeatures.activeModal === modalConstants.UPDATE_FOLDER_TITLE && <UpdateFolderTitleModal />}
    {modalFeatures.activeModal === modalConstants.UPDATE_FILE_TITLE && <UpdateFileTitleModal />}
    {modalFeatures.activeModal === modalConstants.CREATE_FILE && <CreateFileModal />}
    {modalFeatures.activeModal === modalConstants.OPEN_FOLDER && <OpenFolderModal />}
    {modalFeatures.activeModal === modalConstants.INPUT_FOLDER && <InputFolderModal />}
    </>
};