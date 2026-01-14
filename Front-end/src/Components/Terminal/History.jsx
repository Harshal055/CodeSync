import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import {
    subscribeToFileVersions,
    saveFileVersion
} from "../../firebaseService";
import {
    validateToken,
    getUserRepos,
    commitAndPush
} from "../../githubService";
import {
    FaHistory,
    FaGithub,
    FaSave,
    FaUndo,
    FaCodeBranch,
    FaCheck,
    FaSpinner
} from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import toast from "react-hot-toast";

const History = ({ roomId, fileId, currentCode, onRestore }) => {
    const { user, folders } = useContext(UserContext); // Access folders from context
    const [activeTab, setActiveTab] = useState("versions");
    const [versions, setVersions] = useState([]);

    // GitHub State
    const [ghToken, setGhToken] = useState(() => localStorage.getItem("gh_token") || "");
    const [ghUser, setGhUser] = useState(null);
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState("");
    const [commitMsg, setCommitMsg] = useState("Update from CodeSync");
    const [loading, setLoading] = useState(false);
    const [pushing, setPushing] = useState(false);

    // --- Internal Versions Logic ---
    useEffect(() => {
        if (!roomId || !fileId) return;
        const unsubscribe = subscribeToFileVersions(roomId, fileId, (data) => {
            setVersions(data);
        });
        return () => unsubscribe();
    }, [roomId, fileId]);

    const handleCreateSnapshot = async () => {
        if (!currentCode) return toast.error("No code to save!");
        try {
            await saveFileVersion(roomId, fileId, currentCode, user, "manual", "User Snapshot");
            toast.success("Snapshot created!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create snapshot");
        }
    };

    const handleRestore = (code) => {
        if (window.confirm("Restore this version? current changes will be overwritten.")) {
            onRestore(code);
            toast.success("Version restored!");
        }
    };

    // --- GitHub Logic ---
    const handleVerifyToken = async () => {
        if (!ghToken) return;
        setLoading(true);
        const userData = await validateToken(ghToken);
        if (userData) {
            setGhUser(userData);
            localStorage.setItem("gh_token", ghToken);
            toast.success(`Logged in as ${userData.login}`);
            loadRepos(userData.login);
        } else {
            toast.error("Invalid Token");
        }
        setLoading(false);
    };

    const loadRepos = async (username) => {
        setLoading(true);
        const userRepos = await getUserRepos(ghToken, username);
        setRepos(userRepos);
        setLoading(false);
    };

    const handlePush = async () => {
        if (!selectedRepo) return toast.error("Select a repository");
        setPushing(true);

        const allFiles = [];

        // Flatten folders from context
        if (folders && Array.isArray(folders)) {
            folders.forEach(folder => {
                const folderName = folder.title;
                if (folder.file && Array.isArray(folder.file)) {
                    folder.file.forEach(f => {
                        let fileName = f.title;
                        // Add extension if missing
                        if (!fileName.includes('.')) {
                            const map = { javascript: 'js', python: 'py', cpp: 'cpp', java: 'java', plaintext: 'txt' };
                            fileName += `.${map[f.language] || 'txt'}`;
                        }

                        allFiles.push({
                            path: `${folderName}/${fileName}`,
                            content: f.code || ""
                        });
                    });
                }
            });
        }

        if (allFiles.length === 0) {
            // Try fallback if folders are empty but we have current code?
            // No, we should rely on folders context.
            toast.error("No files found to push");
            setPushing(false);
            return;
        }

        const result = await commitAndPush({
            token: ghToken,
            owner: ghUser.login,
            repo: selectedRepo,
            branch: "main",
            files: allFiles,
            message: commitMsg
        });

        if (result.success) {
            toast.success("Pushed to GitHub successfully!");
            setCommitMsg("Update from CodeSync");
        } else {
            toast.error("Failed to push: " + result.error);
        }

        setPushing(false);
    };

    return (
        <div className="flex flex-col h-full text-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab("versions")}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "versions" ? "bg-white/5 text-white border-b-2 border-blue-500" : "text-gray-400 hover:text-white"}`}
                >
                    <FaHistory /> History
                </button>
                <button
                    onClick={() => setActiveTab("github")}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "github" ? "bg-white/5 text-white border-b-2 border-purple-500" : "text-gray-400 hover:text-white"}`}
                >
                    <FaGithub /> GitHub
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scroll p-4">
                {activeTab === "versions" && (
                    <div className="space-y-4">
                        <button
                            onClick={handleCreateSnapshot}
                            className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-sm"
                        >
                            <FaSave /> Create Snapshot
                        </button>

                        <div className="space-y-3">
                            {versions.length === 0 && <p className="text-gray-500 text-center text-sm mt-4">No snapshots yet.</p>}
                            {versions.map((ver) => (
                                <div key={ver.id} className="bg-white/5 border border-white/5 rounded-lg p-3 hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${ver.type === 'manual' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {ver.type === 'manual' ? 'Manual' : 'Auto'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {ver.timestamp ? new Date(ver.timestamp).toLocaleString() : "Just now"}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-300 mb-2 truncate">
                                        {ver.label || `Version by ${ver.authorName}`}
                                    </p>
                                    <button
                                        onClick={() => handleRestore(ver.code)}
                                        className="w-full py-1.5 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center gap-2 text-xs text-gray-300 transition-colors"
                                    >
                                        <FaUndo size={10} /> Restore This Version
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "github" && (
                    <div className="space-y-4">
                        {!ghUser ? (
                            <div className="flex flex-col gap-3">
                                <p className="text-sm text-gray-400">Enter your GitHub Personal Access Token to connect.</p>
                                <input
                                    type="password"
                                    value={ghToken}
                                    onChange={(e) => setGhToken(e.target.value)}
                                    placeholder="ghp_..."
                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                                />
                                <button
                                    onClick={handleVerifyToken}
                                    disabled={loading}
                                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : <FaCheck />} Connect GitHub
                                </button>
                                <p className="text-[10px] text-gray-500">
                                    Token needs `repo` scope.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                                    <img src={ghUser.avatar_url} className="w-8 h-8 rounded-full" alt="avatar" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold truncate">{ghUser.login}</p>
                                        <p className="text-xs text-gray-400">Connected</p>
                                    </div>
                                    <button onClick={() => { setGhUser(null); setGhToken(""); localStorage.removeItem("gh_token"); }} className="text-xs text-red-400 hover:underline">Logout</button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400">Repository</label>
                                    <select
                                        value={selectedRepo}
                                        onChange={(e) => setSelectedRepo(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                                    >
                                        <option value="">Select a repository...</option>
                                        {repos.map(r => (
                                            <option key={r.id} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400">Commit Message</label>
                                    <input
                                        value={commitMsg}
                                        onChange={(e) => setCommitMsg(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                                    />
                                </div>

                                <button
                                    disabled={!selectedRepo || pushing}
                                    onClick={handlePush}
                                    className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium mt-2"
                                >
                                    {pushing ? <FaSpinner className="animate-spin" /> : <FaCodeBranch />} Push to Main
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
