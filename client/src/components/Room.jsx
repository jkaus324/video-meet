import { useParams } from "react-router-dom";
import VideoChat from "./VideoChat";
import { useRef } from "react";

const Room = () => {
  const { roomId } = useParams();
  const videoGridRef = useRef(null);

  <div>
    <div ref={videoGridRef} id="video-grid">
      <VideoChat roomId={roomId} />
    </div>
  </div>;
};

export default Room;
