// src/AudioPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import { openDB } from 'idb';

const AudioPlayer = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const init = async () => {
      const db = await openDB('audioFiles', 1, {
        upgrade(db) {
          db.createObjectStore('files');
        },
      });

      const savedPlaylist = await db.getAll('files');
      setPlaylist(savedPlaylist.map((file) => file.name));

      const lastPlayedIndex = Number(localStorage.getItem('lastPlayedIndex')) || 0;
      setCurrentTrackIndex(lastPlayedIndex);
    };

    init();
  }, []);

  useEffect(() => {
    const loadAudio = async () => {
      const db = await openDB('audioFiles', 1);
      const file = await db.get('files', currentTrackIndex);

      if (file) {
        const blob = new Blob([file.data], { type: 'audio/mp3' });
        audioRef.current.src = URL.createObjectURL(blob);
        audioRef.current.currentTime = localStorage.getItem('lastPlayedPosition') || 0;

        if (isPlaying) {
          audioRef.current.play().catch((error) => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
          });
        }
      }
    };

    loadAudio();
  }, [currentTrackIndex, isPlaying]);

  useEffect(() => {
    const savePlaybackPosition = () => {
      localStorage.setItem('lastPlayedIndex', currentTrackIndex);
      localStorage.setItem('lastPlayedPosition', audioRef.current.currentTime);
    };

    audioRef.current.addEventListener('timeupdate', savePlaybackPosition);

    return () => {
      audioRef.current.removeEventListener('timeupdate', savePlaybackPosition);
    };
  }, [currentTrackIndex]);

  const playPauseHandler = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrackHandler = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0);
    }
  };

  const timeUpdateHandler = () => {
    localStorage.setItem('lastPlayedPosition', audioRef.current.currentTime);
  };

  const endedHandler = () => {
    nextTrackHandler();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileData = await file.arrayBuffer();

      const db = await openDB('audioFiles', 1);
      const transaction = db.transaction('files', 'readwrite');
      const store = transaction.objectStore('files');

      try {
        await store.clear();
        await store.add({ data: fileData }, 0);
      } catch (error) {
        console.error('Failed to clear IndexedDB store:', error);
      }

      setPlaylist([file.name]);
      setCurrentTrackIndex(0);
    }
  };

  return (
    <div>
      <h2>Now Playing: {playlist[currentTrackIndex]}</h2>
      <audio
        ref={audioRef}
        onTimeUpdate={timeUpdateHandler}
        onEnded={endedHandler}
      />
      <button onClick={playPauseHandler}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button onClick={nextTrackHandler}>Next</button>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileUpload(e)}
      />
    </div>
  );
};

export default AudioPlayer;
