// AudioPlayer.js
import React, { useState, useEffect, useRef } from 'react';

const AudioPlayer = ({ playlist }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioRef, setAudioRef] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  const loadAudio = (index) => {
    const audio = new Audio(playlist[index]);
    audio.currentTime = localStorage.getItem('lastPlayedPosition') || 0;
    setAudioRef(audio);
  };

  useEffect(() => {
    loadAudio(currentTrackIndex);
  }, [currentTrackIndex, playlist]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.play();
    } else {
      audioRef.pause();
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    const savePlaybackPosition = () => {
      localStorage.setItem('lastPlayedIndex', currentTrackIndex);
      localStorage.setItem('lastPlayedPosition', audioRef.currentTime);
    };

    audioRef.addEventListener('timeupdate', savePlaybackPosition);

    return () => {
      audioRef.removeEventListener('timeupdate', savePlaybackPosition);
    };
  }, [currentTrackIndex, audioRef]);

  const playPauseHandler = () => {
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
    localStorage.setItem('lastPlayedPosition', audioRef.currentTime);
  };

  const endedHandler = () => {
    nextTrackHandler();
  };

  // Ensure that the audioRef is updated when the playlist changes
  useEffect(() => {
    setAudioRef(new Audio());
  }, [playlist]);

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
    </div>
  );
};

export default AudioPlayer;
