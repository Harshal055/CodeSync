import React from "react";
import Client from "./Client";
import { FaLock, FaLockOpen, FaUserTimes, FaCrown, FaPen, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import { updateUserRole } from "../../firebaseService";

const Participants = ({ clients, hostId, remoteHostId, micOn, currentUserId, kickUser, toggleRoomLock, roomDetails }) => {
  const hostClients = clients.filter((c) => c.hostId === remoteHostId);
  const otherClients = clients.filter((c) => c.hostId !== remoteHostId);

  // Derive my role and ownership
  // Note: roomDetails.ownerId is the ultimate source of truth for "Owner" role in terms of room management
  // But each user also has a 'role' field in 'clients' for editor permissions.
  // The creator is Owner.
  const isOwner = roomDetails?.ownerId === currentUserId;
  const isLocked = roomDetails?.isLocked;

  const handleToggleLock = () => {
    toggleRoomLock(!isLocked).then(() => {
      toast.success(isLocked ? "Room Unlocked" : "Room Locked");
    });
  };

  const handleKick = (userId) => {
    if (!window.confirm("Are you sure you want to kick this user?")) return;
    kickUser(userId);
    toast.success("User kicked.");
  };

  const handleRoleChange = (userId, newRole) => {
    if (!roomDetails?.id) return;
    updateUserRole(roomDetails.id, userId, newRole).then(() => {
      toast.success("Role updated");
    }).catch(err => {
      toast.error("Failed to update role");
      console.error(err);
    });
  };

  const RoleIcon = ({ role }) => {
    if (role === 'owner') return <FaCrown className="text-yellow-500" title="Owner" size={12} />;
    if (role === 'viewer') return <FaEye className="text-gray-400" title="Viewer" size={12} />;
    return <FaPen className="text-blue-400" title="Editor" size={12} />; // Default
  };

  return (
    <div className="w-full h-full relative box-border flex flex-col gap-2">
      {/* Room Controls (Owner Only or Status View) */}
      <div className="flex justify-between items-center px-3 py-2 bg-black/20 rounded border border-white/5 mx-1">
        <span className="text-xs text-gray-400 font-medium">Room Status:</span>
        {isOwner ? (
          <button onClick={handleToggleLock} className="text-xs flex items-center gap-1.5 text-yellow-500 hover:text-yellow-400 transition-colors bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
            {isLocked ? <><FaLock size={10} /> Locked</> : <><FaLockOpen size={10} /> Unlocked</>}
          </button>
        ) : (
          <span className="text-xs text-gray-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
            {isLocked ? <><FaLock size={10} /> Locked</> : "Open"}
          </span>
        )}
      </div>

      <div className="h-full overflow-y-auto custom-scroll px-1">
        {/* Host Section */}
        {hostClients.length > 0 && (
          <div className="mb-3">
            <div className="text-gray-400 text-xs font-semibold pl-2 mb-1 uppercase tracking-wider">Host</div>
            <div className="flex flex-col gap-1">
              {hostClients.map((client) => (
                <div key={client.socketId} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <RoleIcon role={client.role} />
                    <Client
                      userName={client.name}
                      micOn={client.micOn}
                      displayName={
                        client.socketId === currentUserId
                          ? `${client.name} (you)`
                          : client.name
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Others Section */}
        {otherClients.length > 0 && (
          <div>
            <div className="text-gray-400 text-xs font-semibold pl-2 mb-1 uppercase tracking-wider">
              Participants
            </div>
            <div className="flex flex-col gap-1">
              {otherClients.map((client) => (
                <div key={client.socketId} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {/* Role Display/Edit */}
                    {isOwner && client.role !== 'owner' ? (
                      <select
                        value={client.role || 'editor'}
                        onChange={(e) => handleRoleChange(client.socketId, e.target.value)}
                        className="bg-black/40 text-[10px] text-gray-300 rounded border border-gray-600 outline-none p-0.5 cursor-pointer hover:border-gray-400"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <RoleIcon role={client.role} />
                    )}

                    <Client
                      userName={client.name}
                      micOn={client.micOn}
                      displayName={
                        client.socketId === currentUserId
                          ? `${client.name} (you)`
                          : client.name
                      }
                    />
                  </div>

                  {isOwner && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleKick(client.socketId); }}
                      className="text-red-500/0 group-hover:text-red-500 p-1.5 rounded hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Kick User"
                    >
                      <FaUserTimes size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Participants;
