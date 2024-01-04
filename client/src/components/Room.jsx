import React from 'react';
import { useParams } from 'react-router-dom';
import VideoChat from './VideoChat';

const Room = () => {
  const { roomId } = useParams();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <title>Document</title>
        <style>
          {`
            #video-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, 300px);
              grid-auto-rows: 300px;
            }

            video {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          `}
        </style>
      </head>
      <body>
        <VideoChat roomId={roomId} />
      </body>
    </html>
  );
};

export default Room;
