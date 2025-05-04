import { createContext, useState} from 'react';

export const ModalContext = createContext();

export const modalConstants = {
    CREATE_WORK : 'CREATE_WORK',
    CREATE_FOLDER : 'CREATE_FOLDER',
    UPDATE_FOLDER_TITLE : 'UPDATE_FOLDER_TITLE',
    UPDATE_FILE_TITLE : 'UPDATE_FILE_TITLE',
    CREATE_FILE : 'CREATE_FILE',
    OPEN_FOLDER : 'OPEN_FOLDER',
    INPUT_FOLDER : 'INPUT_FOLDER',
};

export const ModalProvider = ({children}) => {
    const [modalType, setModalType] = useState(null);
    const [modalPayLoad, setModalPayLoad] = useState(null);
    const [folderFileNameLoad, setFolderFileNameLoad] = useState("");

    const closeModal = () => {
        setModalType(null);
        setModalPayLoad(null);
    };

    const modalFeatures = {
        openModal : setModalType,
        closeModal,
        activeModal : modalType,
        setModalPayLoad,
        modalPayLoad,
        setFolderFileNameLoad,
        folderFileNameLoad,
    };

    return (
        <ModalContext.Provider value={modalFeatures}> 
            {children}
        </ModalContext.Provider>
    );
}