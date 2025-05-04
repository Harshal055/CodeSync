import { useEffect, useRef } from "react";
import socket from "../Components/Terminal/socket";

const useVoiceChat = ({ roomId, clients, micOn, toggleKey }) => {
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef({});

  const getLocalStream = async () => {
    if (!localStreamRef.current) {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    }
    return localStreamRef.current;
  };

  const createPeer = (peerId, stream) => {
    const peer = new RTCPeerConnection();

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc-ice-candidate", {
          to: peerId,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      const audio = document.getElementById(`audio-${peerId}`);
      if (audio) {
        audio.srcObject = e.streams[0];
      }
    };

    peer.onsignalingstatechange = () => {
      console.log(`📶 Signaling state with ${peerId}:`, peer.signalingState);
    };

    return peer;
  };

  const renegotiatePeer = async (peer, peerId) => {
    try {
      if (peer.signalingState === "have-remote-offer") {
        console.warn("🔁 Skipping renegotiation: waiting for remote description");
        return;
      }

      if (peer.signalingState !== "stable") {
        console.warn("🧼 Rolling back to renegotiate");
        await peer.setLocalDescription({ type: "rollback" });
      }

      const offer = await peer.createOffer();
      if (peer.signalingState !== "stable") {
        console.warn("🛑 Cannot send offer — peer not stable");
        return;
      }

      await peer.setLocalDescription(offer);
      socket.emit("webrtc-offer", {
        to: peerId,
        sdp: peer.localDescription,
      });
    } catch (err) {
      console.error("❌ Failed to renegotiate peer", peerId, err);
    }
  };

  useEffect(() => {
    const setupVoice = async () => {
      Object.values(peersRef.current).forEach((peer) => peer.close());
      peersRef.current = {};

      const stream = await getLocalStream();

      for (const { socketId } of clients) {
        if (socketId === socket.id) continue;

        const peer = createPeer(socketId, stream);
        peersRef.current[socketId] = peer;

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("webrtc-offer", {
          to: socketId,
          sdp: peer.localDescription,
        });
      }
    };

    if (socket && roomId) {
      setupVoice();
    }

    socket.on("webrtc-offer", async ({ from, sdp }) => {
      let peer = peersRef.current[from];
      const stream = await getLocalStream();
    
      if (!peer) {
        peer = createPeer(from, stream);
        peersRef.current[from] = peer;
      }
    
      try {
        if (peer.signalingState === "have-local-offer") {
          console.warn("🛠️ Rolling back local offer before accepting remote offer");
          await peer.setLocalDescription({ type: "rollback" });
        }
    
        if (peer.signalingState !== "stable") {
          console.warn("🛑 Cannot apply offer — peer not stable");
          return;
        }
    
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
    
        socket.emit("webrtc-answer", {
          to: from,
          sdp: peer.localDescription,
        });
    
        if (pendingCandidatesRef.current[from]?.length) {
          pendingCandidatesRef.current[from].forEach((candidate) =>
            peer.addIceCandidate(new RTCIceCandidate(candidate))
          );
          delete pendingCandidatesRef.current[from];
        }
      } catch (err) {
        console.error("❌ Failed to handle offer:", err);
      }
    });        

    socket.on("webrtc-answer", async ({ from, sdp }) => {
      const peer = peersRef.current[from];
      if (!peer) return;
    
      try {
        if (peer.signalingState !== "have-local-offer") {
          console.warn("🛑 Cannot apply answer — not in 'have-local-offer' state");
          return;
        }
    
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    
        if (pendingCandidatesRef.current[from]?.length) {
          pendingCandidatesRef.current[from].forEach((candidate) =>
            peer.addIceCandidate(new RTCIceCandidate(candidate))
          );
          delete pendingCandidatesRef.current[from];
        }
      } catch (err) {
        console.error("❌ Failed to set remote answer SDP:", err);
      }
    });    

    socket.on("webrtc-ice-candidate", ({ from, candidate }) => {
      const peer = peersRef.current[from];
    
      if (peer?.remoteDescription?.type) {
        peer.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (!pendingCandidatesRef.current[from]) {
          pendingCandidatesRef.current[from] = [];
        }
        pendingCandidatesRef.current[from].push(candidate);
        console.warn("⚠️ ICE candidate buffered — peer not ready yet.");
      }
    });    

    return () => {
      Object.values(peersRef.current).forEach((peer) => peer.close());
      peersRef.current = {};

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [socket, roomId, clients, toggleKey]);

  useEffect(() => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = micOn;
    }

    if (micOn && audioTrack) {
      for (const socketId in peersRef.current) {
        const peer = peersRef.current[socketId];
        if (!peer) continue;

        const senders = peer.getSenders();
        const hasAudio = senders.some((s) => s.track?.kind === "audio");

        if (!hasAudio) {
          peer.addTrack(audioTrack, localStreamRef.current);
        }

        renegotiatePeer(peer, socketId);
      }
    }
  }, [micOn]);
};

export default useVoiceChat;
