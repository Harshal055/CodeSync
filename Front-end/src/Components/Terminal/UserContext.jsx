import React, { createContext, useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // Adjust path if needed

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
  // Firebase Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Legacy local state (kept for compatibility with existing components)
  const [image, setImage] = useState(() => localStorage.getItem("userImage") || null);
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem("userData");
    return stored ? JSON.parse(stored) : { firstName: "", lastName: "", email: "", mobile: "" };
  });

  // --- Firebase Auth Functions ---

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Fetch additional user data from Firestore if needed
    const docRef = doc(db, "users", userCredential.user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserData(data);
      localStorage.setItem("userData", JSON.stringify(data));
    }
    return userCredential.user;
  };

  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });

    // Save user profile to Firestore
    const userProfile = {
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || "",
      email: email,
      uid: userCredential.user.uid
    };

    await setDoc(doc(db, "users", userCredential.user.uid), userProfile);
    setUserData(userProfile);
    localStorage.setItem("userData", JSON.stringify(userProfile));

    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUserData({ firstName: "", lastName: "", email: "", mobile: "" });
    localStorage.removeItem("userData");
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user data on load
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          localStorage.setItem("userData", JSON.stringify(docSnap.data()));
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    downloadProjectZip: async () => {
      try {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        folders.forEach(folder => {
          if (!folder.title) return;
          const folderHelper = zip.folder(folder.title);
          if (folder.file && Array.isArray(folder.file)) {
            folder.file.forEach(file => {
              if (file.title) {
                let fileName = file.title;
                if (!fileName.includes('.')) {
                  const map = { javascript: 'js', python: 'py', cpp: 'cpp', java: 'java', plaintext: 'txt' };
                  fileName += `.${map[file.language] || 'txt'}`;
                }
                folderHelper.file(fileName, file.code || "");
              }
            })
          }
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CodeSync_Project.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to zip project:", err);
        alert("Failed to download project.");
      }
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
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
      {!loading && children}
    </UserContext.Provider>
  );
};
