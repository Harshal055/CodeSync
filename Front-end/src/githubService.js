import axios from "axios";

const GITHUB_API_URL = "https://api.github.com";

export const validateToken = async (token) => {
    try {
        const response = await axios.get(`${GITHUB_API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data; // Returns user info
    } catch (error) {
        console.error("Invalid Token", error);
        return null;
    }
};

export const getUserRepos = async (token, username) => {
    try {
        const response = await axios.get(`${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=100`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching repos", error);
        return [];
    }
};

export const commitAndPush = async ({ token, owner, repo, branch = "main", files, message }) => {
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
    };

    try {
        // 1. Get the current commit SHA of the branch
        const refResponse = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
        const latestCommitSha = refResponse.data.object.sha;

        // 2. Get the tree SHA of that commit
        const commitResponse = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
        const baseTreeSha = commitResponse.data.tree.sha;

        // 3. Create a new Tree
        // files: [{ path: "src/App.js", content: "..." }]
        const treeItems = files.map(file => ({
            path: file.path,
            mode: "100644", // standard file
            type: "blob",
            content: file.content
        }));

        const treeResponse = await axios.post(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees`, {
            base_tree: baseTreeSha,
            tree: treeItems
        }, { headers });

        const newTreeSha = treeResponse.data.sha;

        // 4. Create a Commit
        const newCommitResponse = await axios.post(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/commits`, {
            message: message || "Update from CodeSync",
            tree: newTreeSha,
            parents: [latestCommitSha]
        }, { headers });

        const newCommitSha = newCommitResponse.data.sha;

        // 5. Update Reference (Push)
        await axios.patch(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
            sha: newCommitSha
        }, { headers });

        return { success: true, sha: newCommitSha };

    } catch (error) {
        console.error("Commit Code Failed:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};
