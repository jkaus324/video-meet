// VideoChat component
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import { useRef } from "react";

const VideoChat = ({ roomId }) => {
  const socket = io.connect("http://localhost:3000")
  const videoGridRef = useRef(null);
  // const [videoGridRef,setvideoGridRef] = useState([]);
  const [myPeer, setMyPeer] = useState(
    new Peer({ secure: false, host: "/", port: 3002 })
  );
  const [peers, setPeers] = useState({});

  useEffect(() => {
    console.log("video chat is on");
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        console.log(".then is working")
        addVideoStream(myPeer.id, stream); // Add local user's video stream

        myPeer.on("call", (call) => {
          call.answer(stream);
          const userId = call.peer;
          peers[userId] = call;
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

        myPeer.on("open", (userId) => {
          console.log(userId);
          socket.emit("join-room", ({roomId, userId}));
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    return () => {
      // Cleanup or disconnect logic if needed
      myPeer.destroy();
      socket.disconnect();
    };
  }, [roomId, myPeer]);

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    peers[userId] = call;
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
    // setvideoGridRef([...videoGridRef,video]);
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
