import React, { useState } from 'react';
import TrackList from '../Tracklist/Tracklist';
import styles from './Playlist.module.css';

function Playlist({ playlist, onRemoveTrack, onNameChange, onSavePlaylist }) {
  const [name, setName] = useState(playlist?.name || ''); // Use optional chaining and a default value

  const handleNameChange = (event) => {
    setName(event.target.value);
    onNameChange(event.target.value);
  };

  return (
    <div className={styles.playlist}>
      <input
        value={name}
        onChange={handleNameChange}
        className={styles.playlistNameInput}
        placeholder="Playlist Name"
      />
      {playlist && ( // Conditionally render TrackList
        <TrackList
          tracks={playlist.tracks}
          onRemoveTrack={onRemoveTrack}
          isRemoval={true}
        />
      )}
      <button className={styles.playlistSaveButton} onClick={onSavePlaylist}>
        Save to Spotify
      </button>
    </div>
  );
}

export default Playlist;