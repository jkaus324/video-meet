// Room component
import React from 'react';
import { useParams } from 'react-router-dom';
import VideoChat from './VideoChat';

const Room = () => {
  const { roomId } = useParams();

  return (
    <div>
      <VideoChat roomId={roomId} />
    </div>
  );
};

export default Room;
