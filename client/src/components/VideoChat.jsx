import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";

const VideoChat = ({ roomId }) => {
  const socket = io("/");
  const videoGridRef = useRef(null);
  const myPeer = new Peer(undefined, {
    host: "/",
    port: "3001",
  });

  const peers = {};

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        addVideoStream(myPeer.id, stream); // Add local user's video stream

        myPeer.on("call", (call) => {
          call.answer(stream);
          const userId = call.peer;
          peers[userId] = call;
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(userId, userVideoStream);
          });
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
      });

    return () => {
      // Cleanup or disconnect logic if needed
      myPeer.disconnect();
      socket.disconnect();
    };
  }, [roomId, myPeer]);

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    peers[userId] = call;
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(userId, userVideoStream);
    });
    call.on("close", () => {
      removeVideoStream(userId);
    });
  }

  function addVideoStream(userId, stream) {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGridRef.current.appendChild(video);
  }

  function removeVideoStream(userId) {
    const videoToRemove = document.getElementById(userId);
    if (videoToRemove) {
      videoToRemove.remove();
    }
  }

  return (
    <div>
      <div ref={videoGridRef} id="video-grid"></div>
    </div>
  );
};

export default VideoChat;
