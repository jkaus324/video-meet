import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";

const VideoChat = ({ roomId }) => {
  const socket = io("/");
  const videoGridRef = useRef(null);
  const myPeer = new Peer(undefined, {
    host: "/",
    port: "3002",
  });

  const peers = {};

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        // Add local user's video stream
        addVideoStream(myPeer.id, stream);

        myPeer.on("call", (call) => {
          const userId = call.peer;

          // Answer the call and add user's video stream
          call.answer(stream);
          peers[userId] = call;
          call.on("stream", (userVideoStream) => {
            addVideoStream(userId, userVideoStream);
          });

          // Handle disconnection
          call.on("close", () => {
            removeVideoStream(userId);
          });
        });

        socket.on("user-connected", (userId) => {
          connectToNewUser(userId, stream);
        });

        socket.on("user-disconnected", (userId) => {
          if (peers[userId]) {
            peers[userId].close();
            removeVideoStream(userId);
          }
        });

        myPeer.on("open", (id) => {
          socket.emit("join-room", roomId, id);
        });
      })
      .catch((error) => {
        console.error("Error accessing user media:", error);
      });

    return () => {
      // Cleanup or disconnect logic if needed
      myPeer.disconnect();
      socket.disconnect();
    };
  }, [roomId, myPeer, socket, videoGridRef]);

  function connectToNewUser(userId, stream) {
    // Call the new user and add their video stream
    const call = myPeer.call(userId, stream);
    peers[userId] = call;
    call.on("stream", (userVideoStream) => {
      addVideoStream(userId, userVideoStream);
    });

    // Handle disconnection
    call.on("close", () => {
      removeVideoStream(userId);
    });
  }

  function addVideoStream(userId, stream) {
    if (videoGridRef.current) {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
      videoGridRef.current.appendChild(video);
    }
  }
  

  function removeVideoStream(userId) {
    const videoToRemove = document.getElementById(userId);
    if (videoToRemove) {
      videoToRemove.remove();
    }
  }

  return () => {
    // Cleanup or disconnect logic if needed
    Object.values(peers).forEach((peer) => peer.close());
    myPeer.destroy();
    socket.disconnect();
  };
};

export default VideoChat;
