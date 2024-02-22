// App.js
import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';

const App = () => {
  const [playlist, setPlaylist] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    const fileURLs = [];
    for (const file of files) {
      fileURLs.push(URL.createObjectURL(file));
    }
    setPlaylist(fileURLs);
    setSelectedFiles(files);
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setSelectedFiles([]);
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={clearPlaylist}>Clear Playlist</button>
      {playlist.length > 0 && <AudioPlayer playlist={playlist} />}
    </div>
  );
};

export default App;
