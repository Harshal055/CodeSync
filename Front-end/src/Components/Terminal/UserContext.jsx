import React, { createContext, useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";

export const UserContext = createContext();

export const defaultCodes = {
  cpp: `
          #include <iostream>
          int main()
          {
              std::cout<<"Hello World";
              return 0;
          }
      `,
  javascript: `console.log("Hello Javascript");`,
  python: `print("Hello Python");`,
  java: `
          public class Main
          {
              public static void main(String[] args) {
                  System.out.println("Hello World");
              }
          }
      `,
};

export const UserProvider = ({ children }) => {
  // Load user image from localStorage or set defaults
  const [image, setImage] = useState(() => {
    const storedImage = localStorage.getItem("userImage");
    return storedImage ? storedImage : null;
  });

  // Load user data from localStorage or set defaults
  const [userData, setUserData] = useState(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      return JSON.parse(storedData);
    }
    const defaultData = { firstName: "", lastName: "", email: "", mobile: "" };
    localStorage.setItem("userData", JSON.stringify(defaultData));
    return defaultData;
  });

  const folderData = [
    {
      id: uuidV4(),
      title: "Tejas",
      file: [
        {
          id: uuidV4(),
          title: "index",
          language: "cpp",
          fileType: "C++ Source File",
          icon: "TbBrandCpp",
          code: `cout<<"Hello world";`,
        },
      ],
    },
    {
      id: uuidV4(),
      title: "Folder1",
      file: [
        {
          id: uuidV4(),
          title: "test",
          language: "javascript",
          fileType: "JavaScript File",
          icon: "SiJavascript",
          code: `console.log("Hello frontend");`,
        },
      ],
    },
  ];

 
  

  const [folders, setFolders] = useState(() => {
    const localData = localStorage.getItem("folderData");
    try {
      const parsed = JSON.parse(localData);
      if (!Array.isArray(parsed)) return folderData;

      // Filter out corrupted folders (missing id, title, or files)
      const sanitized = parsed.filter(
        (f) => f && f.id && f.title && Array.isArray(f.file)
      );

      return sanitized.length ? sanitized : folderData;
    } catch (error) {
      console.error("Error parsing folder data from localStorage:", error);
      return folderData;
    }
  });

  const createNewWork = (newWork) => {
    const { fileName, folderName, language, fileType, icon } = newWork;
    const newFolders = [...folders];
    newFolders.push({
      id: uuidV4(),
      title: folderName,
      file: [
        {
          id: uuidV4(),
          title: fileName,
          language,
          fileType,
          icon,
          code: defaultCodes[language],
        },
      ],
    });

    localStorage.setItem("folderData", JSON.stringify(newFolders));
    setFolders(newFolders);
  };

  const [folderId, setFolderId] = useState(null);

  const createNewFolder = (folderName) => {
    const newFolder = {
      id: uuidV4(),
      title: folderName,
      file: [],
    };

    const allFolders = [...folders, newFolder];
    localStorage.setItem("folderData", JSON.stringify(allFolders));
    setFolders(allFolders);

    return newFolder; // Ensure it returns the new folder
  };

  const getLanguageByExtension = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "js":
        return {
          language: "javascript",
          fileType: "JavaScript File",
          iconType: "SiJavascript",
        };
      case "cpp":
        return {
          language: "cpp",
          fileType: "C++ Source File",
          iconType: "TbBrandCpp",
        };
      case "py":
        return {
          language: "python",
          fileType: "Python Script",
          iconType: "SiPython",
        };
      case "java":
        return {
          language: "java",
          fileType: "Java Source File",
          iconType: "FaJava",
        };
      default:
        return {
          language: "plaintext",
          fileType: "Unknown File",
          iconType: "FaFile",
        };
    }
  };

  const deleteFolder = (id) => {
    const updatedFoldersList = folders.filter((folderItem) => {
      return folderItem.id !== id;
    });

    localStorage.setItem("folderData", JSON.stringify(updatedFoldersList));
    setFolders(updatedFoldersList);
  };

  const editFolderTitle = (newFolderName, id) => {
    const updatedFoldersList = folders.map((folderItem) => {
      if (folderItem && folderItem.id === id) {
        return { ...folderItem, title: newFolderName };
      }
      return folderItem;
    });

    localStorage.setItem("folderData", JSON.stringify(updatedFoldersList));
    setFolders(updatedFoldersList);
  };

  const editFileTitle = (newFileName, folderId, fileId) => {
    const copiedFolders = [...folders];
    for (let i = 0; i < copiedFolders.length; i++) {
      if (folderId === copiedFolders[i].id) {
        const file = copiedFolders[i].file;
        for (let j = 0; j < file.length; j++) {
          if (file[j].id === fileId) {
            file[j].title = newFileName;

            const { language, fileType, iconType } =
              getLanguageByExtension(newFileName);
            file[j].language = language;
            file[j].fileType = fileType;
            file[j].icon = iconType;
            // 🔥 Preserve the existing code instead of overwriting it
            file[j].code = defaultCodes[language];
            break;
          }
        }
        break;
      }
    }

    localStorage.setItem("folderData", JSON.stringify(copiedFolders));
    setFolders(copiedFolders);
  };

  const deleteFile = (folderId, fileId) => {
    const copiedFolders = [...folders];
    for (let i = 0; i < copiedFolders.length; i++) {
      if (folderId === copiedFolders[i].id) {
        const file = [...copiedFolders[i].file];
        copiedFolders[i].file = file.filter((file) => {
          return file.id !== fileId;
        });
        break;
      }
    }

    localStorage.setItem("folderData", JSON.stringify(copiedFolders));
    setFolders(copiedFolders);
  };

  const createNewFile = (folderId, newFile) => {
    const updatedFoldersList = [...folders];
    for (let i = 0; i < updatedFoldersList.length; i++) {
      if (updatedFoldersList[i].id === folderId) {
        updatedFoldersList[i].file.push(newFile);
        break;
      }
    }

    localStorage.setItem("folderData", JSON.stringify(updatedFoldersList));
    setFolders(updatedFoldersList);
  };

  const getFolderById = (folderId) => {
    const folder = folders.find((f) => f && f.id === folderId);
    return folder || null;
  };

  const getFileById = (fileId) => {
    for (const folder of folders) {
      if (!folder || !folder.file) continue;
      const file = folder.file.find((f) => f.id === fileId);
      if (file) return file;
    }
    return null;
  };

  const saveCode = (fileId, folderId, newCode) => {
    const newFolders = [...folders];
    for (let i = 0; i < newFolders.length; i++) {
      if (newFolders[i].id === folderId) {
        for (let j = 0; j < newFolders[i].file.length; j++) {
          const currentFile = newFolders[i].file[j];
          if (fileId === currentFile.id) {
            newFolders[i].file[j].code = newCode;
          }
        }
      }
    }
    localStorage.setItem("folderData", JSON.stringify(newFolders));
    setFolders(newFolders);
  };

  const syncFromRemote = (remoteFolders, remoteFiles, skipSave = false) => {
    const updatedFolders = [...folders];

    remoteFolders.forEach((remoteFolder) => {
      if (!remoteFolder?.id || !remoteFolder?.title) return;

      let folder = updatedFolders.find((f) => f.id === remoteFolder.id);

      if (!folder) {
        folder = { ...remoteFolder, file: [] };
        updatedFolders.push(folder);
      } else if (!folder.file) {
        folder.file = [];
      }

      const remoteFolderFiles = remoteFiles.filter(
        (f) => f.folderId === remoteFolder.id
      );

      remoteFolderFiles.forEach((file) => {
        const exists = folder.file.some((f) => f.id === file.id);
        if (!exists) {
          folder.file.push(file);
        }
      });
    });

    setFolders(updatedFolders);

    if (!skipSave) {
      localStorage.setItem("folderData", JSON.stringify(updatedFolders));
    }
  };

  const removeFolderIfRemote = (folderId) => {
    setFolders((prev) => {
      const newFolders = prev.filter((folder) => folder.id !== folderId);
      localStorage.setItem("folderData", JSON.stringify(newFolders));
      return newFolders;
    });
  };

  // Update localStorage when `userData` changes
  useEffect(() => {
    if (
      userData.firstName !== "" ||
      userData.lastName !== "" ||
      userData.email !== "" ||
      userData.mobile !== ""
    ) {
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [userData]);

  // Update localStorage when `image` changes
  useEffect(() => {
    if (image) {
      localStorage.setItem("userImage", image);
    }
  }, [image]);

  // Update localStorage when `folders` changes
  useEffect(() => {
    localStorage.setItem("folderData", JSON.stringify(folders));
  }, [folders]);

  const folderFeatures = {
    folders,
    createNewWork,
    createNewFolder,
    deleteFolder,
    editFolderTitle,
    editFileTitle,
    deleteFile,
    getLanguageByExtension,
    createNewFile,
    getFolderById,
    getFileById,
    saveCode,
    syncFromRemote,
    removeFolderIfRemote,
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        image,
        setImage,
        folders,
        setFolders,
        folderId,
        setFolderId,
        folderFeatures,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
