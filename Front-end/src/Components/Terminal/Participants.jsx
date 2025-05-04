import React, { useContext, useState, useEffect } from "react";
import Draggable from "react-draggable";
import Client from "./Client";
import { FaTimes } from "react-icons/fa";
import { UserContext } from "./UserContext";
import socket from "./socket";

const Participants = ({ clients, hostId, remoteHostId, micOn }) => {
  const hostClients = clients.filter((c) => c.hostId === remoteHostId);
  const otherClients = clients.filter((c) => c.hostId !== remoteHostId);

  return (
    <div className="w-full h-full relative box-border">
      <div className="h-full overflow-y-auto scrollbar-hide">
        {/* Host Section */}
        {hostClients.length > 0 && (
          <div className="mb-2">
            <div className="text-[#f2f2f2] font-semibold pl-2 mb-1">Host</div>
            <div className="flex flex-col items-center gap-0.5 cursor-pointer">
              {hostClients.map((client) => (
                <Client
                  key={client.socketId}
                  userName={client.name} // raw name for Avatar
                  micOn={client.micOn}
                  displayName={
                    client.socketId === socket.id
                      ? `${client.name} (you)`
                      : client.name
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Others Section */}
        {otherClients.length > 0 && (
          <div>
            <div className="text-[#f2f2f2] font-semibold pl-2 mb-1">
              Participants
            </div>
            <div className="flex flex-col items-center gap-0.5 cursor-pointer">
              {otherClients.map((client) => (
                <Client
                  key={client.socketId}
                  userName={client.name} // raw name for Avatar
                  micOn={client.micOn}
                  displayName={
                    client.socketId === socket.id
                      ? `${client.name} (you)`
                      : client.name
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Participants;
