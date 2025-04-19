import React from 'react';
import Track from '../Track/Track';
import styles from './Tracklist.module.css';

function TrackList({ tracks, onAddTrack, onRemoveTrack, isRemoval }) {
  return (
    <div className={styles.trackList}>
      {tracks.map((track) => (
        <Track
          key={track.id}
          track={track}
          onAdd={onAddTrack}
          onRemove={onRemoveTrack}
          isRemoval={isRemoval}
        />
      ))}
    </div>
  );
}

export default TrackList; 
